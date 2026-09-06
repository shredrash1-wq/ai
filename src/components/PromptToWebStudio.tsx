import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Code,
  Sparkles,
  Zap,
  ExternalLink,
  Download,
  Copy,
  Check,
  Plus,
  FolderOpen,
  Monitor,
  Tablet,
  Smartphone,
  X,
  Loader2,
  FileCode,
  Eye,
  CheckCircle2,
  Upload,
  ChevronDown,
  Columns,
  Maximize2,
  Trash2,
  Archive
} from "lucide-react";
import { WebsiteProject, WebsiteVersion, ProjectFile } from "../types";
import {
  getStoredWebsites,
  saveStoredWebsites,
  createWebsiteProject
} from "../utils/websiteStorage";
import { SavedWebsitesModal } from "./SavedWebsitesModal";
import { StudioChatMessage, ViewportMode, StudioTabMode, AIModelEngine } from "./studio/types";
import { StudioChat } from "./studio/StudioChat";
import { StudioFileExplorer } from "./studio/StudioFileExplorer";
import { StudioCodeEditor } from "./studio/StudioCodeEditor";
import { StudioPreview } from "./studio/StudioPreview";
import {
  compileMultiFilePreview,
  exportProjectAsZip,
  getFileLanguage
} from "./studio/bundleUtils";

interface PromptToWebStudioProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

const QUICK_PROMPT_SUGGESTIONS = [
  {
    title: "SaaS Landing Page",
    desc: "Modern dark theme, monthly/annual pricing switch, feature cards with hover effects, testimonials, and FAQ accordion.",
    prompt: "Create a modern SaaS landing page with dark theme, interactive pricing toggle (monthly/annual), feature cards, testimonials, and FAQ accordion."
  },
  {
    title: "Kanban Task Board",
    desc: "Agile board with 4 columns (To Do, In Progress, Review, Done), task modal, tag badges, and interactive task movement.",
    prompt: "Build an agile Kanban task board with 4 columns (To Do, In Progress, Review, Done), task creation modal, priority tags, and local state."
  },
  {
    title: "Crypto Terminal",
    desc: "Decentralized trading dashboard with live canvas price chart, real-time ticker prices, buy/sell widget, and order book.",
    prompt: "Create a decentralized crypto trading dashboard with live canvas price chart, real-time ticker prices, buy/sell widget, and order book."
  },
  {
    title: "Pomodoro Focus Timer",
    desc: "Futuristic cyberpunk timer with circular SVG progress animation, customizable intervals, start/pause/reset controls, and stats.",
    prompt: "Design a futuristic cyberpunk Pomodoro timer with circular animation, customizable intervals, start/pause/reset controls, and stats."
  },
  {
    title: "Recipe & Meal Planner",
    desc: "Recipe finder and meal planner with ingredient search, dietary tags, nutrition macros, and interactive shopping list.",
    prompt: "Build a modern recipe finder and meal planner with ingredient search, dietary tags, nutrition macros, and interactive shopping list."
  },
  {
    title: "Markdown Studio",
    desc: "Split-screen markdown editor with live HTML preview, syntax highlighting, word counter, and instant export.",
    prompt: "Create a clean split-screen markdown editor with live HTML preview, word counter, and export buttons."
  }
];

const FAST_GENERATION_STEPS = [
  "🧠 Initializing Crazy AI Web Architect...",
  "📐 Synthesizing semantic HTML5 layouts & design system...",
  "🎨 Injecting obsidian themes, glassmorphism & Tailwind CSS...",
  "⚡ Compiling reactive state, event handlers & local storage...",
  "✨ Finalizing production-ready interactive application..."
];

