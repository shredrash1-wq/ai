import { WebsiteProject, ProjectFile } from "../types";

const STORAGE_KEY = "aether_studio_saved_websites_v2";

export const STARTER_TEMPLATES: WebsiteProject[] = [];

export function getStoredWebsites(): WebsiteProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Filter out any leftover pre-made templates to guarantee 0 pre-made webs
        return parsed.filter((p) => !p.id?.startsWith("template-"));
      }
    }
  } catch (e) {
    console.error("Failed to read stored websites:", e);
  }
  // Guarantee 0 pre-made websites
  return [];
}

export function saveStoredWebsites(projects: WebsiteProject[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error("Failed to save websites to localStorage:", e);
  }
}

export function createWebsiteProject(title: string, prompt: string, code: string, customFiles?: ProjectFile[]): WebsiteProject {
  const defaultFiles: ProjectFile[] = customFiles || [
    {
      name: "index.html",
      content: code || "",
      language: "html",
      isEntry: true
    }
  ];

  const newProject: WebsiteProject = {
    id: `site-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: title || "Untitled Project",
    prompt: prompt || "",
    code: code || "",
    files: defaultFiles,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    category: "Web App",
    versions: [
      {
        version: 1,
        prompt: prompt || "Initial generation",
        code: code || "",
        timestamp: Date.now()
      }
    ]
  };
  return newProject;
}
