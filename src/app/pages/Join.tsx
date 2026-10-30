import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CenteredCard, RequireAuth } from "@/app/components/SignIn";
import { joinProject } from "@/app/studio/cloud/cloudProject";

// Invite links: /join/:code adds you to the project, then opens it.
export function Join() {
  const { code = "" } = useParams();
  return (
    <RequireAuth title="You've been invited to a Genvo project" returnTo={`/join/${code}`}>
      <Joining code={code} />
    </RequireAuth>
  );
}

function Joining({ code }: { code: string }) {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    joinProject(code)
      .then((id) => navigate(`/p/${id}`, { replace: true }))
      .catch((e) => setError(e.message));
  }, [code, navigate]);

  return (
    <CenteredCard>
      {error ? (
        <>
          <p className="text-sm text-red-600">{error}</p>
          <Link to="/projects" className="mt-2 inline-block text-sm underline">Go to your projects</Link>
        </>
      ) : (
        <p className="text-sm text-black/50">Joining project…</p>
      )}
    </CenteredCard>
  );
}
