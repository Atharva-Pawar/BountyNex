import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { Camera, Loader2 } from "lucide-react";
import { uploadFile } from "../../lib/api";
import { cn } from "../../lib/utils";
import { Button } from "../ui/Button";

const ACCEPTED = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024;

const SIZES = {
  md: "h-14 w-14 text-xl",
  lg: "h-20 w-20 text-2xl",
};

export function AvatarUpload({
  name,
  imageUrl,
  onUploaded,
  rounded = "rounded-full",
  size = "md",
  compact = false,
}: {
  name: string;
  imageUrl?: string | null;
  onUploaded: () => Promise<void> | void;
  rounded?: string;
  size?: "md" | "lg";
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    if (!ACCEPTED.includes(file.type)) {
      toast.error("Please choose a PNG, JPEG, WebP or GIF image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Image is too large (max 5MB).");
      return;
    }
    setUploading(true);
    try {
      await uploadFile("/api/profile/picture", file);
      toast.success("Profile picture updated");
      await onUploaded();
    } catch (err) {
      toast.error((err as Error).message || "Could not upload your profile picture.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="group relative block shrink-0 transition-transform duration-150 outline-none focus-visible:ring-2 focus-visible:ring-acid-lime/30 disabled:cursor-not-allowed"
        aria-label="Change profile picture"
        title="Change profile picture"
      >
        <span
          className={cn(
            "flex items-center justify-center overflow-hidden bg-surface-2 font-medium text-accent ring-1 ring-border transition-shadow duration-150 group-hover:ring-smoke",
            SIZES[size],
            rounded,
          )}
        >
          {imageUrl ? (
            <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
          ) : (
            (name ?? "?").charAt(0).toUpperCase()
          )}
        </span>
        {uploading ? (
          <span className={cn("absolute inset-0 flex items-center justify-center bg-surface/80", rounded)}>
            <Loader2 className="h-5 w-5 animate-spin text-acid-lime" />
          </span>
        ) : (
          <span
            className={cn(
              "absolute inset-0 flex items-center justify-center gap-1.5 bg-black/55 font-mono text-[11px] text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100",
              rounded,
            )}
          >
            <Camera className="h-3.5 w-3.5" />
            {compact ? "Edit" : "Change"}
          </span>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />

      {!compact && (
        <div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            loading={uploading}
            onClick={() => inputRef.current?.click()}
          >
            <Camera className="h-3.5 w-3.5" />
            {imageUrl ? "Change picture" : "Upload picture"}
          </Button>
          <p className="mt-1.5 text-xs text-ink-faint">
            PNG, JPEG, WebP or GIF · max 5MB
          </p>
        </div>
      )}
    </div>
  );
}