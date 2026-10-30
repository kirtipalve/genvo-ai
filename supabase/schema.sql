-- Genvo cloud projects: run once in Supabase → SQL Editor.
-- Safe to re-run: every statement is idempotent.

-- Projects and who can open them ------------------------------------------

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  client text check (char_length(client) <= 200),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  invite_code text not null unique default encode(extensions.gen_random_bytes(12), 'hex'),
  created_at timestamptz not null default now()
);

create table if not exists public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'editor' check (role in ('owner', 'editor')),
  joined_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

-- The version graph, one row per version or branch. `updated_at` (ms) is the
-- last-writer-wins key, the same rule the canvas uses for live merges, so two
-- people editing different versions never overwrite each other.
create table if not exists public.graph_items (
  project_id uuid not null references public.projects(id) on delete cascade,
  kind text not null check (kind in ('version', 'branch')),
  id text not null check (char_length(id) <= 64),
  data jsonb not null,
  updated_at bigint not null,
  primary key (project_id, kind, id)
);

create or replace function public.is_member(p uuid) returns boolean
  language sql stable security definer set search_path = public
  as $$ select exists (select 1 from project_members where project_id = p and user_id = auth.uid()) $$;

-- The creator becomes the owner.
create or replace function public.add_owner() returns trigger
  language plpgsql security definer set search_path = public
  as $$ begin
    insert into project_members (project_id, user_id, role) values (new.id, new.owner_id, 'owner');
    return new;
  end $$;
drop trigger if exists projects_add_owner on public.projects;
create trigger projects_add_owner after insert on public.projects
  for each row execute function public.add_owner();

alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.graph_items enable row level security;

drop policy if exists "members read projects" on public.projects;
create policy "members read projects" on public.projects
  for select to authenticated using (owner_id = auth.uid() or is_member(id));
drop policy if exists "users create projects" on public.projects;
create policy "users create projects" on public.projects
  for insert to authenticated with check (owner_id = auth.uid());
drop policy if exists "owners update projects" on public.projects;
create policy "owners update projects" on public.projects
  for update to authenticated using (owner_id = auth.uid());

drop policy if exists "members read members" on public.project_members;
create policy "members read members" on public.project_members
  for select to authenticated using (is_member(project_id));

drop policy if exists "members read graph" on public.graph_items;
create policy "members read graph" on public.graph_items
  for select to authenticated using (is_member(project_id));

-- Writes go through these functions -----------------------------------------

-- Upsert graph rows, keeping whichever copy of each row is newer.
create or replace function public.save_graph_items(p uuid, items jsonb) returns void
  language plpgsql security definer set search_path = public
  as $$ begin
    if not is_member(p) then raise exception 'not a member of this project'; end if;
    insert into graph_items (project_id, kind, id, data, updated_at)
      select p, i->>'kind', i->>'id', i->'data', (i->>'updated_at')::bigint
      from jsonb_array_elements(items) i
    on conflict (project_id, kind, id) do update
      set data = excluded.data, updated_at = excluded.updated_at
      where graph_items.updated_at < excluded.updated_at;
  end $$;

-- Join a project from its invite link; returns the project id.
create or replace function public.join_project(code text) returns uuid
  language plpgsql security definer set search_path = public
  as $$ declare pid uuid;
  begin
    if auth.uid() is null then raise exception 'sign in first'; end if;
    select id into pid from projects where invite_code = code;
    if pid is null then raise exception 'invite link is invalid'; end if;
    insert into project_members (project_id, user_id) values (pid, auth.uid())
      on conflict do nothing;
    return pid;
  end $$;

-- Daily generation allowance --------------------------------------------------

create table if not exists public.generation_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null default current_date,
  count int not null default 0,
  primary key (user_id, day)
);
alter table public.generation_usage enable row level security;

-- Called by /api/generate with the user's token. Returns false once today's
-- allowance is used up. Guests (anonymous sign-ins) get fewer renders.
create or replace function public.consume_generation() returns boolean
  language plpgsql security definer set search_path = public
  as $$ declare
    allowance int := case when coalesce((auth.jwt()->>'is_anonymous')::boolean, false) then 3 else 10 end;
    used int;
  begin
    if auth.uid() is null then return false; end if;
    insert into generation_usage (user_id) values (auth.uid()) on conflict do nothing;
    update generation_usage set count = count + 1
      where user_id = auth.uid() and day = current_date and count < allowance
      returning count into used;
    return used is not null;
  end $$;

revoke all on function public.save_graph_items(uuid, jsonb) from public, anon;
revoke all on function public.join_project(text) from public, anon;
revoke all on function public.consume_generation() from public, anon;
grant execute on function public.save_graph_items(uuid, jsonb) to authenticated;
grant execute on function public.join_project(text) to authenticated;
grant execute on function public.consume_generation() to authenticated;

-- Media storage ----------------------------------------------------------------
-- Private bucket; files live under <project_id>/… and only that project's
-- members can upload or view them (the app uses short-lived signed links).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', false, 52428800,
        array['video/mp4', 'video/quicktime', 'video/webm', 'image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.member_of_path(path text) returns boolean
  language plpgsql stable security definer set search_path = public
  as $$ declare pid uuid;
  begin
    pid := (storage.foldername(path))[1]::uuid;
    return is_member(pid);
  exception when others then
    return false;
  end $$;

drop policy if exists "members read media" on storage.objects;
create policy "members read media" on storage.objects
  for select to authenticated using (bucket_id = 'media' and member_of_path(name));
drop policy if exists "members upload media" on storage.objects;
create policy "members upload media" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and member_of_path(name));
