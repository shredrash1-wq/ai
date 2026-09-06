import JSZip from "jszip";
import { ProjectFile } from "../../types";

export function getFileLanguage(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  switch (ext) {
    case "html":
    case "htm":
      return "html";
    case "css":
      return "css";
    case "js":
    case "jsx":
      return "javascript";
    case "ts":
    case "tsx":
      return "typescript";
    case "json":
      return "json";
    case "md":
      return "markdown";
    default:
      return "text";
  }
}

export function compileMultiFilePreview(files: ProjectFile[], mainCodeFallback: string): string {
  if (!files || files.length === 0) {
    return mainCodeFallback || "";
  }

  // Find index.html or first html file
  const indexFile = files.find((f) => f.name.toLowerCase() === "index.html") || files.find((f) => f.name.toLowerCase().endsWith(".html"));

  if (!indexFile) {
    // If no HTML file, synthesize simple HTML container
    const cssFiles = files.filter((f) => f.name.endsWith(".css")).map((f) => f.content).join("\n");
    const jsFiles = files.filter((f) => f.name.endsWith(".js") || f.name.endsWith(".jsx")).map((f) => f.content).join("\n");

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aether Studio Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>${cssFiles}</style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen p-6 font-sans">
  <div class="max-w-4xl mx-auto">
    <h2 class="text-xl font-bold mb-4">Preview</h2>
    <div id="app"></div>
  </div>
  <script>${jsFiles}</script>
</body>
</html>`;
  }

  let html = indexFile.content;

  // Check if we need to inject CSS files that aren't linked via external CDN
  const cssFiles = files.filter((f) => f.name.toLowerCase().endsWith(".css"));
  if (cssFiles.length > 0) {
    const styleTags = cssFiles
      .map((f) => `<style data-filename="${f.name}">\n${f.content}\n</style>`)
      .join("\n");

    if (html.includes("</head>")) {
      html = html.replace("</head>", `${styleTags}\n</head>`);
    } else {
      html = `${styleTags}\n${html}`;
    }
  }

  // Check if we need to inject JS files
  const jsFiles = files.filter((f) => f.name.toLowerCase().endsWith(".js") || f.name.toLowerCase().endsWith(".jsx"));
  if (jsFiles.length > 0) {
    const scriptTags = jsFiles
      .map((f) => `<script data-filename="${f.name}">\n${f.content}\n</script>`)
      .join("\n");

    if (html.includes("</body>")) {
      html = html.replace("</body>", `${scriptTags}\n</body>`);
    } else {
      html = `${html}\n${scriptTags}`;
    }
  }

  return html;
}

export async function exportProjectAsZip(files: ProjectFile[], projectTitle: string): Promise<void> {
  const zip = new JSZip();

  files.forEach((file) => {
    zip.file(file.name, file.content);
  });

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const safeName = (projectTitle || "aether-project").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  a.download = `${safeName}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadSingleFile(file: ProjectFile): void {
  const blob = new Blob([file.content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
