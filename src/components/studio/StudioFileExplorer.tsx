import React, { useState, useRef } from "react";
import {
  FileCode,
  FileText,
  FilePlus,
  Trash2,
  Edit2,
  Upload,
  Download,
  FolderTree,
  Check,
  X,
  Plus,
  Layers,
  File
} from "lucide-react";
import { ProjectFile } from "../../types";
import { getFileLanguage, exportProjectAsZip } from "./bundleUtils";

interface StudioFileExplorerProps {
  files: ProjectFile[];
  activeFileName: string;
  onSelectFile: (fileName: string) => void;
  onCreateFile: (fileName: string) => void;
  onDeleteFile: (fileName: string) => void;
  onRenameFile: (oldName: string, newName: string) => void;
  onUploadFiles: (newFiles: ProjectFile[]) => void;
  projectTitle: string;
}

export const StudioFileExplorer: React.FC<StudioFileExplorerProps> = ({
  files,
  activeFileName,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
  onUploadFiles,
  projectTitle
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [editingFileName, setEditingFileName] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState("");
  const [deleteConfirmName, setDeleteConfirmName] = useState<string | null>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const handleStartCreate = () => {
    setIsCreating(true);
    setNewFileName("");
  };

  const handleConfirmCreate = () => {
    const trimmed = newFileName.trim();
    if (!trimmed) {
      setIsCreating(false);
      return;
    }
    // ensure file has extension
    const finalName = trimmed.includes(".") ? trimmed : `${trimmed}.html`;
    onCreateFile(finalName);
    setIsCreating(false);
    setNewFileName("");
  };

  const handleStartRename = (fileName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFileName(fileName);
    setRenameInput(fileName);
  };

  const handleConfirmRename = () => {
    const trimmed = renameInput.trim();
    if (trimmed && editingFileName && trimmed !== editingFileName) {
      onRenameFile(editingFileName, trimmed);
    }
    setEditingFileName(null);
    setRenameInput("");
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    const parsedFiles: ProjectFile[] = [];
    let processed = 0;

    Array.from(uploadedFiles).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = (event.target?.result as string) || "";
        parsedFiles.push({
          name: file.name,
          content,
          language: getFileLanguage(file.name)
        });
        processed++;
        if (processed === uploadedFiles.length) {
          onUploadFiles(parsedFiles);
        }
      };
      reader.readAsText(file);
    });

    if (uploadInputRef.current) uploadInputRef.current.value = "";
  };

  const renderFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    switch (ext) {
      case "html":
      case "htm":
        return <FileCode className="w-3.5 h-3.5 text-orange-400 shrink-0" />;
      case "css":
        return <FileCode className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
      case "js":
      case "jsx":
      case "ts":
      case "tsx":
        return <FileCode className="w-3.5 h-3.5 text-amber-300 shrink-0" />;
      case "json":
        return <FileCode className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      case "md":
      case "txt":
        return <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
      default:
        return <File className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
    }
  };

  return (
    <div className="w-56 sm:w-64 h-full bg-[#121318] border-r border-zinc-800 flex flex-col shrink-0 select-none text-xs">
      {/* Hidden upload input */}
      <input
        type="file"
        ref={uploadInputRef}
        onChange={handleFileInputChange}
        multiple
        accept=".html,.htm,.css,.js,.jsx,.ts,.tsx,.json,.md,.txt"
        className="hidden"
      />

      {/* EXPLORER HEADER */}
      <div className="h-10 px-3 bg-[#16171d] border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-bold text-slate-300 text-[11px] uppercase tracking-wider">
          <FolderTree className="w-3.5 h-3.5 text-blue-400" />
          <span>Files ({files.length})</span>
        </div>

        <div className="flex items-center gap-1">
          {/* MAKE / NEW FILE BUTTON */}
          <button
            onClick={handleStartCreate}
            title="Make new file"
            className="p-1 rounded hover:bg-zinc-800 text-slate-400 hover:text-white transition"
          >
            <FilePlus className="w-3.5 h-3.5 text-emerald-400" />
          </button>

          {/* UPLOAD FILE BUTTON */}
          <button
            onClick={() => uploadInputRef.current?.click()}
            title="Upload files from computer"
            className="p-1 rounded hover:bg-zinc-800 text-slate-400 hover:text-white transition"
          >
            <Upload className="w-3.5 h-3.5 text-blue-400" />
          </button>

          {/* EXPORT ZIP BUTTON */}
          <button
            onClick={() => exportProjectAsZip(files, projectTitle)}
            title="Download project as ZIP"
            className="p-1 rounded hover:bg-zinc-800 text-slate-400 hover:text-white transition"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
          </button>
        </div>
      </div>

      {/* FILE LIST */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
        {/* NEW FILE INPUT FORM */}
        {isCreating && (
          <div className="p-1.5 bg-zinc-900 border border-blue-500/80 rounded-lg flex items-center gap-1 mb-1 shadow-md">
            <FilePlus className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleConfirmCreate();
                if (e.key === "Escape") setIsCreating(false);
              }}
              placeholder="filename.html / style.css..."
              autoFocus
              className="flex-1 bg-transparent text-xs text-white focus:outline-none min-w-0"
            />
            <button
              onClick={handleConfirmCreate}
              className="p-0.5 text-emerald-400 hover:text-white"
            >
              <Check className="w-3 h-3" />
            </button>
            <button
              onClick={() => setIsCreating(false)}
              className="p-0.5 text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {files.map((file) => {
          const isActive = file.name === activeFileName;

          return (
            <div
              key={file.name}
              onClick={() => onSelectFile(file.name)}
              className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition ${
                isActive
                  ? "bg-blue-600/20 text-white border border-blue-500/40 font-semibold"
                  : "text-slate-300 hover:bg-zinc-800/80 hover:text-white"
              }`}
            >
              {/* Left: icon + filename */}
              <div className="flex items-center gap-2 min-w-0 flex-1 mr-1">
                {renderFileIcon(file.name)}

                {editingFileName === file.name ? (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 flex-1"
                  >
                    <input
                      type="text"
                      value={renameInput}
                      onChange={(e) => setRenameInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleConfirmRename();
                        if (e.key === "Escape") setEditingFileName(null);
                      }}
                      autoFocus
                      className="w-full bg-zinc-900 px-1 py-0.5 text-xs text-white border border-blue-500 rounded focus:outline-none"
                    />
                    <button
                      onClick={handleConfirmRename}
                      className="text-emerald-400 hover:text-white"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <span className="truncate text-xs">{file.name}</span>
                )}
              </div>

              {/* Action Buttons (Rename / Delete) */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                {/* RENAME */}
                <button
                  onClick={(e) => handleStartRename(file.name, e)}
                  title="Rename file"
                  className="p-1 hover:text-blue-400 rounded transition"
                >
                  <Edit2 className="w-3 h-3" />
                </button>

                {/* DELETE */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirmName(file.name);
                  }}
                  title="Delete file"
                  className="p-1 hover:text-rose-400 rounded transition"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* DELETE CONFIRMATION MODAL / TOAST */}
      {deleteConfirmName && (
        <div className="p-3 bg-zinc-900 border-t border-rose-900/60 flex flex-col gap-2 animate-in fade-in">
          <span className="text-[11px] text-slate-300">
            Delete <span className="font-mono text-rose-400 font-bold">{deleteConfirmName}</span>?
          </span>
          <div className="flex items-center gap-1.5 justify-end">
            <button
              onClick={() => setDeleteConfirmName(null)}
              className="px-2 py-1 rounded bg-zinc-800 text-[11px] text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onDeleteFile(deleteConfirmName);
                setDeleteConfirmName(null);
              }}
              className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 text-[11px] text-white font-semibold"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* QUICK FOOTER HINT */}
      <div className="p-2 border-t border-zinc-800/80 text-[10px] text-slate-500 flex items-center justify-between">
        <span>Click to edit file</span>
        <button
          onClick={handleStartCreate}
          className="text-blue-400 hover:underline flex items-center gap-0.5"
        >
          <Plus className="w-3 h-3" /> Make
        </button>
      </div>
    </div>
  );
};
