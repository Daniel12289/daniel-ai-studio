import { useState } from "react";
import Editor from "@monaco-editor/react";
import { X, Columns2 } from "lucide-react";
import { ProjectFile } from "../types";

interface CodeEditorPanelProps {
  files: ProjectFile[];
  openPaths: string[];
  activePath: string | null;
  onOpenPathsChange: (paths: string[]) => void;
  onActivePathChange: (path: string) => void;
  onChange: (path: string, content: string) => void;
  fontSize: number;
  theme: "vs-dark" | "light" | "hc-black";
}

function languageFor(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    js: "javascript", jsx: "javascript", ts: "typescript", tsx: "typescript",
    html: "html", css: "css", json: "json", md: "markdown", vue: "html",
  };
  return map[ext || ""] || "plaintext";
}

export function CodeEditorPanel({
  files, openPaths, activePath, onOpenPathsChange, onActivePathChange, onChange, fontSize, theme,
}: CodeEditorPanelProps) {
  const [splitPath, setSplitPath] = useState<string | null>(null);

  const closeTab = (path: string) => {
    const next = openPaths.filter((p) => p !== path);
    onOpenPathsChange(next);
    if (activePath === path) onActivePathChange(next[next.length - 1] || "");
    if (splitPath === path) setSplitPath(null);
  };

  const fileByPath = (path: string) => files.find((f) => f.path === path);
  const active = activePath ? fileByPath(activePath) : null;
  const split = splitPath ? fileByPath(splitPath) : null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center border-b border-surface-line bg-surface overflow-x-auto">
        {openPaths.map((path) => (
          <button
            key={path}
            onClick={() => onActivePathChange(path)}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-mono border-r border-surface-line whitespace-nowrap ${
              activePath === path ? "bg-ink text-amber" : "text-ash-500 hover:text-ash-50"
            }`}
          >
            {path}
            <X
              size={12}
              onClick={(e) => {
                e.stopPropagation();
                closeTab(path);
              }}
              className="hover:text-danger"
            />
          </button>
        ))}
        <div className="ml-auto px-2 flex items-center gap-1">
          {active && (
            <button
              onClick={() => setSplitPath(splitPath ? null : activePath)}
              className="text-ash-500 hover:text-cyan p-1.5"
              aria-label="Toggle split editor"
              title="Split editor"
            >
              <Columns2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 grid" style={{ gridTemplateColumns: split ? "1fr 1fr" : "1fr" }}>
        {active ? (
          <Editor
            path={active.path}
            language={languageFor(active.path)}
            value={active.content}
            theme={theme}
            onChange={(v) => onChange(active.path, v ?? "")}
            options={{ fontSize, minimap: { enabled: true }, automaticLayout: true, wordWrap: "on" }}
          />
        ) : (
          <div className="grid place-items-center text-ash-700 text-sm font-mono">
            Select a file to start editing
          </div>
        )}
        {split && (
          <Editor
            path={`split:${split.path}`}
            language={languageFor(split.path)}
            value={split.content}
            theme={theme}
            onChange={(v) => onChange(split.path, v ?? "")}
            options={{ fontSize, minimap: { enabled: false }, automaticLayout: true, wordWrap: "on" }}
            className="border-l border-surface-line"
          />
        )}
      </div>
    </div>
  );
}
