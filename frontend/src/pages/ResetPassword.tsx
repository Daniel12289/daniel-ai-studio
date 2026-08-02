import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";
import { friendlyAuthError } from "./Login";

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(friendlyAuthError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset your password" subtitle="We'll email you a reset link.">
      {sent ? (
        <p className="text-sm text-ash-300 bg-surface-hi rounded-xl p-4">
          Check <span className="text-amber">{email}</span> for a link to reset your password.
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          {error && <p className="text-xs text-danger bg-danger/10 rounded-lg px-3 py-2">{error}</p>}
          <div>
            <label className="label block mb-1.5">Email</label>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <button className="btn-primary w-full" disabled={loading}>{loading ? "Sending..." : "Send reset link"}</button>
        </form>
      )}
      <p className="text-xs text-ash-500 mt-6 text-center">
        <Link to="/login" className="text-amber hover:underline">Back to sign in</Link>
      </p>
    </AuthLayout>
  );
}
