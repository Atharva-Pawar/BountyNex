import { v2 as cloudinary } from "cloudinary";
import { env } from "./env.js";

let configured = false;

export function configureCloudinary(): boolean {
  if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }
  return configured;
}

export function isCloudinaryConfigured(): boolean {
  return configured;
}

export { cloudinary };
