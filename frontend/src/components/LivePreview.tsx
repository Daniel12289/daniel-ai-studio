import { useEffect, useState } from "react";
import { RefreshCw, ExternalLink } from "lucide-react";
import { Framework, ProjectFile } from "../types";
import { buildPreviewDocument } from "../lib/livePreview";

export function LivePreview({ framework, files }: { framework: Framework; files: ProjectFile[] }) {
  const [doc, setDoc] = useState("");
  const [key, setKey] = useState(0);

  useEffect(() => {
    const { html } = buildPreviewDocument(framework, files);
    setDoc(html);
  }, [framework, files, key]);

  const openInNewTab = () => {
    const blob = new Blob([doc], { type: "text/html" });
    window.open(URL.createObjectURL(blob), "_blank");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-surface-line bg-surface">
        <span className="label">Live preview</span>
        <div className="flex items-center gap-1">
          <button onClick={() => setKey((k) => k + 1)} className="text-ash-500 hover:text-amber p-1.5" aria-label="Refresh preview">
            <RefreshCw size={14} />
          </button>
          <button onClick={openInNewTab} className="text-ash-500 hover:text-amber p-1.5" aria-label="Open preview in new tab">
            <ExternalLink size={14} />
          </button>
        </div>
      </div>
      <iframe
        key={key}
        title="Live preview"
        srcDoc={doc}
        sandbox="allow-scripts allow-forms allow-modals allow-popups"
        className="flex-1 w-full bg-white"
      />
    </div>
  );
}
