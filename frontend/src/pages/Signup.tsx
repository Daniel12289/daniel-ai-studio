import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";
import { friendlyAuthError } from "./Login";

export default function Signup() {
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signUp(email, password, name);
      navigate("/dashboard");
    } catch (err: any) {
      setError(friendlyAuthError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create your workspace" subtitle="Start building with a prompt.">
      <form onSubmit={submit} className="space-y-3">
        {error && <p className="text-xs text-danger bg-danger/10 rounded-lg px-3 py-2">{error}</p>}
        <div>
          <label className="label block mb-1.5">Name</label>
          <input className="input" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label block mb-1.5">Email</label>
          <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label block mb-1.5">Password</label>
          <input className="input" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button className="btn-primary w-full" disabled={loading}>{loading ? "Creating..." : "Create account"}</button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="h-px bg-surface-line flex-1" />
        <span className="text-xs text-ash-700">or</span>
        <div className="h-px bg-surface-line flex-1" />
      </div>

      <button
        onClick={async () => {
          try { await signInWithGoogle(); navigate("/dashboard"); }
          catch (err: any) { setError(friendlyAuthError(err.code)); }
        }}
        className="btn-secondary w-full"
      >
        Continue with Google
      </button>

      <p className="text-xs text-ash-500 mt-6 text-center">
        Already have an account? <Link to="/login" className="text-amber hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
