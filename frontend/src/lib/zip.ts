import JSZip from "jszip";
import { ProjectFile } from "../types";

/** Bundles project files into a downloadable ZIP and triggers a browser download. */
export async function downloadProjectAsZip(projectName: string, files: ProjectFile[]) {
  const zip = new JSZip();
  files.forEach((f) => zip.file(f.path, f.content));

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slugify(projectName)}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function slugify(name: string) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "project";
}
