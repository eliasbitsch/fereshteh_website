import fs from "node:fs";
import path from "node:path";
import { getProjectsMetadata } from "~/lib/projects-metadata";
import { withBasePath } from "./get-base-path";

export interface ProjectPdfItem {
  title: string;
  subtitle?: string | null;
  pdfPath: string;
  webPdfPath?: string;
  imagePath: string;
  imagePaths: string[];
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
  const withoutNumbers = normalizeProjectFilename(baseName).replace(
    /-\d+$/,
    ""
  );
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
  const thumbnailsDir = path.join(
    process.cwd(),
    "public",
    "projects-thumbnails"
  );

  // Check if directories exist
  if (!fs.existsSync(projectsDir)) {
    return [];
  }

  // Read all PDF files from projects directory
  const files = fs.readdirSync(projectsDir);
  const pdfFiles = files.filter(
    (file) => file.toLowerCase().endsWith(".pdf") && !file.toLowerCase().endsWith(".web.pdf")
  );

  // Map each PDF to a project item
  const metadata = getProjectsMetadata();

  // Read projects-jpg directory listing once for page file detection
  let jpgDirFiles: string[] = [];
  if (fs.existsSync(projectsJpgDir)) {
    try {
      jpgDirFiles = fs.readdirSync(projectsJpgDir);
    } catch {}
  }

