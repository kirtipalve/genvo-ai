import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CloudStudio, Studio } from "@/app/pages/Studio";
import { Projects } from "@/app/pages/Projects";
import { Join } from "@/app/pages/Join";
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
import { Demo } from "@/app/pages/Demo";
import { Settings } from "@/app/pages/Settings";
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
        <Route path="/p/:id" element={<CloudStudio />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/login" element={<Navigate to="/projects" replace />} />
        <Route path="/join/:code" element={<Join />} />
        <Route path="/demo" element={<Navigate to="/project/aurora-runner?demo=1" replace />} />

        {/* Demo walkthrough - no sidebar */}
        <Route path="/walkthrough" element={<Demo />} />

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
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
