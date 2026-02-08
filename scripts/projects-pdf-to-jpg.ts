import { existsSync } from "node:fs";
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { pdf } from "pdf-to-img";
import sharp from "sharp";

// Configurable env vars to balance quality and performance
// For very tall PDFs, scale 1-2 is often enough since base resolution is already good
const DEFAULT_SCALE = Math.max(1, Number(process.env.PDF_SCALE) || 2);
// AVIF/HEIF has a ~16383px dimension limit in most encoders, use 16000 to be safe
const DEFAULT_MAX_DIM = Math.max(
  1000,
  Number(process.env.PDF_MAX_DIM) || 16_000
);
const DEFAULT_MIN_WIDTH = Math.max(
  500,
  Number(process.env.PDF_MIN_WIDTH) || 1500
);
const DEFAULT_QUALITY = Math.min(
  100,
  Math.max(1, Number(process.env.PDF_QUALITY) || 95)
);
const _DEFAULT_EFFORT = Math.min(
  9,
  Math.max(0, Number(process.env.PDF_EFFORT) || 6)
);
const _DEFAULT_LOSSLESS =
  process.env.PDF_LOSSLESS === "1" || process.env.PDF_LOSSLESS === "true";

const projectsDir = path.join(process.cwd(), "public", "projects");
const outputDir = path.join(process.cwd(), "public", "projects-jpg");

async function convertPDFsToAVIF() {
  // Ensure output directory exists
  if (!existsSync(outputDir)) {
    await mkdir(outputDir, { recursive: true });
    console.log(`Created output directory: ${outputDir}`);
  }

  // Check if source directory exists
  if (!existsSync(projectsDir)) {
    console.log(
      `Source directory ${projectsDir} does not exist. Nothing to convert.`
    );
    return;
  }

  const files = await readdir(projectsDir);
  const pdfFiles = files.filter((file) => file.toLowerCase().endsWith(".pdf"));

  console.log(`Found ${pdfFiles.length} PDF files to convert`);

  for (const pdfFile of pdfFiles) {
    const pdfPath = path.join(projectsDir, pdfFile);
    const baseName = path.basename(pdfFile, ".pdf");
    // Replace spaces with hyphens for URL-safe filenames
    const safeBaseName = baseName.toLowerCase().replace(/\s+/g, "-");
    const outputPath = path.join(outputDir, `${safeBaseName}.jpg`);

    console.log(`Converting ${pdfFile}...`);

    try {
      // Convert PDF to images (will get first page)
      // Increase scale for higher DPI rendering (configurable via PDF_SCALE)
      const document = await pdf(pdfPath, { scale: DEFAULT_SCALE });

      // Get first page
      const page = (await document.getPage(1)) as Buffer;

      // Convert with Sharp
      const image = sharp(page, { limitInputPixels: false });
      const metadata = await image.metadata();

      console.log(
        `  Rendered dimensions: ${metadata.width}x${metadata.height}`
      );

      // Resize: cap max dimension but ensure minimum width for text sharpness
      const maxDimension = DEFAULT_MAX_DIM;
      const minWidth = DEFAULT_MIN_WIDTH;
      let resizeOptions: { width?: number; height?: number } = {};

      if (metadata.width && metadata.height) {
        const aspectRatio = metadata.width / metadata.height;

        // First, check if we need to limit by max dimension
        if (metadata.width > maxDimension || metadata.height > maxDimension) {
          if (metadata.width > metadata.height) {
            resizeOptions.width = maxDimension;
          } else {
            resizeOptions.height = maxDimension;
          }
        }

        // Calculate what the width would be after max dimension resize
        let resultingWidth = metadata.width;
        if (resizeOptions.height) {
          resultingWidth = Math.round(resizeOptions.height * aspectRatio);
        } else if (resizeOptions.width) {
          resultingWidth = resizeOptions.width;
        }

        // If width would be too small, prioritize minimum width instead
        if (resultingWidth < minWidth) {
          resizeOptions = { width: minWidth };
          console.log(
            `  Enforcing minimum width of ${minWidth}px for text sharpness`
          );
        }
      }

      // High quality JPEG: no height limit, good compression
      const pipeline = image.resize({
        ...resizeOptions,
        fit: "inside",
        withoutEnlargement: true,
      });
      await pipeline
        .jpeg({ quality: DEFAULT_QUALITY, mozjpeg: true })
        .toFile(outputPath);

      console.log(`✓ Created ${outputPath}`);
    } catch (error) {
      console.error(`✗ Failed to convert ${pdfFile}:`, error);
    }
  }

  console.log("\nDone!");
}

convertPDFsToAVIF();
