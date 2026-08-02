import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Rocket } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../hooks/useSettings";
import { getProject, updateProjectFiles } from "../lib/projects";
import { downloadProjectAsZip } from "../lib/zip";
import { api } from "../lib/api";
import { FileTree } from "../components/FileTree";
import { CodeEditorPanel } from "../components/CodeEditorPanel";
import { LivePreview } from "../components/LivePreview";
import { ChatPanel } from "../components/ChatPanel";
import { Project, ProjectFile, ChatMessage } from "../types";

export default function EditorWorkspace() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [openPaths, setOpenPaths] = useState<string[]>([]);
  const [activePath, setActivePath] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!user || !projectId) return;
    getProject(user.uid, projectId).then((p) => {
      if (!p) return;
      setProject(p);
      setFiles(p.files);
      const first = p.files[0]?.path || null;
      setOpenPaths(first ? [first] : []);
      setActivePath(first);
    });
  }, [user, projectId]);

  const persist = useCallback(
    (nextFiles: ProjectFile[]) => {
      if (!user || !projectId || !settings.autosave) return;
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        await updateProjectFiles(user.uid, projectId, nextFiles);
        setSavedAt(Date.now());
      }, 800);
    },
    [user, projectId, settings.autosave]
  );

  const mergeFiles = (incoming: ProjectFile[], base: ProjectFile[]) => {
    const map = new Map(base.map((f) => [f.path, f]));
    incoming.forEach((f) => map.set(f.path, f));
    return Array.from(map.values());
  };

  const handleEditorChange = (path: string, content: string) => {
    setFiles((prev) => {
      const next = prev.map((f) => (f.path === path ? { ...f, content } : f));
      persist(next);
      return next;
    });
  };

  const handleSelect = (path: string) => {
    setActivePath(path);
    setOpenPaths((prev) => (prev.includes(path) ? prev : [...prev, path]));
  };

  const handleCreate = (path: string) => {
    setFiles((prev) => {
      if (prev.some((f) => f.path === path)) return prev;
      const next = [...prev, { path, content: "" }];
      persist(next);
      return next;
    });
    handleSelect(path);
  };

  const handleRename = (oldPath: string, newPath: string) => {
    setFiles((prev) => {
      const next = prev.map((f) => (f.path === oldPath ? { ...f, path: newPath } : f));
      persist(next);
      return next;
    });
    setOpenPaths((prev) => prev.map((p) => (p === oldPath ? newPath : p)));
    if (activePath === oldPath) setActivePath(newPath);
  };

  const handleDelete = (path: string) => {
    setFiles((prev) => {
      const next = prev.filter((f) => f.path !== path);
      persist(next);
      return next;
    });
    setOpenPaths((prev) => prev.filter((p) => p !== path));
    if (activePath === path) setActivePath(null);
  };

  const runAI = async (
    kind: "edit" | "fix" | "redesign",
    instruction: string,
    userLabel?: string
  ) => {
    if (!project) return;
    setBusy(true);
    setError("");
    if (userLabel) {
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", content: userLabel, createdAt: Date.now() }]);
    }
    try {
      const result =
        kind === "edit"
          ? await api.editProject(instruction, project.framework, files)
          : kind === "fix"
          ? await api.fixProject(project.framework, files)
          : await api.redesignProject(instruction, project.framework, files);

      const next = mergeFiles(result.files, files);
      setFiles(next);
      persist(next);
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: result.explanation || result.summary || "Updated the project.",
          createdAt: Date.now(),
        },
      ]);
    } catch (err: any) {
      setError(err.message || "That request failed. Try again.");
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "assistant", content: `Failed: ${err.message}`, createdAt: Date.now() },
      ]);
    } finally {
      setBusy(false);
    }
  };

  if (!project) {
    return <div className="min-h-screen grid place-items-center text-ash-500 font-mono text-sm console-cursor">loading project</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-ink">
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-surface-line">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate("/projects")} className="text-ash-500 hover:text-ash-50" aria-label="Back to projects">
            <ArrowLeft size={16} />
          </button>
          <span className="font-display font-medium text-sm truncate">{project.name}</span>
          <span className="text-[10px] uppercase font-mono text-cyan border border-cyan/30 rounded-full px-2 py-0.5">
            {project.framework}
          </span>
          {savedAt && <span className="text-[10px] text-ash-700 font-mono">saved</span>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => downloadProjectAsZip(project.name, files)} className="btn-secondary !px-3 !py-1.5 text-xs">
            <Download size={13} /> Export
          </button>
          <button
            onClick={() => alert("Connect a Vercel or Firebase Hosting account in Settings to enable one-click deploy.")}
            className="btn-primary !px-3 !py-1.5 text-xs"
          >
            <Rocket size={13} /> Deploy
          </button>
        </div>
      </header>

      {error && <p className="text-xs text-danger bg-danger/10 px-4 py-1.5">{error}</p>}

      <div className="flex-1 grid" style={{ gridTemplateColumns: "220px 1fr 1fr 320px" }}>
        <div className="border-r border-surface-line overflow-hidden">
          <FileTree
            files={files}
            activePath={activePath}
            onSelect={handleSelect}
            onCreate={handleCreate}
            onRename={handleRename}
            onDelete={handleDelete}
          />
        </div>
        <div className="border-r border-surface-line overflow-hidden">
          <CodeEditorPanel
            files={files}
            openPaths={openPaths}
            activePath={activePath}
            onOpenPathsChange={setOpenPaths}
            onActivePathChange={setActivePath}
            onChange={handleEditorChange}
            fontSize={settings.fontSize}
            theme={settings.editorTheme}
          />
        </div>
        <div className="border-r border-surface-line overflow-hidden">
          <LivePreview framework={project.framework} files={files} />
        </div>
        <div className="overflow-hidden">
          <ChatPanel
            messages={messages}
            busy={busy}
            onSend={(text) => runAI("edit", text, text)}
            onFix={() => runAI("fix", "", "Fix project")}
            onRedesign={(instruction) => runAI("redesign", instruction, instruction)}
          />
        </div>
      </div>
    </div>
  );
}