export const PromptToWebStudio: React.FC<PromptToWebStudioProps> = ({
  isOpen,
  onClose,
  initialPrompt
}) => {
  // 0 Pre-made websites at startup
  const [websites, setWebsites] = useState<WebsiteProject[]>(getStoredWebsites);
  const [currentProject, setCurrentProject] = useState<WebsiteProject | null>(() => {
    const saved = getStoredWebsites();
    return saved.length > 0 ? saved[0] : null;
  });

  // Layout & Workspace states
  const [activeTab, setActiveTab] = useState<StudioTabMode>("preview");
  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [activeFileName, setActiveFileName] = useState<string>("index.html");

  // AI & Chat states
  const [selectedEngine, setSelectedEngine] = useState<AIModelEngine>("gemini-3.8-flash");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [chatMessages, setChatMessages] = useState<StudioChatMessage[]>([]);

  // Project title and saving
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(
    currentProject ? currentProject.title : "Untitled Web Application"
  );
  const [saveStatus, setSaveStatus] = useState<"saved" | "unsaved" | "saving">("saved");

  // Modals & Menus
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState(false);
  const [deleteSuccessToast, setDeleteSuccessToast] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const fileUploadInputRef = useRef<HTMLInputElement>(null);

  // Sync title when current project changes
  useEffect(() => {
    if (currentProject) {
      setTitleInput(currentProject.title);
      // set active file if current doesn't exist
      const files = currentProject.files || [];
      if (files.length > 0 && !files.some((f) => f.name === activeFileName)) {
        setActiveFileName(files[0].name);
      }
    } else {
      setTitleInput("Untitled Web Application");
    }
  }, [currentProject?.id]);

  // Handle initial prompt if provided upon opening
  useEffect(() => {
    if (isOpen && initialPrompt && initialPrompt.trim() && !isGenerating) {
      handleSendMessage(initialPrompt.trim());
    }
  }, [initialPrompt, isOpen]);

  // Persist websites
  useEffect(() => {
    saveStoredWebsites(websites);
  }, [websites]);

  // Helper: Retrieve project files safely
  const getProjectFiles = (project: WebsiteProject | null): ProjectFile[] => {
    if (!project) return [];
    if (project.files && project.files.length > 0) return project.files;
    return [
      {
        name: "index.html",
        content: project.code || "",
        language: "html",
        isEntry: true
      }
    ];
  };

  const currentFiles = getProjectFiles(currentProject);
  const activeFile = currentFiles.find((f) => f.name === activeFileName) || currentFiles[0] || null;

  // Compile multi-file preview
  const compiledPreviewHtml = useMemo(() => {
    if (!currentProject) return "";
    return compileMultiFilePreview(currentFiles, currentProject.code);
  }, [currentProject, currentFiles]);

  const updateProjectInStorage = (updatedProj: WebsiteProject) => {
    const updated = websites.map((w) => (w.id === updatedProj.id ? updatedProj : w));
    setWebsites(updated);
    saveStoredWebsites(updated);
  };

  // Switch / New Project
  const handleNewProject = () => {
    setCurrentProject(null);
    setTitleInput("Untitled Web Application");
    setActiveFileName("index.html");
    setChatMessages([]);
    setSaveStatus("saved");
    setActiveTab("preview");
  };

  const handleSelectProject = (project: WebsiteProject) => {
    setCurrentProject(project);
    setTitleInput(project.title);
    const files = getProjectFiles(project);
    setActiveFileName(files[0]?.name || "index.html");
    setSaveStatus("saved");
  };

  const handleDuplicateProject = (project: WebsiteProject) => {
    const duplicated: WebsiteProject = {
      ...project,
      id: `site-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: `${project.title} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    const updated = [duplicated, ...websites];
    setWebsites(updated);
    setCurrentProject(duplicated);
    setSaveStatus("saved");
  };

  const handleDeleteProject = (id: string) => {
    const filtered = websites.filter((w) => w.id !== id);
    setWebsites(filtered);
    saveStoredWebsites(filtered);
    if (currentProject?.id === id) {
      setCurrentProject(filtered.length > 0 ? filtered[0] : null);
    }
  };

  const handleDeleteCurrentProject = () => {
    if (!currentProject) return;
    const currentId = currentProject.id;
    const filtered = websites.filter((w) => w.id !== currentId);
    setWebsites(filtered);
    saveStoredWebsites(filtered);

    if (filtered.length > 0) {
      setCurrentProject(filtered[0]);
    } else {
      const fresh = createWebsiteProject("New Web Application", "Initial canvas ready for prompts", "");
      setCurrentProject(fresh);
      setWebsites([fresh]);
      saveStoredWebsites([fresh]);
    }
    setIsDeleteModalOpen(false);
    setDeleteSuccessToast(true);
    setTimeout(() => setDeleteSuccessToast(false), 3000);
  };

  const handleDownloadFullProject = async () => {
    try {
      await exportProjectAsZip(currentFiles, currentProject?.title || "web-application");
      setDownloadSuccessToast(true);
      setTimeout(() => setDownloadSuccessToast(false), 3000);
    } catch (err) {
      console.error("ZIP download error:", err);
    }
  };

  const handleSaveTitle = () => {
    const trimmed = titleInput.trim() || "Untitled Web Application";
    if (currentProject) {
      const updatedProj = { ...currentProject, title: trimmed };
      setCurrentProject(updatedProj);
      updateProjectInStorage(updatedProj);
    }
    setIsEditingTitle(false);
  };

  // --- FILE EXPLORER ACTIONS ---
  const handleCreateFile = (fileName: string) => {
    const lang = getFileLanguage(fileName);
    let initialBoilerplate = "";
    if (fileName.endsWith(".html")) {
      initialBoilerplate = `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>${fileName}</title>\n  <script src="https://cdn.tailwindcss.com"></script>\n</head>\n<body class="bg-slate-950 text-white p-6 font-sans">\n  <h1 class="text-2xl font-bold">${fileName}</h1>\n</body>\n</html>`;
    } else if (fileName.endsWith(".css")) {
      initialBoilerplate = `/* Custom Stylesheet: ${fileName} */\n.custom-element {\n  transition: all 0.2s ease;\n}`;
    } else if (fileName.endsWith(".js") || fileName.endsWith(".jsx")) {
      initialBoilerplate = `// Custom Script: ${fileName}\nconsole.log("${fileName} active");`;
    } else if (fileName.endsWith(".json")) {
      initialBoilerplate = `{\n  "version": "1.0.0",\n  "name": "aether-app"\n}`;
    }

    const newFile: ProjectFile = {
      name: fileName,
      content: initialBoilerplate,
      language: lang
    };

    if (!currentProject) {
      const newProj = createWebsiteProject(titleInput || "Custom Web App", "Created file", "", [
        { name: "index.html", content: "", language: "html", isEntry: true },
        newFile
      ]);
      setCurrentProject(newProj);
      setActiveFileName(fileName);
      const updated = [newProj, ...websites];
      setWebsites(updated);
      saveStoredWebsites(updated);
      return;
    }

    const existing = getProjectFiles(currentProject);
    if (existing.some((f) => f.name.toLowerCase() === fileName.toLowerCase())) {
      setActiveFileName(fileName);
      return;
    }

    const updatedFiles = [...existing, newFile];
    const updatedProj = {
      ...currentProject,
      files: updatedFiles,
      updatedAt: Date.now()
    };
    setCurrentProject(updatedProj);
    setActiveFileName(fileName);
    updateProjectInStorage(updatedProj);
  };

  const handleDeleteFile = (fileName: string) => {
    if (!currentProject) return;
    const existing = getProjectFiles(currentProject);
    if (existing.length <= 1) {
      alert("A project must have at least one file.");
      return;
    }
    const filtered = existing.filter((f) => f.name !== fileName);
    const nextActive = activeFileName === fileName ? filtered[0].name : activeFileName;
    const updatedProj = {
      ...currentProject,
      files: filtered,
      updatedAt: Date.now()
    };
    setCurrentProject(updatedProj);
    setActiveFileName(nextActive);
    updateProjectInStorage(updatedProj);
  };

  const handleRenameFile = (oldName: string, newName: string) => {
    if (!currentProject || !newName || oldName === newName) return;
    const existing = getProjectFiles(currentProject);
    const updatedFiles = existing.map((f) =>
      f.name === oldName ? { ...f, name: newName, language: getFileLanguage(newName) } : f
    );
    const nextActive = activeFileName === oldName ? newName : activeFileName;
    const updatedProj = {
      ...currentProject,
      files: updatedFiles,
      updatedAt: Date.now()
    };
    setCurrentProject(updatedProj);
    setActiveFileName(nextActive);
    updateProjectInStorage(updatedProj);
  };

  const handleUploadFiles = (newFiles: ProjectFile[]) => {
    if (newFiles.length === 0) return;

    if (!currentProject) {
      const mainHtml =
        newFiles.find((f) => f.name.endsWith(".html"))?.content || newFiles[0]?.content || "";
      const newProj = createWebsiteProject("Uploaded Web App", "Imported files", mainHtml, newFiles);
      setCurrentProject(newProj);
      setActiveFileName(newFiles[0].name);
      const updated = [newProj, ...websites];
      setWebsites(updated);
      saveStoredWebsites(updated);
      return;
    }

    const existing = getProjectFiles(currentProject);
    const merged = [...existing];
    newFiles.forEach((nf) => {
      const idx = merged.findIndex((f) => f.name.toLowerCase() === nf.name.toLowerCase());
      if (idx >= 0) {
        merged[idx] = nf;
      } else {
        merged.push(nf);
      }
    });

    const updatedProj = {
      ...currentProject,
      files: merged,
      updatedAt: Date.now()
    };
    setCurrentProject(updatedProj);
    setActiveFileName(newFiles[0].name);
    updateProjectInStorage(updatedProj);
  };

  const handleCodeChange = (newContent: string) => {
    if (!currentProject) {
      const newProj = createWebsiteProject(
        titleInput || "Custom Web App",
        "Manual code",
        newContent
      );
      setCurrentProject(newProj);
      const updated = [newProj, ...websites];
      setWebsites(updated);
      saveStoredWebsites(updated);
      setSaveStatus("unsaved");
      return;
    }

    const existing = getProjectFiles(currentProject);
    const updatedFiles = existing.map((f) =>
      f.name === activeFileName ? { ...f, content: newContent } : f
    );

    const indexFile = updatedFiles.find((f) => f.name.toLowerCase() === "index.html");
    const mainCode = indexFile ? indexFile.content : newContent;

    const updatedProj = {
      ...currentProject,
      code: mainCode,
      files: updatedFiles,
      updatedAt: Date.now()
    };

    setCurrentProject(updatedProj);
    updateProjectInStorage(updatedProj);
    setSaveStatus("unsaved");
    setTimeout(() => setSaveStatus("saved"), 600);
  };

  // Helper: Extract clean HTML
  const extractHtmlFromResponse = (text: string): string => {
    const codeBlockMatch = text.match(/```(?:html|xml)?\s*([\s\S]*?)```/i);
    if (codeBlockMatch && codeBlockMatch[1]) {
      return codeBlockMatch[1].trim();
    }
    if (text.includes("<!DOCTYPE") || text.includes("<html")) {
      return text.trim();
    }
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aether Studio App</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen p-8 font-sans">
  <div class="max-w-4xl mx-auto">
    ${text}
  </div>
</body>
</html>`;
  };

  // --- AI CHAT GENERATION HANDLER ---
  const handleSendMessage = async (promptText: string) => {
    if (!promptText.trim() || isGenerating) return;

    const userMessage: StudioChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: promptText,
      timestamp: Date.now()
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setIsGenerating(true);
    setGenerationStep(0);

    const stepInterval = setInterval(() => {
      setGenerationStep((prev) => (prev < FAST_GENERATION_STEPS.length - 1 ? prev + 1 : prev));
    }, 600);

    try {
      let generatedHtml = "";

      // 1. Dedicated ultra-fast server endpoint
      try {
        const res = await fetch("/api/fast-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: promptText,
            existingCode: currentProject?.code || "",
            engine: selectedEngine
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.code && data.code.length > 50) {
            generatedHtml = data.code;
          }
        }
      } catch (serverErr) {
        console.warn("Fast-code server notice, using turbo fallback:", serverErr);
      }

      // 2. High-capability Open Neural Fallback (Qwen 2.5 Coder 32B / DeepSeek)
      if (!generatedHtml) {
        const systemInstruction =
          "You are Aetheris & Google AI Studio's Elite Full-Stack Web Architect and Award-Winning UI/UX Designer. Output a complete, production-ready single-file HTML web application with Tailwind CSS (<script src=\"https://cdn.tailwindcss.com\"></script>), FontAwesome icons (<link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css\">), Google Fonts (Plus Jakarta Sans), and complete working interactive JavaScript with state management, modals, and realistic data. Enclose strictly in a single ```html ... ``` block with zero conversational chatter.";

        const userPrompt = currentProject?.code && currentProject.code.length > 50
          ? `Update and elevate this web application based on the user's instructions:\n\`\`\`html\n${currentProject.code.slice(0, 5500)}\n\`\`\`\nRequested changes: ${promptText}\n\nDeliver the entire complete updated HTML document inside a single \`\`\`html block.`
          : `Build a complete, stunning, high-performance web application for: "${promptText}". Ensure rich interactivity, obsidian dark styling, responsive layouts, and zero placeholders.`;

        const fallbackRes = await fetch("https://text.pollinations.ai/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: userPrompt }
            ],
            model: selectedEngine === "deepseek-coder" ? "deepseek" : selectedEngine === "gpt-4o" ? "openai" : "qwen-coder",
            seed: Math.floor(Math.random() * 100000)
          })
        });

        if (fallbackRes.ok) {
          const rawText = await fallbackRes.text();
          generatedHtml = extractHtmlFromResponse(rawText);
        }
      }

      if (!generatedHtml) {
        generatedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${promptText.slice(0, 30)}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center p-6 font-sans">
  <div class="max-w-lg w-full text-center p-8 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl">
    <h1 class="text-2xl font-bold mb-3">${promptText}</h1>
    <p class="text-sm text-slate-400 mb-6">Generated in Aether Studio.</p>
    <button onclick="alert('App interactive!')" class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-white">Interactive</button>
  </div>
</body>
</html>`;
      }

      const generatedTitle =
        promptText.slice(0, 32) + (promptText.length > 32 ? "..." : "");

      // Update or Create Project
      if (currentProject) {
        const newVersion: WebsiteVersion = {
          version: (currentProject.versions?.length || 1) + 1,
          prompt: promptText,
          code: generatedHtml,
          timestamp: Date.now()
        };

        const existing = getProjectFiles(currentProject);
        const updatedFiles = existing.map((f) =>
          f.name === "index.html" || f.isEntry ? { ...f, content: generatedHtml } : f
        );
        if (!updatedFiles.some((f) => f.name === "index.html")) {
          updatedFiles.unshift({
            name: "index.html",
            content: generatedHtml,
            language: "html",
            isEntry: true
          });
        }

        const updatedProject: WebsiteProject = {
          ...currentProject,
          title: currentProject.title === "Untitled Web Application" ? generatedTitle : currentProject.title,
          prompt: promptText,
          code: generatedHtml,
          files: updatedFiles,
          updatedAt: Date.now(),
          versions: [...(currentProject.versions || []), newVersion]
        };

        setCurrentProject(updatedProject);
        setTitleInput(updatedProject.title);
        updateProjectInStorage(updatedProject);
      } else {
        const newProject = createWebsiteProject(generatedTitle, promptText, generatedHtml);
        setCurrentProject(newProject);
        setTitleInput(generatedTitle);
        const updatedList = [newProject, ...websites];
        setWebsites(updatedList);
        saveStoredWebsites(updatedList);
      }

      // Add Assistant Response Message to Chat
      const assistantMessage: StudioChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: "assistant",
        content: `I've updated your web application with: "${promptText}". Check out the live preview on the right or examine the code files in the Code tab.`,
        timestamp: Date.now(),
        suggestedPrompts: [
          "Add dark/light theme switch",
          "Improve mobile layout and responsiveness",
          "Add smooth animations and hover effects",
          "Add data persistence to localStorage"
        ]
      };
      setChatMessages((prev) => [...prev, assistantMessage]);
      setSaveStatus("saved");
    } catch (err) {
      console.error("Studio AI Generation error:", err);
      const errorMessage: StudioChatMessage = {
        id: `msg-${Date.now()}-error`,
        role: "assistant",
        content: "Notice: An error occurred while generating code. Please verify your connection and try again.",
        timestamp: Date.now()
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      clearInterval(stepInterval);
      setIsGenerating(false);
      setGenerationStep(0);
    }
  };

  // Quick export handlers
  const handleCopyCode = () => {
    if (!compiledPreviewHtml) return;
    navigator.clipboard.writeText(compiledPreviewHtml);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
    setIsExportDropdownOpen(false);
  };

  const handleDownloadHtml = () => {
    if (!compiledPreviewHtml) return;
    const blob = new Blob([compiledPreviewHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const filename = currentProject?.title
      ? currentProject.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      : "aether-website";
    a.download = `${filename}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setIsExportDropdownOpen(false);
  };

  const handleOpenInNewTab = () => {
    if (!compiledPreviewHtml) return;
    const blob = new Blob([compiledPreviewHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setIsExportDropdownOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0d0e12] text-slate-100 font-sans antialiased overflow-hidden select-none animate-in fade-in duration-200">
      {/* Hidden File Upload for Top Bar */}
      <input
        type="file"
        ref={fileUploadInputRef}
        onChange={(e) => {
          const files = e.target.files;
          if (!files || files.length === 0) return;
          const parsed: ProjectFile[] = [];
          let count = 0;
          Array.from(files).forEach((file) => {
            const r = new FileReader();
            r.onload = (ev) => {
              parsed.push({
                name: file.name,
                content: (ev.target?.result as string) || "",
                language: getFileLanguage(file.name)
              });
              count++;
              if (count === files.length) {
                handleUploadFiles(parsed);
              }
            };
            r.readAsText(file);
          });
          if (fileUploadInputRef.current) fileUploadInputRef.current.value = "";
        }}
        multiple
        accept=".html,.htm,.css,.js,.jsx,.ts,.tsx,.json,.md,.txt"
        className="hidden"
      />

      {/* TOP STUDIO NAVIGATION BAR */}
      <header className="h-14 px-3 sm:px-4 bg-[#131418] border-b border-zinc-800/80 flex items-center justify-between shrink-0 gap-2">
        {/* Left: Branding & Project Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25 ring-1 ring-white/10">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 font-extrabold text-xs tracking-wider text-white">
                <span>AETHER STUDIO</span>
                <span className="px-1.5 py-0.2 rounded-md bg-blue-950/80 text-blue-400 text-[9px] font-mono font-bold border border-blue-800/80 tracking-normal">
                  BUILD
                </span>
              </div>
              <span className="text-[10px] text-slate-400 tracking-tight hidden sm:block">
                Left Chat • Right Preview & Code
              </span>
            </div>
          </div>

          <div className="h-5 w-[1px] bg-zinc-800 hidden md:block shrink-0 mx-1" />

          {/* Editable Project Title */}
          <div className="flex items-center gap-1.5 min-w-0">
            {isEditingTitle ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
                  autoFocus
                  className="px-2 py-1 text-xs bg-zinc-900 border border-blue-500 rounded-lg text-white focus:outline-none max-w-[180px] sm:max-w-[240px]"
                />
                <button
                  onClick={handleSaveTitle}
                  className="p-1 text-emerald-400 hover:text-white"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingTitle(true)}
                className="group flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-zinc-800/80 cursor-pointer transition min-w-0"
                title="Click to rename project"
              >
                <span className="font-semibold text-xs sm:text-sm text-slate-200 truncate max-w-[140px] sm:max-w-[240px]">
                  {currentProject ? currentProject.title : "Untitled Web Application"}
                </span>
                <span className="text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition">
                  ✎
                </span>
              </div>
            )}

            {/* Save Status Indicator */}
            <span className="hidden xl:inline-flex items-center gap-1 text-[11px] text-slate-400 px-2 py-0.5 rounded-full bg-zinc-900/80 border border-zinc-800">
              {saveStatus === "saved" && (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Saved</span>
                </>
              )}
              {saveStatus === "saving" && (
                <>
                  <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
                  <span>Saving...</span>
                </>
              )}
              {saveStatus === "unsaved" && (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <span className="text-amber-300">Unsaved edits</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Center: Tabs Switcher (Preview / Code / Split) & Viewport Mode */}
        <div className="flex items-center gap-2">
          {/* TAB SWITCHER */}
          <div className="flex items-center bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 shadow-inner">
            <button
              id="studio-tab-preview"
              onClick={() => setActiveTab("preview")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === "preview"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-zinc-800"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>

            <button
              id="studio-tab-code"
              onClick={() => setActiveTab("code")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === "code"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-zinc-800"
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Code</span>
            </button>

            <button
              id="studio-tab-split"
              onClick={() => setActiveTab("split")}
              className={`hidden lg:flex px-3 py-1.5 rounded-lg text-xs font-semibold items-center gap-1.5 transition ${
                activeTab === "split"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-zinc-800"
              }`}
              title="Split View: Code + Preview"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>
          </div>

          {/* Viewport Switcher */}
          {(activeTab === "preview" || activeTab === "split") && (
            <div className="hidden sm:flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setViewport("desktop")}
                title="Desktop View"
                className={`p-1.5 rounded-lg transition ${
                  viewport === "desktop"
                    ? "bg-zinc-800 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200 hover:bg-zinc-800/50"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewport("tablet")}
                title="Tablet View"
                className={`p-1.5 rounded-lg transition ${
                  viewport === "tablet"
                    ? "bg-zinc-800 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200 hover:bg-zinc-800/50"
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewport("mobile")}
                title="Mobile View"
                className={`p-1.5 rounded-lg transition ${
                  viewport === "mobile"
                    ? "bg-zinc-800 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200 hover:bg-zinc-800/50"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right Actions: Download Full Project, Delete Web, Upload, Export, Websites, New Project, Close */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* DIRECT 1-CLICK DOWNLOAD FULL PROJECT (ZIP) */}
          <button
            id="studio-top-download-full-project-btn"
            onClick={handleDownloadFullProject}
            title="Download complete full project as ZIP (HTML, CSS, JS, Assets)"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition active:scale-95 cursor-pointer shrink-0"
          >
            <Archive className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download Full Project</span>
            <span className="sm:hidden">ZIP</span>
          </button>

          {/* DELETE WEB FROM TOP BAR */}
          <button
            id="studio-top-delete-web-btn"
            onClick={() => setIsDeleteModalOpen(true)}
            title="Delete current website from studio"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-rose-950/60 border border-zinc-800 hover:border-rose-700/80 text-slate-300 hover:text-rose-300 text-xs font-semibold transition active:scale-95 cursor-pointer shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden lg:inline">Delete Web</span>
          </button>

          {/* UPLOAD / IMPORT FILE BUTTON */}
          <button
            id="studio-top-upload-btn"
            onClick={() => fileUploadInputRef.current?.click()}
            title="Upload files into project"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-slate-200 text-xs font-semibold transition"
          >
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden xl:inline">Upload</span>
          </button>

          {/* EXPORT DROPDOWN */}
          <div className="relative">
            <button
              id="studio-top-export-btn"
              onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              title="Export project"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {isExportDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-52 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl py-1.5 z-50 text-xs animate-in fade-in duration-150">
                <button
                  onClick={() => {
                    exportProjectAsZip(currentFiles, currentProject?.title || "aether-project");
                    setIsExportDropdownOpen(false);
                  }}
                  disabled={currentFiles.length === 0}
                  className="w-full px-3 py-2 text-left hover:bg-zinc-800 flex items-center gap-2 text-slate-200 hover:text-white transition disabled:opacity-40"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Download All (ZIP)</span>
                </button>
                <button
                  onClick={handleDownloadHtml}
                  disabled={!compiledPreviewHtml}
                  className="w-full px-3 py-2 text-left hover:bg-zinc-800 flex items-center gap-2 text-slate-200 hover:text-white transition disabled:opacity-40"
                >
                  <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download HTML (.html)</span>
                </button>
                <button
                  onClick={handleCopyCode}
                  disabled={!compiledPreviewHtml}
                  className="w-full px-3 py-2 text-left hover:bg-zinc-800 flex items-center gap-2 text-slate-200 hover:text-white transition disabled:opacity-40"
                >
                  {copiedNotification ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-blue-400" />
                  )}
                  <span>{copiedNotification ? "Copied!" : "Copy Full Code"}</span>
                </button>
                <button
                  onClick={handleOpenInNewTab}
                  disabled={!compiledPreviewHtml}
                  className="w-full px-3 py-2 text-left hover:bg-zinc-800 flex items-center gap-2 text-slate-200 hover:text-white transition disabled:opacity-40"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                  <span>Open in New Tab</span>
                </button>
              </div>
            )}
          </div>

          {/* WEBSITES MANAGER DRAWER (0 pre-made webs count) */}
          <button
            id="studio-top-websites-btn"
            onClick={() => setIsSavedModalOpen(true)}
            title="Saved websites in Aether Studio"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-slate-200 text-xs font-semibold transition"
          >
            <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Websites</span>
            <span className="px-1.5 py-0.2 rounded-full bg-zinc-800 text-[10px] text-slate-300 font-mono font-bold">
              {websites.length}
            </span>
          </button>

          {/* NEW PROJECT */}
          <button
            id="studio-top-new-btn"
            onClick={handleNewProject}
            title="Start clean slate project"
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">New</span>
          </button>

          {/* EXIT / CLOSE */}
          <button
            id="studio-top-close-btn"
            onClick={onClose}
            title="Close Aether Studio"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-zinc-800 transition ml-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* MAIN BODY: GOOGLE AI STUDIO SPLIT ARCHITECTURE */}
      {/* LEFT: CHAT | RIGHT: PREVIEW & CODE */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* LEFT CHAT PANE (35% to 40% width on desktop) */}
        <div className="w-full md:w-[380px] lg:w-[420px] xl:w-[460px] h-1/2 md:h-full shrink-0 flex flex-col">
          <StudioChat
            messages={chatMessages}
            isGenerating={isGenerating}
            generationStep={generationStep}
            generationSteps={FAST_GENERATION_STEPS}
            selectedEngine={selectedEngine}
            onSelectEngine={setSelectedEngine}
            onSendMessage={handleSendMessage}
            onClearChat={() => setChatMessages([])}
            quickSuggestions={QUICK_PROMPT_SUGGESTIONS}
          />
        </div>

        {/* RIGHT WORKSPACE PANE (Preview / Code / Split) */}
        <div className="flex-1 h-1/2 md:h-full flex flex-col overflow-hidden bg-[#0a0b0e] relative">
          {activeTab === "preview" && (
            /* PREVIEW VIEW */
            <StudioPreview
              htmlCode={compiledPreviewHtml}
              viewport={viewport}
              onSelectPromptSuggestion={handleSendMessage}
              quickSuggestions={QUICK_PROMPT_SUGGESTIONS}
              projectTitle={currentProject?.title || "aether-app"}
            />
          )}

          {activeTab === "code" && (
            /* CODE VIEW (FILE EXPLORER + CODE EDITOR) */
            <div className="flex-1 h-full flex overflow-hidden">
              {/* FILE EXPLORER: SEE FILES, MAKE, DELETE, RENAME, UPLOAD */}
              <StudioFileExplorer
                files={currentFiles}
                activeFileName={activeFileName}
                onSelectFile={setActiveFileName}
                onCreateFile={handleCreateFile}
                onDeleteFile={handleDeleteFile}
                onRenameFile={handleRenameFile}
                onUploadFiles={handleUploadFiles}
                projectTitle={currentProject?.title || "aether-project"}
              />

              {/* CODE EDITOR */}
              <StudioCodeEditor
                file={activeFile}
                onCodeChange={handleCodeChange}
                isSaved={saveStatus === "saved"}
              />
            </div>
          )}

          {activeTab === "split" && (
            /* SPLIT VIEW: CODE ON LEFT, PREVIEW ON RIGHT */
            <div className="flex-1 h-full flex overflow-hidden">
              {/* Code side with compact file explorer */}
              <div className="w-1/2 h-full flex border-r border-zinc-800 overflow-hidden">
                <StudioFileExplorer
                  files={currentFiles}
                  activeFileName={activeFileName}
                  onSelectFile={setActiveFileName}
                  onCreateFile={handleCreateFile}
                  onDeleteFile={handleDeleteFile}
                  onRenameFile={handleRenameFile}
                  onUploadFiles={handleUploadFiles}
                  projectTitle={currentProject?.title || "aether-project"}
                />
                <StudioCodeEditor
                  file={activeFile}
                  onCodeChange={handleCodeChange}
                  isSaved={saveStatus === "saved"}
                />
              </div>

              {/* Preview side */}
              <div className="w-1/2 h-full overflow-hidden">
                <StudioPreview
                  htmlCode={compiledPreviewHtml}
                  viewport={viewport}
                  onSelectPromptSuggestion={handleSendMessage}
                  quickSuggestions={QUICK_PROMPT_SUGGESTIONS}
                  projectTitle={currentProject?.title || "aether-app"}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SAVED WEBSITES DRAWER MODAL */}
      <SavedWebsitesModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        websites={websites}
        currentProjectId={currentProject?.id || ""}
        onSelectProject={handleSelectProject}
        onNewProject={handleNewProject}
        onDeleteProject={handleDeleteProject}
        onDuplicateProject={handleDuplicateProject}
      />

      {/* DELETE CONFIRMATION MODAL ("DELETE WEB FROM UP") */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#15161c] border border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Delete Website?</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Are you sure you want to delete <span className="text-slate-200 font-semibold">"{currentProject?.title || 'this website'}"</span>? All files in this project will be deleted.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/80">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-zinc-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCurrentProject}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition flex items-center gap-1.5 active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Website</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING SUCCESS TOAST NOTIFICATIONS */}
      {downloadSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold shadow-2xl shadow-blue-500/30 border border-blue-400/30 animate-in slide-in-from-bottom-2 duration-200">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>Full project ZIP downloaded successfully!</span>
        </div>
      )}

      {deleteSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-zinc-900 text-slate-200 text-xs font-semibold shadow-2xl border border-rose-500/40 animate-in slide-in-from-bottom-2 duration-200">
          <Trash2 className="w-4 h-4 text-rose-400" />
          <span>Website deleted successfully</span>
        </div>
      )}
    </div>
  );
};
