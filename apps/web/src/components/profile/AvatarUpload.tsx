import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { Camera, Loader2 } from "lucide-react";
import { uploadFile } from "../../lib/api";
import { Button } from "../ui/Button";

const ACCEPTED = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024;

export function AvatarUpload({
  name,
  imageUrl,
  onUploaded,
  rounded = "rounded-full",
}: {
  name: string;
  imageUrl?: string | null;
  onUploaded: () => Promise<void> | void;
  rounded?: string;
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
      <div
        className={`relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden ${rounded} bg-accent/10 text-xl font-bold text-accent ring-2 ring-border transition-all`}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          (name ?? "?").charAt(0).toUpperCase()
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/80">
            <Loader2 className="h-5 w-5 animate-spin text-accent" />
          </div>
        )}
      </div>
      <div>
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
        <Button
          type="button"
          variant="secondary"
          size="sm"
          loading={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Camera className="h-4 w-4" />
          {imageUrl ? "Change picture" : "Upload picture"}
        </Button>
        <p className="mt-1.5 text-xs text-ink-faint">
          PNG, JPEG, WebP or GIF · max 5MB
        </p>
      </div>
    </div>
  );
}
