import fs from "node:fs";
import path from "node:path";

export interface PortfolioItem {
  title: string;
  pdfPath: string;
  thumbnailPath: string;
  imagePath: string;
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
    // Use the full base name as title
    const title = baseName;

    // Try to find a matching thumbnail
    let thumbnailPath = "/thumbnails/placeholder.png"; // Default fallback

    if (fs.existsSync(thumbnailsDir)) {
      const thumbnailExtensions = [".png", ".jpg", ".jpeg", ".webp", ".avif"];

      // Try to find thumbnail with lowercase version of the filename
      const lowercaseBase = baseName.toLowerCase();

      const candidates = [baseName, lowercaseBase];

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

    // Try to find full-size WebP image
    const portfolioImagesDir = path.join(process.cwd(), "public", "portfolio-images");
    let imagePath = thumbnailPath; // Fallback to thumbnail

    if (fs.existsSync(portfolioImagesDir)) {
      const lowercaseBase = baseName.toLowerCase();
      const webpFile = `${lowercaseBase}.webp`;
      const webpFullPath = path.join(portfolioImagesDir, webpFile);

      if (fs.existsSync(webpFullPath)) {
        imagePath = `/portfolio-images/${webpFile}`;
      }
    }

    return {
      title,
      pdfPath: `/portfolio/${pdfFile}`,
      thumbnailPath,
      imagePath,
    };
  });

  return items;
}
