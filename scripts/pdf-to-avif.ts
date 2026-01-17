import { readdir } from "node:fs/promises";
import path from "node:path";
import { pdf } from "pdf-to-img";
import sharp from "sharp";

const portfolioDir = path.join(process.cwd(), "public", "portfolio");
const outputDir = path.join(process.cwd(), "public", "portfolio-images");

async function convertPDFsToImages() {
  const files = await readdir(portfolioDir);
  const pdfFiles = files.filter((file) => file.toLowerCase().endsWith(".pdf"));

  console.log(`Found ${pdfFiles.length} PDF files to convert`);

  for (const pdfFile of pdfFiles) {
    const pdfPath = path.join(portfolioDir, pdfFile);
    const baseName = path.basename(pdfFile, ".pdf");
    const outputPath = path.join(outputDir, `${baseName.toLowerCase()}.webp`);

    console.log(`Converting ${pdfFile}...`);

    try {
      // Convert PDF to images (will get first page)
      const document = await pdf(pdfPath, { scale: 2.0 }); // 2x resolution for quality

      // Get first page
      const page = (await document.getPage(1)) as Buffer;

      // Convert with Sharp
      const image = sharp(page);
      const metadata = await image.metadata();

      console.log(`  Original dimensions: ${metadata.width}x${metadata.height}`);

      // Resize to reasonable size for web display (WebP has 16383x16383 limit)
      const maxDimension = 12000; // Keep well below the limit
      let resizeOptions: { width?: number; height?: number } = {};

      if (metadata.width && metadata.height) {
        if (metadata.width > metadata.height) {
          resizeOptions.width = Math.min(maxDimension, metadata.width);
        } else {
          resizeOptions.height = Math.min(maxDimension, metadata.height);
        }
      }

      let pipeline = image.resize({
        ...resizeOptions,
        fit: "inside",
        withoutEnlargement: true,
      });

      await pipeline.webp({ quality: 85 }).toFile(outputPath);

      console.log(`✓ Created ${outputPath}`);
    } catch (error) {
      console.error(`✗ Failed to convert ${pdfFile}:`, error);
    }
  }

  console.log("\nDone!");
}

convertPDFsToImages();
