import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Copy,
  Check,
  Eye,
  Code2,
  Maximize2,
  X,
  RotateCw,
  ExternalLink,
  Smartphone,
  Monitor,
  Tablet,
  Download,
  Play
} from "lucide-react";

interface CodeBlockProps {
  language?: string;
  code: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language = "", code }) => {
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Detect if the snippet is HTML, SVG, or contains visual web markup
  const isHtml = useMemo(() => {
    const lang = (language || "").toLowerCase().trim();
    if (["html", "htm", "xml", "svg", "jsx", "tsx", "web", "xhtml", "markup"].includes(lang)) {
      return true;
    }
    // Check if code contains common HTML elements or doctype
    const hasTagStructure = /<(!doctype|html|head|body|div|span|p|a\s|h[1-6]|button|input|form|table|ul|ol|li|section|header|footer|nav|main|aside|article|style|script|svg|canvas|video|audio|img|iframe)/i.test(
      code
    );
    const hasGeneralHtml = /<[a-z][\s\S]*>/i.test(code) && /<\/[a-z]+>/i.test(code);
    return hasTagStructure || hasGeneralHtml;
  }, [language, code]);

  // Construct complete HTML document with styling and script execution support
  const srcDoc = useMemo(() => {
    const trimmed = code.trim();
    if (/<!doctype\s+html|<html/i.test(trimmed)) {
      return trimmed;
    }
    // Wrap fragment in HTML shell with modern defaults and Tailwind CDN
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 16px;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1f2937;
      background-color: #ffffff;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  ${code}
</body>
</html>`;
  }, [code]);

  // Create Object URL for clean download or preview
  const blobUrl = useMemo(() => {
    try {
      const blob = new Blob([srcDoc], { type: "text/html;charset=utf-8" });
      return URL.createObjectURL(blob);
    } catch {
      return "";
    }
  }, [srcDoc]);

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReload = () => {
    setIframeKey((prev) => prev + 1);
  };

  const handleOpenExternal = () => {
    if (blobUrl) {
      const win = window.open(blobUrl, "_blank");
      if (!win) {
        // If popup blocked by iframe sandbox, open in-app fullscreen modal
        setIsModalOpen(true);
      }
    } else {
      setIsModalOpen(true);
    }
  };

  const displayLang = (language || (isHtml ? "html" : "code")).toUpperCase();

  return (
    <div className="my-4 rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 bg-[#18181b] text-gray-200 shadow-md">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#121214] border-b border-zinc-800 text-xs gap-2">
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-[11px] font-semibold tracking-wider text-gray-400 px-2 py-0.5 rounded-md bg-zinc-800/80">
            {displayLang}
          </span>

          {/* Code vs Live Preview Mode Tabs */}
          {isHtml && (
            <div className="flex items-center bg-zinc-800/90 rounded-lg p-0.5 border border-zinc-700/60">
              <button
                type="button"
                id="code-tab-btn"
                onClick={() => setActiveTab("code")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                  activeTab === "code"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Code2 className="w-3 h-3" />
                <span>Code</span>
              </button>
              <button
                type="button"
                id="preview-tab-btn"
                onClick={() => setActiveTab("preview")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                  activeTab === "preview"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Preview</span>
              </button>
            </div>
          )}
        </div>

        {/* Action buttons on the right */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Quick Open Preview Button (Opens Modal) */}
          {isHtml && (
            <>
              <button
                type="button"
                id="open-in-web-studio-btn"
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent("open-web-studio", {
                      detail: { code, title: "Exported Web Code" }
                    })
                  );
                }}
                title="Open in Google AI Studio Prompt to Website"
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-blue-950/70 hover:bg-blue-900/80 text-blue-300 border border-blue-800/70 transition cursor-pointer"
              >
                <Code2 className="w-3 h-3 text-blue-400" />
                <span>Web Studio</span>
              </button>

              <button
                type="button"
                id="open-fullscreen-preview-btn"
                onClick={() => {
                  setActiveTab("preview");
                  setIsModalOpen(true);
                }}
                title="Open full interactive preview"
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/70 transition cursor-pointer"
              >
                <Maximize2 className="w-3 h-3" />
                <span>Preview</span>
              </button>
            </>
          )}

          {isHtml && activeTab === "preview" && (
            <button
              type="button"
              onClick={handleReload}
              title="Reload Preview"
              className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Copy Button */}
          <button
            type="button"
            id="code-copy-btn"
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
              copied
                ? "bg-emerald-950/70 text-emerald-400 border border-emerald-800"
                : "text-gray-300 hover:text-white hover:bg-zinc-800"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isHtml && activeTab === "preview" ? (
        <div className="relative bg-white w-full">
          <div className="w-full h-84 min-h-[300px] max-h-[500px] relative bg-white">
            <iframe
              key={iframeKey}
              ref={iframeRef}
              srcDoc={srcDoc}
              title="Interactive HTML Preview"
              className="w-full h-full border-0 bg-white"
            />
          </div>
          <div className="flex items-center justify-between px-3.5 py-2 bg-gray-100 dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 text-[11px] text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Interactive HTML Sandbox</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleReload}
                className="hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-1 cursor-pointer"
              >
                <RotateCw className="w-3 h-3" />
                <span>Refresh</span>
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="hover:text-blue-500 flex items-center gap-1 font-medium cursor-pointer"
              >
                <span>Fullscreen Preview</span>
                <Maximize2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-gray-100 select-text">
          <pre className="m-0 p-0 whitespace-pre">
            <code>{code}</code>
          </pre>
        </div>
      )}

      {/* Fullscreen HTML Preview Modal */}
      {isModalOpen && (
        <div
          id="preview-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs animate-in fade-in"
        >
          <div
            id="preview-modal-card"
            className="bg-white dark:bg-zinc-900 w-full max-w-6xl h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-gray-200 dark:border-zinc-800"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Interactive HTML Live Preview
                  </span>
                </div>

                {/* Viewport Presets */}
                <div className="hidden sm:flex items-center bg-gray-200 dark:bg-zinc-800 rounded-lg p-0.5 text-xs ml-4">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition cursor-pointer ${
                      previewDevice === "desktop"
                        ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-xs font-medium"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Desktop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("tablet")}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition cursor-pointer ${
                      previewDevice === "tablet"
                        ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-xs font-medium"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    <Tablet className="w-3.5 h-3.5" />
                    <span>Tablet</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition cursor-pointer ${
                      previewDevice === "mobile"
                        ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-xs font-medium"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReload}
                  title="Reload Preview"
                  className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                {blobUrl && (
                  <a
                    href={blobUrl}
                    download="preview.html"
                    title="Download HTML file"
                    className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-zinc-800 transition flex items-center"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}

                <button
                  type="button"
                  onClick={handleOpenExternal}
                  title="Open in new window"
                  className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  id="close-preview-modal-btn"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body with responsive frame */}
            <div className="flex-1 bg-gray-100 dark:bg-zinc-950 p-3 sm:p-6 flex items-center justify-center overflow-auto">
              <div
                className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 h-full border border-gray-200 dark:border-zinc-800 ${
                  previewDevice === "mobile"
                    ? "w-[390px]"
                    : previewDevice === "tablet"
                    ? "w-[768px]"
                    : "w-full"
                }`}
              >
                <iframe
                  key={`modal-${iframeKey}`}
                  srcDoc={srcDoc}
                  title="Expanded Interactive HTML Preview"
                  className="w-full h-full border-0 bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
