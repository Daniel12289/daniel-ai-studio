import { useEffect, useState } from "react";

interface StatusConsoleProps {
  active: boolean;
  finalLine?: string;
}

const STEPS = [
  "parsing prompt",
  "planning file structure",
  "scaffolding project",
  "writing components",
  "applying styles",
  "wiring interactions",
  "reviewing output",
];

/**
 * The recurring visual signature of Daniel AI Studio: a monospace terminal
 * strip that "types" build steps while the AI is generating or editing.
 * Used on the landing hero, the new-project screen, and the editor.
 */
export function StatusConsole({ active, finalLine }: StatusConsoleProps) {
  const [visible, setVisible] = useState<string[]>([]);

  useEffect(() => {
    if (!active) {
      setVisible([]);
      return;
    }
    let i = 0;
    setVisible([]);
    const id = setInterval(() => {
      if (i >= STEPS.length) {
        clearInterval(id);
        return;
      }
      setVisible((v) => [...v, STEPS[i]]);
      i += 1;
    }, 550);
    return () => clearInterval(id);
  }, [active]);

  if (!active && !finalLine) return null;

  return (
    <div className="rounded-xl bg-ink border border-surface-line font-mono text-xs p-4 space-y-1.5 overflow-hidden">
      {visible.map((line, idx) => (
        <div key={idx} className="text-ash-300">
          <span className="text-cyan">$</span> {line}
          <span className="text-amber"> done</span>
        </div>
      ))}
      {active && visible.length < STEPS.length && (
        <div className="text-ash-500 console-cursor">
          <span className="text-cyan">$</span> {STEPS[visible.length]}
        </div>
      )}
      {!active && finalLine && (
        <div className="text-amber">
          <span className="text-cyan">$</span> {finalLine}
        </div>
      )}
    </div>
  );
}
