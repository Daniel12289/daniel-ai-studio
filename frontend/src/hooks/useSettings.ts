import { useEffect, useState } from "react";

export interface StudioSettings {
  theme: "dark" | "light" | "system";
  editorTheme: "vs-dark" | "light" | "hc-black";
  fontSize: number;
  autosave: boolean;
}

const DEFAULTS: StudioSettings = {
  theme: "dark",
  editorTheme: "vs-dark",
  fontSize: 14,
  autosave: true,
};

const KEY = "daniel-ai-studio:settings";

export function useSettings() {
  const [settings, setSettings] = useState<StudioSettings>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(settings));
  }, [settings]);

  const update = (patch: Partial<StudioSettings>) => setSettings((s) => ({ ...s, ...patch }));

  return { settings, update };
}
