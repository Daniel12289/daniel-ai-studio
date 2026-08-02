import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { Topbar } from "../components/Topbar";
import { adminApi } from "../lib/adminApi";

export default function Admin() {
  const [tab, setTab] = useState<"users" | "projects" | "stats">("stats");
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [stats, setStats] = useState<{ totalUsers: number; disabledUsers: number; totalProjects: number } | null>(null);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    try {
      if (tab === "users") setUsers((await adminApi.listUsers()).users);
      if (tab === "projects") setProjects((await adminApi.listProjects()).projects);
      if (tab === "stats") setStats(await adminApi.stats());
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => { load(); }, [tab]);

  return (
    <AppShell>
      <Topbar title="Admin Panel" />
      <div className="px-6 py-8 max-w-5xl mx-auto">
        <div className="flex gap-2 mb-6">
          {(["stats", "users", "projects"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-xs px-3 py-1.5 rounded-full border capitalize transition ${
                tab === t ? "border-amber text-amber bg-amber/10" : "border-surface-line text-ash-500"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {error && <p className="text-xs text-danger bg-danger/10 rounded-lg px-3 py-2 mb-4">{error}</p>}

        {tab === "stats" && stats && (
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Total users" value={stats.totalUsers} />
            <StatCard label="Suspended" value={stats.disabledUsers} />
            <StatCard label="Total projects" value={stats.totalProjects} />
          </div>
        )}

        {tab === "users" && (
          <div className="card divide-y divide-surface-line">
            {users.map((u) => (
              <div key={u.uid} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm">{u.email}</p>
                  <p className="text-xs text-ash-700 font-mono">{u.uid}</p>
                </div>
                <button
                  onClick={async () => {
                    await adminApi.suspendUser(u.uid, !u.disabled);
                    load();
                  }}
                  className={`text-xs px-3 py-1.5 rounded-lg border ${
                    u.disabled ? "border-cyan/40 text-cyan" : "border-danger/40 text-danger"
                  }`}
                >
                  {u.disabled ? "Reinstate" : "Suspend"}
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === "projects" && (
          <div className="card divide-y divide-surface-line">
            {projects.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm">{p.name}</p>
                  <p className="text-xs text-ash-700 font-mono">owner: {p.ownerUid}</p>
                </div>
                <button
                  onClick={async () => {
                    if (window.confirm(`Delete project "${p.name}"?`)) {
                      await adminApi.deleteProject(p.ownerUid, p.id);
                      load();
                    }
                  }}
                  className="text-xs px-3 py-1.5 rounded-lg border border-danger/40 text-danger"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-5">
      <p className="label mb-2">{label}</p>
      <p className="text-2xl font-display font-semibold text-amber">{value}</p>
    </div>
  );
}
