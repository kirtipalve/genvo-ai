import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Studio } from "@/app/pages/Studio";
import { Landing } from "@/app/pages/Landing";
import { Waitlist } from "@/app/pages/Waitlist";
import { WaitlistAdmin } from "@/app/pages/WaitlistAdmin";
import { Dashboard } from "@/app/pages/Dashboard";
import { NewProject } from "@/app/pages/NewProject";
import { ProjectView } from "@/app/pages/ProjectView";
import { Generate } from "@/app/pages/Generate";
import { Explore } from "@/app/pages/Explore";
import { Branches } from "@/app/pages/Branches";
import { Compare } from "@/app/pages/Compare";
import { Merge } from "@/app/pages/Merge";
import { Storyboard } from "@/app/pages/Storyboard";
import { AppLayout } from "@/app/layouts/AppLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page - no sidebar */}
        <Route path="/" element={<Landing />} />
        <Route path="/waitlist" element={<Waitlist />} />
        <Route path="/waitlist/admin" element={<WaitlistAdmin />} />

        {/* Studio canvas - full screen */}
        <Route path="/project/:id" element={<Studio />} />
        <Route path="/demo" element={<Navigate to="/project/aurora-runner?demo=1" replace />} />

        {/* App pages - with sidebar */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/new" element={<NewProject />} />
          <Route path="/project/:id/overview" element={<ProjectView />} />
          <Route path="/project/:id/generate" element={<Generate />} />
          <Route path="/project/:id/branches" element={<Branches />} />
          <Route path="/project/:id/compare" element={<Compare />} />
          <Route path="/project/:id/merge" element={<Merge />} />
          <Route path="/project/:id/storyboard" element={<Storyboard />} />
          <Route path="/explore" element={<Explore />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
