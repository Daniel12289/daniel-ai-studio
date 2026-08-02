import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  FolderKanban,
  LayoutTemplate,
  MessageSquare,
  Settings,
  CreditCard,
  UserCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useIsAdmin } from "../hooks/useIsAdmin";

const navItems = [
  { to: "/dashboard", label: "New Project", icon: Sparkles },
  { to: "/projects", label: "My Projects", icon: FolderKanban },
  { to: "/templates", label: "Templates", icon: LayoutTemplate },
  { to: "/chat", label: "AI Chat", icon: MessageSquare },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/billing", label: "Billing", icon: CreditCard },
  { to: "/account", label: "Account", icon: UserCircle },
];

export function Sidebar() {
  const { user } = useAuth();
  const isAdmin = useIsAdmin();

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-surface-line bg-surface/60 h-screen sticky top-0">
      <div className="px-5 py-5 flex items-center gap-2">
        <LayoutGrid className="text-amber" size={20} />
        <span className="font-display font-semibold text-sm">Daniel AI Studio</span>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
                isActive ? "bg-amber/10 text-amber" : "text-ash-300 hover:bg-surface-hi hover:text-ash-50"
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
                isActive ? "bg-cyan/10 text-cyan" : "text-ash-300 hover:bg-surface-hi hover:text-ash-50"
              }`
            }
          >
            <ShieldCheck size={17} />
            Admin
          </NavLink>
        )}
      </nav>
      <div className="px-4 py-4 border-t border-surface-line text-xs text-ash-700 font-mono truncate">
        {user?.email}
      </div>
    </aside>
  );
}
