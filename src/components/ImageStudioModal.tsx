import React, { useState } from "react";
import {
  X,
  Sparkles,
  Download,
  Send,
  Copy,
  Check,
  Image as ImageIcon,
  Maximize2,
  RefreshCw
} from "lucide-react";

interface ImageStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttachImageToChat: (imageUrl: string, prompt: string) => void;
}

const INSPIRATION_PROMPTS = [
  "Futuristic cyberpunk Tokyo with glowing holographic signs in rain, 8k cinematic",
  "Serene alpine mountain lake at golden hour with snow-capped reflections, photorealistic",
  "Whimsical watercolor illustration of a red panda reading a book in a cozy treehouse",
  "3D isometric low-poly cute coffee shop with warm ambient lighting"
];

const ASPECT_RATIOS = [
  { id: "1:1", label: "1:1 Square" },
  { id: "16:9", label: "16:9 Cinema" },
  { id: "9:16", label: "9:16 Story" },
  { id: "4:3", label: "4:3 Classic" }
];

export const ImageStudioModal: React.FC<ImageStudioModalProps> = ({
  isOpen,
  onClose,
  onAttachImageToChat
}) => {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; prompt: string } | null>(null);
  const [generatedImages, setGeneratedImages] = useState<Array<{ id: string; url: string; prompt: string; ratio: string }>>([
    {
      id: "img-1",
      url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80",
      prompt: "Abstract iridescent crystal refraction in dark studio, cinematic 8k render, minimalist aesthetic",
      ratio: "16:9"
    },
    {
      id: "img-2",
      url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1000&q=80",
      prompt: "Geometric fluid neon ribbons intertwining in deep space, hyper-detailed volumetric lighting",
      ratio: "1:1"
    },
    {
      id: "img-3",
      url: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=1000&q=80",
      prompt: "Futuristic holographic AI architecture matrix glowing in deep violet and cyan",
      ratio: "4:3"
    }
  ]);

  if (!isOpen) return null;

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), aspectRatio })
      });
      if (res.ok) {
        const data = await res.json();
        const newImg = {
          id: `img-${Date.now()}`,
          url: data.imageUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80",
          prompt: data.prompt || prompt.trim(),
          ratio: aspectRatio
        };
        setGeneratedImages([newImg, ...generatedImages]);
      }
    } catch {
      // Fallback
      const newImg = {
        id: `img-${Date.now()}`,
        url: `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt.trim())}?width=1024&height=1024&nologo=true&enhance=true`,
        prompt: prompt.trim(),
        ratio: aspectRatio
      };
      setGeneratedImages([newImg, ...generatedImages]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${filename.slice(0, 24).replace(/\s+/g, "_")}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, "_blank");
    }
  };

  return (
    <div
      id="image-studio-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in"
    >
      <div
        id="image-studio-modal-card"
        className="bg-white dark:bg-[#1e1f20] border border-gray-200 dark:border-zinc-800 rounded-3xl w-full max-w-5xl h-[700px] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white flex items-center justify-center shadow-md">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  Gemini Visual Studio
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-300 border border-pink-200 dark:border-pink-800">
                  Gemini 3.1 Flash Image
                </span>
              </div>
              <p className="text-[11px] text-gray-500">
                Synthesize photorealistic visuals, digital illustrations, and 3D designs with Gemini
              </p>
            </div>
          </div>

          <button
            id="close-image-studio-btn"
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls Bar */}
        <div className="p-4 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-900/40 flex flex-col gap-3">
          {/* Aspect Ratio Tabs */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 font-medium mr-1">Aspect:</span>
              {ASPECT_RATIOS.map((ar) => (
                <button
                  key={ar.id}
                  type="button"
                  onClick={() => setAspectRatio(ar.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium transition ${
                    aspectRatio === ar.id
                      ? "bg-purple-600 text-white shadow-xs"
                      : "bg-gray-200/70 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-zinc-700"
                  }`}
                >
                  {ar.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 text-[11px] text-gray-500">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>Multimodal Visual Synthesis</span>
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleGenerate} className="flex gap-2">
            <input
              id="image-studio-prompt-input"
              type="text"
              placeholder="Describe any scene, character, 3D render, concept design, or realistic visual..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-2xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            />
            <button
              id="image-studio-generate-btn"
              type="submit"
              disabled={isGenerating || !prompt.trim()}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white font-semibold text-xs shadow-md flex items-center gap-2 disabled:opacity-50 hover:opacity-95 transition shrink-0"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Image</span>
                </>
              )}
            </button>
          </form>

          {/* Inspiration Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[11px] text-gray-400 shrink-0">Ideas:</span>
            {INSPIRATION_PROMPTS.map((insp, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPrompt(insp)}
                className="text-[11px] px-2.5 py-0.5 rounded-full bg-white dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700/60 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-300 shrink-0 transition"
              >
                {insp.slice(0, 38)}...
              </button>
            ))}
          </div>
        </div>

        {/* Gallery */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {generatedImages.map((img) => (
              <div
                key={img.id}
                id={`studio-card-${img.id}`}
                className="group relative rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 shadow-sm flex flex-col transition hover:shadow-md"
              >
                {/* Image Container */}
                <div
                  className="relative aspect-video w-full overflow-hidden bg-zinc-950 cursor-pointer"
                  onClick={() => setPreviewImage({ url: img.url, prompt: img.prompt })}
                >
                  <img
                    src={img.url}
                    alt={img.prompt}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewImage({ url: img.url, prompt: img.prompt });
                      }}
                      className="p-2 rounded-full bg-white/90 text-gray-900 hover:bg-white shadow-lg transition"
                      title="View Fullscreen"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(img.url, img.prompt);
                      }}
                      className="p-2 rounded-full bg-white/90 text-gray-900 hover:bg-white shadow-lg transition"
                      title="Download PNG"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Ratio badge */}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] text-white font-medium">
                    {img.ratio || "1:1"}
                  </span>
                </div>

                {/* Info & Actions */}
                <div className="p-3.5 flex-1 flex flex-col justify-between bg-white dark:bg-[#1e1f20]">
                  <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2 leading-relaxed">
                    {img.prompt}
                  </p>
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => handleCopyPrompt(img.id, img.prompt)}
                      className="text-[11px] text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 flex items-center gap-1 transition"
                    >
                      {copiedId === img.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy prompt</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onAttachImageToChat(img.url, img.prompt);
                        onClose();
                      }}
                      className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold hover:underline flex items-center gap-1 transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send to chat</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fullscreen Lightbox Modal */}
        {previewImage && (
          <div
            className="fixed inset-0 z-60 bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-md animate-in fade-in"
            onClick={() => setPreviewImage(null)}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="max-w-4xl max-h-[80vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
              <img
                src={previewImage.url}
                alt={previewImage.prompt}
                referrerPolicy="no-referrer"
                className="max-h-[70vh] w-auto rounded-2xl shadow-2xl border border-white/10"
              />
              <div className="mt-4 flex items-center justify-between w-full text-white px-2">
                <p className="text-xs text-gray-300 max-w-xl truncate">{previewImage.prompt}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(previewImage.url, previewImage.prompt)}
                    className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-xs text-white font-medium flex items-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => {
                      onAttachImageToChat(previewImage.url, previewImage.prompt);
                      setPreviewImage(null);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-xs text-white font-medium flex items-center gap-1.5 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send to Chat</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
