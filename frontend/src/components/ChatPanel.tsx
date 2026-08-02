import { useState, useRef, useEffect } from "react";
import { Send, Wrench, Wand2 } from "lucide-react";
import { ChatMessage } from "../types";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  onFix: () => void;
  onRedesign: (instruction: string) => void;
  busy: boolean;
}

const QUICK_ACTIONS = [
  "Add dark mode",
  "Make the navbar sticky",
  "Add a contact form",
  "Make it responsive",
  "Improve the design",
];

export function ChatPanel({ messages, onSend, onFix, onRedesign, busy }: ChatPanelProps) {
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const submit = () => {
    if (!text.trim() || busy) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-surface-line flex items-center justify-between">
        <span className="label">AI Chat</span>
        <div className="flex gap-1.5">
          <button onClick={onFix} disabled={busy} className="btn-secondary !px-2.5 !py-1.5 text-xs">
            <Wrench size={12} /> Fix project
          </button>
          <button
            onClick={() => onRedesign("Make it more modern with better typography and spacing")}
            disabled={busy}
            className="btn-secondary !px-2.5 !py-1.5 text-xs"
          >
            <Wand2 size={12} /> Improve design
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.length === 0 && (
          <p className="text-xs text-ash-700 font-mono">
            Ask for changes — "add dark mode", "make the navbar sticky", "add Firebase auth"...
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`text-sm rounded-xl px-3 py-2 max-w-[90%] ${
              m.role === "user" ? "bg-amber/10 text-ash-50 ml-auto" : "bg-surface-hi text-ash-300"
            }`}
          >
            {m.content}
          </div>
        ))}
        {busy && <div className="text-xs text-ash-500 font-mono console-cursor">generating</div>}
      </div>

      <div className="px-3 pb-2 flex flex-wrap gap-1.5">
        {QUICK_ACTIONS.map((qa) => (
          <button
            key={qa}
            onClick={() => onSend(qa)}
            disabled={busy}
            className="text-[11px] px-2.5 py-1 rounded-full border border-surface-line text-ash-500 hover:text-amber hover:border-amber/50 transition"
          >
            {qa}
          </button>
        ))}
      </div>

      <form
        className="p-3 border-t border-surface-line flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <input
          className="input"
          placeholder="Describe a change..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={busy}
        />
        <button type="submit" className="btn-primary !px-3" disabled={busy} aria-label="Send">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
