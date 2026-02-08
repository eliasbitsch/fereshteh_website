import fs from "node:fs";
import path from "node:path";
import { withBasePath } from "./get-base-path";

export interface PortfolioItem {
  title: string;
  pdfPath: string;
  thumbnailPath: string;
  imagePath: string;
}

function getPortfolioOrder(): string[] {
  const orderFile = path.join(
    process.cwd(),
    "src/content/data/portfolio-order.json"
  );
  try {
    if (fs.existsSync(orderFile)) {
      const data = fs.readFileSync(orderFile, "utf-8");
      const parsed = JSON.parse(data);
      return parsed.order || [];
    }
  } catch (error) {
    console.error("Failed to read portfolio order:", error);
  }
  return [];
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
    let thumbnailPath = withBasePath("/thumbnails/placeholder.png"); // Default fallback

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
            thumbnailPath = withBasePath(`/thumbnails/${thumbnailFile}`);
            break outer;
          }
        }
      }
    }

    // Try to find full-size WebP image
    const portfolioImagesDir = path.join(
      process.cwd(),
      "public",
      "portfolio-images"
    );
    let imagePath = thumbnailPath; // Fallback to thumbnail

    if (fs.existsSync(portfolioImagesDir)) {
      const lowercaseBase = baseName.toLowerCase();
      const webpFile = `${lowercaseBase}.webp`;
      const webpFullPath = path.join(portfolioImagesDir, webpFile);

      if (fs.existsSync(webpFullPath)) {
        imagePath = withBasePath(`/portfolio-images/${webpFile}`);
      }
    }

    return {
      title,
      pdfPath: withBasePath(`/portfolio/${pdfFile}`),
      thumbnailPath,
      imagePath,
    };
  });

  // Apply custom order if available
  const customOrder = getPortfolioOrder();

  if (customOrder.length > 0) {
    const itemMap = new Map(items.map((item) => [item.title, item]));
    const orderedItems: PortfolioItem[] = [];

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
