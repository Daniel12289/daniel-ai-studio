import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { Topbar } from "../components/Topbar";
import { TemplateCard } from "../components/Cards";
import { templates } from "../lib/templates";

export default function Templates() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("All");
  const categories = ["All", ...Array.from(new Set(templates.map((t) => t.category)))];
  const filtered = category === "All" ? templates : templates.filter((t) => t.category === category);

  return (
    <AppShell>
      <Topbar title="Templates" />
      <div className="px-6 py-8 max-w-6xl mx-auto">
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`text-xs px-3 py-1.5 rounded-full border transition ${
                category === c ? "border-amber text-amber bg-amber/10" : "border-surface-line text-ash-500 hover:text-ash-50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              onUse={() =>
                navigate("/dashboard", { state: { prompt: t.prompt, framework: t.framework, templateId: t.id } })
              }
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
