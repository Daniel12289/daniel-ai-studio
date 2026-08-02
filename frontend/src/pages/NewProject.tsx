import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { Topbar } from "../components/Topbar";
import { StatusConsole } from "../components/StatusConsole";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { createProject } from "../lib/projects";
import { Framework } from "../types";

const FRAMEWORKS: { value: Framework; label: string }[] = [
  { value: "html-css-js", label: "HTML / CSS / JavaScript" },
  { value: "react", label: "React" },
  { value: "nextjs", label: "Next.js" },
  { value: "vue", label: "Vue" },
];

export default function NewProject() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = (location.state as { prompt?: string; framework?: Framework; templateId?: string } | null) || null;

  const [name, setName] = useState("");
  const [framework, setFramework] = useState<Framework>(prefill?.framework || "html-css-js");
  const [description, setDescription] = useState(prefill?.prompt || "");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError("");
    setGenerating(true);
    try {
      const result = await api.generateProject(name || "Untitled project", framework, description);
      const id = await createProject(user.uid, {
        name: name || "Untitled project",
        description,
        framework,
        files: result.files,
        templateId: prefill?.templateId || null,
      });
      navigate(`/editor/${id}`);
    } catch (err: any) {
      setError(err.message || "Generation failed. Try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <AppShell>
      <Topbar title="New Project" />
      <div className="max-w-2xl mx-auto px-6 py-10">
        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="label block mb-1.5">Project name</label>
            <input className="input" placeholder="My restaurant site" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label className="label block mb-1.5">Framework</label>
            <div className="grid grid-cols-2 gap-2">
              {FRAMEWORKS.map((f) => (
                <button
                  type="button"
                  key={f.value}
                  onClick={() => setFramework(f.value)}
                  className={`rounded-xl border px-3 py-2.5 text-sm text-left transition ${
                    framework === f.value
                      ? "border-amber text-amber bg-amber/10"
                      : "border-surface-line text-ash-300 hover:border-ash-700"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label block mb-1.5">Describe what to build</label>
            <textarea
              className="input min-h-[120px] resize-y"
              placeholder="Build a beautiful restaurant website with dark mode."
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {error && <p className="text-xs text-danger bg-danger/10 rounded-lg px-3 py-2">{error}</p>}

          <button className="btn-primary w-full" disabled={generating}>
            {generating ? "Generating..." : "Generate"}
          </button>
        </form>

        {generating && (
          <div className="mt-6">
            <StatusConsole active={generating} />
          </div>
        )}
      </div>
    </AppShell>
  );
}
