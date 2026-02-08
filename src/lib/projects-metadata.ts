import fs from "node:fs";
import path from "node:path";

const METADATA_PATH = path.join(
  process.cwd(),
  "src",
  "content",
  "data",
  "projects-metadata.json"
);

export interface ProjectMetadata {
  title?: string;
  subtitle?: string;
}

export function getProjectsMetadata(): Record<string, ProjectMetadata> {
  try {
    if (!fs.existsSync(METADATA_PATH)) return {};
    const raw = fs.readFileSync(METADATA_PATH, "utf-8");
    return JSON.parse(raw || "{}");
  } catch (error) {
    console.error("Failed to read projects metadata:", error);
    return {};
  }
}

export function setProjectMetadata(key: string, meta: ProjectMetadata) {
  try {
    const current = getProjectsMetadata();
    current[key] = { ...(current[key] || {}), ...meta };
    fs.writeFileSync(METADATA_PATH, JSON.stringify(current, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save project metadata:", error);
    throw error;
  }
}

export function saveProjectsMetadata(data: Record<string, ProjectMetadata>) {
  try {
    fs.writeFileSync(
      METADATA_PATH,
      JSON.stringify(data || {}, null, 2),
      "utf-8"
    );
  } catch (error) {
    console.error("Failed to write projects metadata:", error);
    throw error;
  }
}
