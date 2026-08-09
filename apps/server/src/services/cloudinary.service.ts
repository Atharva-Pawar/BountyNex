import { cloudinary, isCloudinaryConfigured } from "../config/cloudinary.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/http.js";

export interface UploadedEvidence {
  cloudinaryPublicId: string;
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  kind: string;
}

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

const KIND_BY_MIME: Record<string, string> = {
  "image/png": "IMAGE",
  "image/jpeg": "IMAGE",
  "image/webp": "IMAGE",
  "image/gif": "IMAGE",
  "image/svg+xml": "IMAGE",
  "video/mp4": "VIDEO",
  "video/webm": "VIDEO",
  "text/plain": "LOG",
  "application/json": "LOG",
  "application/pdf": "DOCUMENT",
  "application/zip": "POC",
  "application/x-tar": "POC",
  "application/gzip": "POC",
  "application/x-gzip": "POC",
};

const ALLOWED_MIME_TYPES = Object.keys(KIND_BY_MIME);

export function detectKind(mimeType: string, fileName: string): string {
  if (KIND_BY_MIME[mimeType]) return KIND_BY_MIME[mimeType]!;
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "png":
    case "jpg":
    case "jpeg":
    case "webp":
      return "SCREENSHOT";
    case "txt":
    case "log":
      return "LOG";
    case "pdf":
      return "DOCUMENT";
    case "zip":
    case "tar":
    case "gz":
      return "POC";
    default:
      return "DOCUMENT";
  }
}

export function validateEvidenceFile(file: Express.Multer.File): void {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw ApiError.badRequest(`Unsupported file type: ${file.mimetype}`, {
      allowed: ALLOWED_MIME_TYPES,
    });
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw ApiError.badRequest("File is too large (max 15MB)");
  }
}

/**
 * Uploads an evidence file to Cloudinary. Cloudinary secrets never leave the server.
 */
export async function uploadEvidence(file: Express.Multer.File): Promise<UploadedEvidence> {
  if (!isCloudinaryConfigured()) {
    throw ApiError.badRequest(
      "Evidence uploads are not configured. Set Cloudinary credentials in the server environment.",
    );
  }

  validateEvidenceFile(file);

  const mimeType = file.mimetype;
  const kind = detectKind(mimeType, file.originalname);
  const isVideo = kind === "VIDEO";
  const isRaw = kind === "LOG" || kind === "POC" || kind === "DOCUMENT";

  const resourceType = isVideo ? "video" : isRaw ? "raw" : "image";

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: env.CLOUDINARY_UPLOAD_FOLDER,
        resource_type: resourceType,
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error || !result) {
          reject(ApiError.badRequest(`Cloudinary upload failed: ${error?.message ?? "unknown"}`));
          return;
        }
        resolve({
          cloudinaryPublicId: result.public_id,
          url: result.secure_url,
          fileName: file.originalname,
          mimeType,
          sizeBytes: file.size,
          kind,
        });
      },
    );
    uploadStream.end(file.buffer);
  });
}

export async function deleteEvidence(cloudinaryPublicId: string, resourceType: string): Promise<void> {
  if (!isCloudinaryConfigured()) return;
  try {
    await cloudinary.uploader.destroy(cloudinaryPublicId, { resource_type: resourceType });
  } catch (err) {
    console.error("Failed to delete Cloudinary asset", err);
  }
}
