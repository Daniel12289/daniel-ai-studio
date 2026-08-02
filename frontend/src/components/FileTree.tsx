import { useState } from "react";
import { File, FilePlus, Trash2, Pencil } from "lucide-react";
import { ProjectFile } from "../types";

interface FileTreeProps {
  files: ProjectFile[];
  activePath: string | null;
  onSelect: (path: string) => void;
  onCreate: (path: string) => void;
  onRename: (oldPath: string, newPath: string) => void;
  onDelete: (path: string) => void;
}

export function FileTree({ files, activePath, onSelect, onCreate, onRename, onDelete }: FileTreeProps) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const sorted = [...files].sort((a, b) => a.path.localeCompare(b.path));

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-surface-line">
        <span className="label">Files</span>
        <button
          onClick={() => setCreating(true)}
          className="text-ash-500 hover:text-amber transition"
          aria-label="Create file"
        >
          <FilePlus size={15} />
        </button>
      </div>

      {creating && (
        <form
          className="p-2 border-b border-surface-line"
          onSubmit={(e) => {
            e.preventDefault();
            if (newName.trim()) onCreate(newName.trim());
            setNewName("");
            setCreating(false);
          }}
        >
          <input
            autoFocus
            className="input !py-1.5 !text-xs"
            placeholder="new-file.js"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={() => setCreating(false)}
          />
        </form>
      )}

      <ul className="flex-1 overflow-y-auto py-1">
        {sorted.map((f) => (
          <li key={f.path} className="group">
            {renaming === f.path ? (
              <form
                className="px-2 py-1"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (renameValue.trim()) onRename(f.path, renameValue.trim());
                  setRenaming(null);
                }}
              >
                <input
                  autoFocus
                  className="input !py-1 !text-xs"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={() => setRenaming(null)}
                />
              </form>
            ) : (
              <div
                className={`flex items-center justify-between px-3 py-1.5 text-sm cursor-pointer rounded-lg mx-1 ${
                  activePath === f.path ? "bg-amber/10 text-amber" : "text-ash-300 hover:bg-surface-hi"
                }`}
                onClick={() => onSelect(f.path)}
              >
                <span className="flex items-center gap-2 truncate">
                  <File size={13} className="shrink-0" />
                  <span className="truncate font-mono text-xs">{f.path}</span>
                </span>
                <span className="hidden group-hover:flex items-center gap-1 shrink-0">
                  <button
                    aria-label={`Rename ${f.path}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setRenaming(f.path);
                      setRenameValue(f.path);
                    }}
                    className="text-ash-500 hover:text-ash-50"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    aria-label={`Delete ${f.path}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(f.path);
                    }}
                    className="text-ash-500 hover:text-danger"
                  >
                    <Trash2 size={12} />
                  </button>
                </span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
