import fs from "node:fs";
import path from "node:path";

export interface PortfolioItem {
  title: string;
  pdfPath: string;
  thumbnailPath: string;
}

export function getPortfolioItems(): PortfolioItem[] {
  const portfolioDir = path.join(process.cwd(), "public", "portfolio");
  const thumbnailsDir = path.join(process.cwd(), "public", "thumbnails");

  // Check if directories exist
  if (!fs.existsSync(portfolioDir)) {
    return [];
  }

  // Read all PDF files from Portfolio directory
  const files = fs.readdirSync(portfolioDir);
  const pdfFiles = files.filter((file) => file.toLowerCase().endsWith(".pdf"));

  // Map each PDF to a portfolio item
  const items: PortfolioItem[] = pdfFiles.map((pdfFile) => {
    const baseName = path.basename(pdfFile, ".pdf");
    // Extract title - take everything before the first semicolon
    const title = baseName.split(";")[0].trim();

    // Try to find a matching thumbnail
    let thumbnailPath = "/thumbnails/placeholder.png"; // Default fallback

    if (fs.existsSync(thumbnailsDir)) {
      const thumbnailExtensions = [".png", ".jpg", ".jpeg", ".webp", ".avif"];

      // Try several filename candidates to account for chars like semicolons/spaces
      const titleOnly = baseName.split(";")[0].trim();
      const slug = titleOnly
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const candidates = [baseName, titleOnly, slug];

      outer: for (const candidate of candidates) {
        for (const ext of thumbnailExtensions) {
          const thumbnailFile = `${candidate}${ext}`;
          const thumbnailFullPath = path.join(thumbnailsDir, thumbnailFile);

          if (fs.existsSync(thumbnailFullPath)) {
            thumbnailPath = `/thumbnails/${thumbnailFile}`;
            break outer;
          }
        }
      }
    }

    return {
      title,
      pdfPath: `/portfolio/${pdfFile}`,
      thumbnailPath,
    };
  });

  return items;
}
