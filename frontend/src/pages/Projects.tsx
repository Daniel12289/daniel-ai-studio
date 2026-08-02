import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { Topbar } from "../components/Topbar";
import { ProjectCard } from "../components/Cards";
import { useAuth } from "../context/AuthContext";
import { listProjects, duplicateProject, renameProject, deleteProject } from "../lib/projects";
import { downloadProjectAsZip } from "../lib/zip";
import { Project } from "../types";

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!user) return;
    setLoading(true);
    setProjects(await listProjects(user.uid));
    setLoading(false);
  };

  useEffect(() => { refresh(); }, [user]);

  return (
    <AppShell>
      <Topbar
        title="My Projects"
        actions={
          <Link to="/dashboard" className="btn-primary text-sm !py-2">
            New Project
          </Link>
        }
      />
      <div className="px-6 py-8 max-w-6xl mx-auto">
        {loading ? (
          <p className="text-sm text-ash-500 font-mono console-cursor">loading projects</p>
        ) : projects.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-ash-500 text-sm mb-4">No projects yet — describe something to build.</p>
            <Link to="/dashboard" className="btn-primary text-sm !py-2 inline-flex">New Project</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                onDownload={() => downloadProjectAsZip(p.name, p.files)}
                onDuplicate={async () => { if (user) { await duplicateProject(user.uid, p); refresh(); } }}
                onRename={async () => {
                  const name = window.prompt("Rename project", p.name);
                  if (name && user) { await renameProject(user.uid, p.id, name); refresh(); }
                }}
                onDelete={async () => {
                  if (user && window.confirm(`Delete "${p.name}"? This can't be undone.`)) {
                    await deleteProject(user.uid, p.id);
                    refresh();
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
