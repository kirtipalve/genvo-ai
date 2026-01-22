import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Landing } from "@/app/pages/Landing";
import { Dashboard } from "@/app/pages/Dashboard";
import { NewProject } from "@/app/pages/NewProject";
import { ProjectView } from "@/app/pages/ProjectView";
import { Generate } from "@/app/pages/Generate";
import { Explore } from "@/app/pages/Explore";
import { Branches } from "@/app/pages/Branches";
import { Compare } from "@/app/pages/Compare";
import { Merge } from "@/app/pages/Merge";
import { AppLayout } from "@/app/layouts/AppLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page - no sidebar */}
        <Route path="/" element={<Landing />} />

        {/* App pages - with sidebar */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/new" element={<NewProject />} />
          <Route path="/project/:id" element={<ProjectView />} />
          <Route path="/project/:id/generate" element={<Generate />} />
          <Route path="/project/:id/branches" element={<Branches />} />
          <Route path="/project/:id/compare" element={<Compare />} />
          <Route path="/project/:id/merge" element={<Merge />} />
          <Route path="/explore" element={<Explore />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
