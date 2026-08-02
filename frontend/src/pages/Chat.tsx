import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { Topbar } from "../components/Topbar";
import { ChatPanel } from "../components/ChatPanel";
import { LivePreview } from "../components/LivePreview";
import { useAuth } from "../context/AuthContext";
import { listProjects, updateProjectFiles } from "../lib/projects";
import { api } from "../lib/api";
import { Project, ChatMessage, ProjectFile } from "../types";

export default function Chat() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    listProjects(user.uid).then((p) => {
      setProjects(p);
      if (p[0]) {
        setSelectedId(p[0].id);
        setFiles(p[0].files);
      }
    });
  }, [user]);

  const selected = projects.find((p) => p.id === selectedId);

  const mergeFiles = (incoming: ProjectFile[], base: ProjectFile[]) => {
    const map = new Map(base.map((f) => [f.path, f]));
    incoming.forEach((f) => map.set(f.path, f));
    return Array.from(map.values());
  };

  const runEdit = async (instruction: string) => {
    if (!selected || !user) return;
    setBusy(true);
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", content: instruction, createdAt: Date.now() }]);
    try {
      const result = await api.editProject(instruction, selected.framework, files);
      const next = mergeFiles(result.files, files);
      setFiles(next);
      await updateProjectFiles(user.uid, selected.id, next);
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "assistant", content: result.summary, createdAt: Date.now() },
      ]);
    } catch (err: any) {
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "assistant", content: `Failed: ${err.message}`, createdAt: Date.now() },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <Topbar
        title="AI Chat"
        actions={
          <select
            className="input !w-auto !py-2 text-xs"
            value={selectedId}
            onChange={(e) => {
              const p = projects.find((pr) => pr.id === e.target.value);
              setSelectedId(e.target.value);
              setFiles(p?.files || []);
              setMessages([]);
            }}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        }
      />
      {!selected ? (
        <div className="p-10 text-sm text-ash-500">Create a project first to chat with the AI about it.</div>
      ) : (
        <div className="grid md:grid-cols-2 h-[calc(100vh-65px)]">
          <div className="border-r border-surface-line">
            <ChatPanel
              messages={messages}
              busy={busy}
              onSend={runEdit}
              onFix={() => runEdit("Find and fix all bugs in this project.")}
              onRedesign={runEdit}
            />
          </div>
          <LivePreview framework={selected.framework} files={files} />
        </div>
      )}
    </AppShell>
  );
}
