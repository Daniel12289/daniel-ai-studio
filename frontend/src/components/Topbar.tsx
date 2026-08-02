import { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export function Topbar({ title, actions }: { title: string; actions?: ReactNode }) {
  const { logOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 py-4 border-b border-surface-line bg-ink/80 backdrop-blur">
      <h1 className="text-lg font-display font-semibold">{title}</h1>
      <div className="flex items-center gap-2">
        {actions}
        <button
          onClick={async () => {
            await logOut();
            navigate("/login");
          }}
          className="btn-secondary !px-3 !py-2 text-xs"
          aria-label="Log out"
        >
          <LogOut size={14} />
        </button>
      </div>
    </header>
  );
}
