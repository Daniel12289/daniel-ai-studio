import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-ink">
      <div className="hidden md:flex flex-col justify-between p-10 border-r border-surface-line bg-surface/40">
        <Link to="/" className="flex items-center gap-2">
          <Sparkles className="text-amber" size={20} />
          <span className="font-display font-semibold">Daniel AI Studio</span>
        </Link>
        <div className="font-mono text-xs text-ash-500 space-y-1.5">
          <p><span className="text-cyan">$</span> build a restaurant ordering site<span className="console-cursor" /></p>
          <p className="text-ash-700">scaffolding files...</p>
          <p className="text-ash-700">writing index.html, style.css, script.js</p>
          <p className="text-amber">done in 4.2s</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-display font-semibold mb-1">{title}</h1>
          <p className="text-sm text-ash-500 mb-8">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
