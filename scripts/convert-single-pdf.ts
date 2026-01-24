import { pdf } from "pdf-to-img";
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname } from "node:path";

// Configurable via environment variables for stability vs quality
const PDF_SCALE = Math.max(1, Number(process.env.PDF_SCALE) || 4); // rendering scale (dpi multiplier)
const PDF_QUALITY = Math.min(100, Math.max(1, Number(process.env.PDF_QUALITY) || 95));
const PDF_EFFORT = Math.min(9, Math.max(0, Number(process.env.PDF_EFFORT) || 6));
const PDF_MAX_DIM = Math.max(1000, Number(process.env.PDF_MAX_DIM) || 6000);
const PDF_LOSSLESS = process.env.PDF_LOSSLESS === '1' || process.env.PDF_LOSSLESS === 'true';

async function convertPdfToJpg() {
  const pdfPath = process.argv[2];
  const outputPath = process.argv[3];

  if (!pdfPath || !outputPath) {
    console.error("Usage: bun run convert-single-pdf.ts <pdfPath> <outputPath>");
    process.exit(1);
  }

  try {
    // Ensure output directory exists
    const outputDir = dirname(outputPath);
    if (!existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true });
    }


    // Convert PDF to image (first page) using configured scale
    const document = await pdf(pdfPath, { scale: PDF_SCALE });
    const page = (await document.getPage(1)) as Buffer;

    // Convert with Sharp
    let image = sharp(page, { limitInputPixels: false });

    // Ensure we don't exceed format limits: resize if needed
    const metadata = await image.metadata();
    let resizeOptions: { width?: number; height?: number } = {};
    if (metadata.width && metadata.height) {
      if (metadata.width > PDF_MAX_DIM || metadata.height > PDF_MAX_DIM) {
        if (metadata.width >= metadata.height) {
          resizeOptions.width = PDF_MAX_DIM;
        } else {
          resizeOptions.height = PDF_MAX_DIM;
        }
      }
    }

    if (resizeOptions.width || resizeOptions.height) {
      image = image.resize({ ...resizeOptions, fit: "inside", withoutEnlargement: true });
    }

    // Write high-quality JPEG (no height limit, good for tall documents)
    await image.jpeg({ quality: PDF_QUALITY, mozjpeg: true }).toFile(outputPath);

    console.log(`Successfully converted to ${outputPath}`);
    process.exit(0);
  } catch (error) {
    console.error("Conversion failed:", error);
    process.exit(1);
  }
}

convertPdfToJpg();
