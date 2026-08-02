import { auth } from "../firebase/config";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

async function adminFetch(path: string, options: RequestInit = {}) {
  const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
  if (!token) throw new Error("You must be signed in as an admin.");

  const res = await fetch(`${API_BASE}/api/admin${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const adminApi = {
  listUsers: () => adminFetch("/users"),
  suspendUser: (uid: string, disabled: boolean) =>
    adminFetch(`/users/${uid}/suspend`, { method: "POST", body: JSON.stringify({ disabled }) }),
  listProjects: () => adminFetch("/projects"),
  deleteProject: (ownerUid: string, projectId: string) =>
    adminFetch(`/projects/${ownerUid}/${projectId}`, { method: "DELETE" }),
  stats: () => adminFetch("/stats"),
};
