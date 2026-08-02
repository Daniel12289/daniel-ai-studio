import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(friendlyAuthError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to keep building.">
      <form onSubmit={submit} className="space-y-3">
        {error && <p className="text-xs text-danger bg-danger/10 rounded-lg px-3 py-2">{error}</p>}
        <div>
          <label className="label block mb-1.5">Email</label>
          <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="label">Password</label>
            <Link to="/reset-password" className="text-xs text-amber hover:underline">Forgot?</Link>
          </div>
          <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button className="btn-primary w-full" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
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
        No account? <Link to="/signup" className="text-amber hover:underline">Sign up</Link>
      </p>
    </AuthLayout>
  );
}

export function friendlyAuthError(code: string): string {
  const map: Record<string, string> = {
    "auth/invalid-credential": "That email or password doesn't match our records.",
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/email-already-in-use": "An account already exists with that email.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/invalid-email": "That email address looks invalid.",
    "auth/popup-closed-by-user": "Google sign-in was closed before completing.",
  };
  return map[code] || "Something went wrong. Please try again.";
}
