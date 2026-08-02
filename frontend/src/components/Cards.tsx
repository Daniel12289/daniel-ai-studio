import { MoreVertical, Copy, Pencil, Trash2, Download } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Project, Template } from "../types";

export function ProjectCard({
  project, onDuplicate, onRename, onDelete, onDownload,
}: {
  project: Project;
  onDuplicate: () => void;
  onRename: () => void;
  onDelete: () => void;
  onDownload: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="card p-4 relative hover:border-amber/40 transition group">
      <Link to={`/editor/${project.id}`} className="block">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] uppercase tracking-wider font-mono text-cyan">{project.framework}</span>
          <span className="text-[10px] text-ash-700 font-mono">
            {new Date(project.updatedAt).toLocaleDateString()}
          </span>
        </div>
        <h3 className="font-display font-semibold text-sm truncate mb-1">{project.name}</h3>
        <p className="text-xs text-ash-500 line-clamp-2">{project.description}</p>
      </Link>

      <button
        onClick={() => setMenuOpen((v) => !v)}
        className="absolute top-4 right-4 text-ash-700 hover:text-ash-50 opacity-0 group-hover:opacity-100 transition"
        aria-label="Project actions"
      >
        <MoreVertical size={16} />
      </button>

      {menuOpen && (
        <div className="absolute top-10 right-4 z-10 card p-1 w-40 shadow-glow">
          <MenuItem icon={Pencil} label="Rename" onClick={() => { onRename(); setMenuOpen(false); }} />
          <MenuItem icon={Copy} label="Duplicate" onClick={() => { onDuplicate(); setMenuOpen(false); }} />
          <MenuItem icon={Download} label="Download ZIP" onClick={() => { onDownload(); setMenuOpen(false); }} />
          <MenuItem icon={Trash2} label="Delete" danger onClick={() => { onDelete(); setMenuOpen(false); }} />
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick, danger }: { icon: any; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-xs hover:bg-surface-hi ${
        danger ? "text-danger" : "text-ash-300"
      }`}
    >
      <Icon size={13} /> {label}
    </button>
  );
}

export function TemplateCard({ template, onUse }: { template: Template; onUse: () => void }) {
  return (
    <div className="card p-4 flex flex-col hover:border-amber/40 transition">
      <span className="text-[10px] uppercase tracking-wider font-mono text-cyan mb-2">{template.category}</span>
      <h3 className="font-display font-semibold text-sm mb-1">{template.name}</h3>
      <p className="text-xs text-ash-500 flex-1 mb-4">{template.description}</p>
      <button onClick={onUse} className="btn-primary text-xs !py-2">
        Use template
      </button>
    </div>
  );
}
