import { useState } from "react";
import { updateProfile } from "firebase/auth";
import { AppShell } from "../components/AppShell";
import { Topbar } from "../components/Topbar";
import { useAuth } from "../context/AuthContext";

export default function Account() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.displayName || "");
  const [saved, setSaved] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await updateProfile(user, { displayName: name });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppShell>
      <Topbar title="Account" />
      <div className="max-w-xl mx-auto px-6 py-8">
        <form onSubmit={save} className="card p-6 space-y-4">
          <div>
            <label className="label block mb-1.5">Email</label>
            <input className="input opacity-60" value={user?.email || ""} disabled />
          </div>
          <div>
            <label className="label block mb-1.5">Display name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <button className="btn-primary">{saved ? "Saved" : "Save changes"}</button>
        </form>
      </div>
    </AppShell>
  );
}
