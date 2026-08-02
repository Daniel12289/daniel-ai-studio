import { AppShell } from "../components/AppShell";
import { Topbar } from "../components/Topbar";
import { useSettings } from "../hooks/useSettings";

export default function Settings() {
  const { settings, update } = useSettings();

  return (
    <AppShell>
      <Topbar title="Settings" />
      <div className="max-w-xl mx-auto px-6 py-8 space-y-8">
        <Section title="Appearance">
          <Row label="Theme">
            <SegmentedControl
              value={settings.theme}
              options={["light", "dark", "system"]}
              onChange={(v) => update({ theme: v as any })}
            />
          </Row>
        </Section>

        <Section title="Editor">
          <Row label="Editor theme">
            <SegmentedControl
              value={settings.editorTheme}
              options={["vs-dark", "light", "hc-black"]}
              onChange={(v) => update({ editorTheme: v as any })}
            />
          </Row>
          <Row label="Font size">
            <input
              type="range"
              min={11}
              max={20}
              value={settings.fontSize}
              onChange={(e) => update({ fontSize: Number(e.target.value) })}
              className="w-40"
            />
            <span className="text-xs text-ash-500 font-mono w-8">{settings.fontSize}px</span>
          </Row>
          <Row label="Autosave">
            <input
              type="checkbox"
              checked={settings.autosave}
              onChange={(e) => update({ autosave: e.target.checked })}
              className="h-4 w-4 accent-amber"
            />
          </Row>
        </Section>

        <Section title="API keys">
          <p className="text-xs text-ash-500 mb-3">
            The Groq API key lives on the backend server only, never in your browser — there's nothing
            to configure here. If you want to bring your own Groq key, set{" "}
            <code className="text-cyan font-mono">GROQ_API_KEY</code> in the backend's environment.
          </p>
        </Section>
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <h2 className="font-display font-semibold text-sm mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-ash-300">{label}</span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

function SegmentedControl({
  value, options, onChange,
}: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="flex rounded-lg border border-surface-line overflow-hidden">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`px-3 py-1.5 text-xs font-mono ${
            value === o ? "bg-amber/10 text-amber" : "text-ash-500 hover:text-ash-50"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
