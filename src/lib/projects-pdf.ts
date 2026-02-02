import fs from "node:fs";
import path from "node:path";
import { withBasePath } from "./get-base-path";

import { getProjectsMetadata } from "~/lib/projects-metadata";

export interface ProjectPdfItem {
  title: string;
  subtitle?: string | null;
  pdfPath: string;
  imagePath: string;
  thumbnailPath: string;
}

/**
 * Normalize a project title/name for consistent file lookups
 * Converts to lowercase and replaces spaces/special chars with hyphens
 */
export function normalizeProjectFilename(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^\w-]/g, "-") // Replace special chars with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Generate all possible filename variations for a project
 * Returns array of candidate filenames to check
 */
function getFilenameVariations(
  baseName: string,
  metadataTitle?: string
): string[] {
  const variations = new Set<string>();

  // Original basename variations
  variations.add(baseName);
  variations.add(normalizeProjectFilename(baseName));

  // Remove trailing numbers (e.g., "project-1" -> "project")
  const withoutNumbers = normalizeProjectFilename(baseName).replace(/-\d+$/, "");
  if (withoutNumbers) {
    variations.add(withoutNumbers);
  }

  // If metadata title exists and is different, add its variations
  if (metadataTitle && metadataTitle !== baseName) {
    variations.add(metadataTitle);
    variations.add(normalizeProjectFilename(metadataTitle));
  }

  return Array.from(variations).filter((v) => v.length > 0);
}

function getProjectsOrder(): string[] {
  const orderFile = path.join(
    process.cwd(),
    "src/content/data/projects-order.json"
  );
  try {
    if (fs.existsSync(orderFile)) {
      const data = fs.readFileSync(orderFile, "utf-8");
      const parsed = JSON.parse(data);
      return parsed.order || [];
    }
  } catch (error) {
    console.error("Failed to read projects order:", error);
  }
  return [];
}

export function saveProjectsOrder(order: string[]): void {
  const orderFile = path.join(
    process.cwd(),
    "src/content/data/projects-order.json"
  );
  try {
    fs.writeFileSync(orderFile, JSON.stringify({ order }, null, 2));
  } catch (error) {
    console.error("Failed to save projects order:", error);
    throw error;
  }
}

export function getProjectPdfItems(): ProjectPdfItem[] {
  const projectsDir = path.join(process.cwd(), "public", "projects");
  const projectsJpgDir = path.join(process.cwd(), "public", "projects-jpg");
  const thumbnailsDir = path.join(process.cwd(), "public", "projects-thumbnails");

  // Check if directories exist
  if (!fs.existsSync(projectsDir)) {
    return [];
  }

  // Read all PDF files from projects directory
  const files = fs.readdirSync(projectsDir);
  const pdfFiles = files.filter((file) => file.toLowerCase().endsWith(".pdf"));

  // Map each PDF to a project item
  const metadata = getProjectsMetadata();

  const items: ProjectPdfItem[] = pdfFiles.map((pdfFile) => {
    const baseName = path.basename(pdfFile, ".pdf");
    const title = baseName;

    // Get metadata first
    const meta = metadata[baseName] || metadata[normalizeProjectFilename(baseName)] || {};

    // Generate all possible filename variations using the utility function
    const filenameVariations = getFilenameVariations(baseName, meta.title);

    // Try to find a matching JPG image (full-size)
    let imagePath = withBasePath("/projects/" + pdfFile); // Fallback to PDF

    if (fs.existsSync(projectsJpgDir)) {
      const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

      outer: for (const variation of filenameVariations) {
        for (const ext of imageExtensions) {
          const imageFile = `${variation}${ext}`;
          const imageFullPath = path.join(projectsJpgDir, imageFile);

          if (fs.existsSync(imageFullPath)) {
            imagePath = withBasePath(`/projects-jpg/${imageFile}`);
            break outer;
          }
        }
      }
    }

    // Try to find a custom thumbnail, fallback to full-size image
    let thumbnailPath = imagePath;
    const thumbnailExtensions = [".png", ".jpg", ".jpeg", ".webp", ".avif"];

    // First check projects-thumbnails directory (custom uploads)
    if (fs.existsSync(thumbnailsDir)) {
      outer: for (const variation of filenameVariations) {
        for (const ext of thumbnailExtensions) {
          const thumbnailFile = `${variation}${ext}`;
          const thumbnailFullPath = path.join(thumbnailsDir, thumbnailFile);

          if (fs.existsSync(thumbnailFullPath)) {
            thumbnailPath = withBasePath(`/projects-thumbnails/${thumbnailFile}`);
            console.log(`[Projects PDF] Found custom thumbnail: ${thumbnailFile} for project "${baseName}"`);
            break outer;
          }
        }
      }
    }

    // Also check legacy thumbnails directory if no custom thumbnail found
    if (thumbnailPath === imagePath) {
      const legacyThumbnailsDir = path.join(process.cwd(), "public", "thumbnails");
      if (fs.existsSync(legacyThumbnailsDir)) {
        outer: for (const variation of filenameVariations) {
          for (const ext of thumbnailExtensions) {
            const thumbnailFile = `${variation}${ext}`;
            const thumbnailFullPath = path.join(legacyThumbnailsDir, thumbnailFile);

            if (fs.existsSync(thumbnailFullPath)) {
              thumbnailPath = withBasePath(`/thumbnails/${thumbnailFile}`);
              console.log(`[Projects PDF] Found legacy thumbnail: ${thumbnailFile} for project "${baseName}"`);
              break outer;
            }
          }
        }
      }
    }

    return {
      title: meta.title && meta.title.length > 0 ? meta.title : title,
      subtitle: meta.subtitle || null,
      pdfPath: withBasePath(`/projects/${pdfFile}`),
      imagePath,
      thumbnailPath,
    };
  });

  // Apply custom order if available
  const customOrder = getProjectsOrder();

  if (customOrder.length > 0) {
    const itemMap = new Map(items.map((item) => [item.title, item]));
    const orderedItems: ProjectPdfItem[] = [];

    // Add items in custom order
    for (const title of customOrder) {
      const item = itemMap.get(title);
      if (item) {
        orderedItems.push(item);
        itemMap.delete(title);
      }
    }

    // Add any remaining items not in the order list
    itemMap.forEach((item) => orderedItems.push(item));

    return orderedItems;
  }

  return items;
}

export function deleteProjectPdf(title: string): void {
  const projectsDir = path.join(process.cwd(), "public", "projects");
  const projectsJpgDir = path.join(process.cwd(), "public", "projects-jpg");
  const thumbnailsDir = path.join(process.cwd(), "public", "projects-thumbnails");

  // Delete PDF
  const pdfPath = path.join(projectsDir, `${title}.pdf`);
  if (fs.existsSync(pdfPath)) {
    fs.unlinkSync(pdfPath);
  }

  const lowercaseBase = title.toLowerCase().replace(/\s+/g, "-");
  const extensions = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

  // Also try to delete associated image
  if (fs.existsSync(projectsJpgDir)) {
    for (const ext of extensions) {
      const imagePath = path.join(projectsJpgDir, `${lowercaseBase}${ext}`);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        break;
      }
    }
  }

  // Also try to delete associated thumbnail
  if (fs.existsSync(thumbnailsDir)) {
    const candidates = [title, lowercaseBase];
    outer: for (const candidate of candidates) {
      for (const ext of extensions) {
        const thumbPath = path.join(thumbnailsDir, `${candidate}${ext}`);
        if (fs.existsSync(thumbPath)) {
          fs.unlinkSync(thumbPath);
          break outer;
        }
      }
    }
  }
}
