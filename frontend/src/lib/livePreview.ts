import { Framework, ProjectFile } from "../types";

/**
 * Builds an HTML string safe to drop into an <iframe sandbox="allow-scripts">
 * srcDoc for instant preview.
 *
 * Full support: html-css-js projects (inlines local <link>/<script> files).
 * Best-effort: React single-file previews via Babel standalone (in-browser
 * JSX transform, no bundler) — fine for simple components, not for projects
 * with multiple imported files or npm packages beyond React itself.
 * Not supported in-browser: Next.js and multi-file Vue projects, since they
 * need a real bundler/dev server. We say so plainly rather than fake it.
 */
export function buildPreviewDocument(framework: Framework, files: ProjectFile[]): { html: string; unsupported?: string } {
  if (framework === "html-css-js") return { html: buildHtmlCssJsPreview(files) };
  if (framework === "react") return buildReactPreview(files);

  return {
    html: unsupportedDoc(
      `Live in-browser preview isn't available for ${framework === "nextjs" ? "Next.js" : "Vue"} projects yet — they need a real dev server. Download the project and run "npm install && npm run dev" locally.`
    ),
  };
}

function findFile(files: ProjectFile[], matcher: (path: string) => boolean) {
  return files.find((f) => matcher(f.path.toLowerCase()));
}

function buildHtmlCssJsPreview(files: ProjectFile[]): string {
  const indexFile = findFile(files, (p) => p === "index.html" || p.endsWith("/index.html"));
  if (!indexFile) {
    return unsupportedDoc("No index.html found in this project yet.");
  }

  let html = indexFile.content;

  // Inline local stylesheets: <link rel="stylesheet" href="style.css">
  html = html.replace(/<link[^>]+href=["']([^"']+)["'][^>]*>/gi, (match, href) => {
    if (/^https?:\/\//i.test(href)) return match; // keep external CDNs
    const cssFile = findFile(files, (p) => p.endsWith(href.toLowerCase().replace(/^\.?\//, "")));
    return cssFile ? `<style>\n${cssFile.content}\n</style>` : match;
  });

  // Inline local scripts: <script src="script.js"></script>
  html = html.replace(/<script[^>]+src=["']([^"']+)["'][^>]*><\/script>/gi, (match, src) => {
    if (/^https?:\/\//i.test(src)) return match;
    const jsFile = findFile(files, (p) => p.endsWith(src.toLowerCase().replace(/^\.?\//, "")));
    return jsFile ? `<script>\n${jsFile.content}\n</script>` : match;
  });

  return html;
}

function buildReactPreview(files: ProjectFile[]): { html: string; unsupported?: string } {
  const appFile = findFile(
    files,
    (p) => p.endsWith("app.jsx") || p.endsWith("app.tsx") || p.endsWith("app.js")
  );
  if (!appFile || files.length > 6) {
    return {
      html: unsupportedDoc(
        "This React project has multiple files/imports — in-browser preview only supports a single App component. Download and run it locally with Vite for the full app."
      ),
      unsupported: "multi-file",
    };
  }

  const doc = `<!doctype html>
<html><head><meta charset="UTF-8" />
<style>body{margin:0;font-family:Inter,system-ui,sans-serif;background:#0B0D12;color:#E7E9EE}</style>
<script src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head><body>
<div id="root"></div>
<script type="text/babel" data-presets="react">
${appFile.content.replace(/export default/g, "const __App =")}
ReactDOM.createRoot(document.getElementById("root")).render(<__App />);
</script>
</body></html>`;

  return { html: doc };
}

function unsupportedDoc(message: string): string {
  return `<!doctype html><html><head><meta charset="UTF-8" /><style>
    body{margin:0;height:100vh;display:flex;align-items:center;justify-content:center;
    font-family:Inter,system-ui,sans-serif;background:#0B0D12;color:#8B90A0;padding:2rem;text-align:center}
  </style></head><body><p>${escapeHtml(message)}</p></body></html>`;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}