  const items: ProjectPdfItem[] = pdfFiles.map((pdfFile) => {
    const baseName = path.basename(pdfFile, ".pdf");
    const title = baseName;

    // Get metadata first
    const meta =
      metadata[baseName] || metadata[normalizeProjectFilename(baseName)] || {};

    // Generate all possible filename variations using the utility function
    const filenameVariations = getFilenameVariations(baseName, meta.title);

    // Try to find multi-page images first (e.g., project-page-001.jpg)
    let imagePaths: string[] = [];
    for (const variation of filenameVariations) {
      const escapedVar = variation.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pagePattern = new RegExp(
        `^${escapedVar}-page-\\d{3}\\.(webp|avif|jpg|png)$`
      );
      const pageFiles = jpgDirFiles
        .filter((f) => pagePattern.test(f))
        .sort();
      if (pageFiles.length > 0) {
        imagePaths = pageFiles.map((f) => withBasePath(`/projects-jpg/${f}`));
        break;
      }
    }

    // Try to find a matching single image (legacy/fallback)
    let imagePath = withBasePath(`/projects/${pdfFile}`); // Fallback to PDF

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

    // If multi-page images found, use first as imagePath; otherwise wrap single image
    if (imagePaths.length > 0) {
      imagePath = imagePaths[0];
    } else {
      imagePaths = [imagePath];
    }

    // Try to find a custom thumbnail (no fallback to full-size image)
    let thumbnailPath = "";
    const thumbnailExtensions = [".png", ".jpg", ".jpeg", ".webp", ".avif"];

    // First check projects-thumbnails directory (custom uploads)
    if (fs.existsSync(thumbnailsDir)) {
      outer: for (const variation of filenameVariations) {
        for (const ext of thumbnailExtensions) {
          const thumbnailFile = `${variation}${ext}`;
          const thumbnailFullPath = path.join(thumbnailsDir, thumbnailFile);

          if (fs.existsSync(thumbnailFullPath)) {
            thumbnailPath = withBasePath(
              `/projects-thumbnails/${thumbnailFile}`
            );
            console.log(
              `[Projects PDF] Found custom thumbnail: ${thumbnailFile} for project "${baseName}"`
            );
            break outer;
          }
        }
      }
    }

    // Also check legacy thumbnails directory if no custom thumbnail found
    if (!thumbnailPath) {
      const legacyThumbnailsDir = path.join(
        process.cwd(),
        "public",
        "thumbnails"
      );
      if (fs.existsSync(legacyThumbnailsDir)) {
        outer: for (const variation of filenameVariations) {
          for (const ext of thumbnailExtensions) {
            const thumbnailFile = `${variation}${ext}`;
            const thumbnailFullPath = path.join(
              legacyThumbnailsDir,
              thumbnailFile
            );

            if (fs.existsSync(thumbnailFullPath)) {
              thumbnailPath = withBasePath(`/thumbnails/${thumbnailFile}`);
              console.log(
                `[Projects PDF] Found legacy thumbnail: ${thumbnailFile} for project "${baseName}"`
              );
              break outer;
            }
          }
        }
      }
    }

    // Check if web-optimized PDF exists
    const webPdfFile = pdfFile.replace(/\.pdf$/i, ".web.pdf");
    const webPdfFullPath = path.join(projectsDir, webPdfFile);
    const webPdfPath = fs.existsSync(webPdfFullPath)
      ? withBasePath(`/projects/${webPdfFile}`)
      : undefined;

    return {
      title: meta.title && meta.title.length > 0 ? meta.title : title,
      subtitle: meta.subtitle || null,
      pdfPath: withBasePath(`/projects/${pdfFile}`),
      webPdfPath,
      imagePath,
      imagePaths,
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
    for (const item of itemMap.values()) {
      orderedItems.push(item);
    }

    return orderedItems;
  }

  return items;
}

export function deleteProjectPdf(title: string): void {
  const projectsDir = path.join(process.cwd(), "public", "projects");
  const projectsJpgDir = path.join(process.cwd(), "public", "projects-jpg");
  const thumbnailsDir = path.join(
    process.cwd(),
    "public",
    "projects-thumbnails"
  );

  // Find and delete the PDF and web-optimized version
  let deleted = false;
  const pdfPath = path.join(projectsDir, `${title}.pdf`);
  const webPdfPath = path.join(projectsDir, `${title}.web.pdf`);
  if (fs.existsSync(pdfPath)) {
    fs.unlinkSync(pdfPath);
    deleted = true;
  }
  if (fs.existsSync(webPdfPath)) {
    fs.unlinkSync(webPdfPath);
  }

  // If not found by title, search by matching metadata title or normalized name
  if (!deleted && fs.existsSync(projectsDir)) {
    const metadata = getProjectsMetadata();
    const files = fs.readdirSync(projectsDir).filter((f) => f.toLowerCase().endsWith(".pdf"));
    for (const file of files) {
      const baseName = path.basename(file, ".pdf");
      const meta = metadata[baseName] || metadata[normalizeProjectFilename(baseName)] || {};
      if (meta.title === title || baseName === title || normalizeProjectFilename(baseName) === normalizeProjectFilename(title)) {
        fs.unlinkSync(path.join(projectsDir, file));
        // Also delete web-optimized version
        const webFile = file.replace(/\.pdf$/i, ".web.pdf");
        const webFilePath = path.join(projectsDir, webFile);
        if (fs.existsSync(webFilePath)) {
          fs.unlinkSync(webFilePath);
        }
        break;
      }
    }
  }

  const extensions = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

  // Build list of base name variations to try for image/thumbnail cleanup
  const baseVariations = new Set<string>();
  baseVariations.add(title.toLowerCase().replace(/\s+/g, "-"));
  baseVariations.add(normalizeProjectFilename(title));
  // Also find original filename base via metadata reverse lookup
  if (fs.existsSync(projectsDir)) {
    const metadata = getProjectsMetadata();
    for (const [key, meta] of Object.entries(metadata)) {
      if ((meta as { title?: string }).title === title) {
        baseVariations.add(key.toLowerCase().replace(/\s+/g, "-"));
        baseVariations.add(normalizeProjectFilename(key));
      }
    }
  }

  // Also try to delete associated image(s)
  if (fs.existsSync(projectsJpgDir)) {
    for (const base of baseVariations) {
      // Delete single legacy image
      for (const ext of extensions) {
        const imagePath = path.join(projectsJpgDir, `${base}${ext}`);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      // Delete multi-page images (e.g., project-page-001.jpg)
      try {
        const files = fs.readdirSync(projectsJpgDir);
        const escapedBase = base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const pagePattern = new RegExp(
          `^${escapedBase}-page-\\d{3}\\.(webp|avif|jpg|png)$`
        );
        for (const file of files) {
          if (pagePattern.test(file)) {
            fs.unlinkSync(path.join(projectsJpgDir, file));
          }
        }
      } catch {}

      // Delete status file
      const statusFile = path.join(projectsJpgDir, `${base}.status.json`);
      if (fs.existsSync(statusFile)) {
        try {
          fs.unlinkSync(statusFile);
        } catch {}
      }
    }
  }

  // Also try to delete associated thumbnail
  if (fs.existsSync(thumbnailsDir)) {
    for (const base of baseVariations) {
      for (const ext of extensions) {
        const thumbPath = path.join(thumbnailsDir, `${base}${ext}`);
        if (fs.existsSync(thumbPath)) {
          try {
            fs.unlinkSync(thumbPath);
          } catch {}
        }
      }
    }
  }
}
