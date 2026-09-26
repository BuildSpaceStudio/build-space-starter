"use client";

import { useUpload } from "@buildspacestudio/sdk/react";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// Uploads through `app/api/upload/avatar`, which picks the key and saves it on
// the users row after the upload is confirmed.
export function AvatarUpload({
  initials,
  avatarUrl,
}: {
  initials: string;
  avatarUrl: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { upload, isUploading } = useUpload({ endpoint: "/api/upload/avatar" });

  async function handleFile(file: File) {
    try {
      await upload(file);
      toast.success("Avatar updated");
      router.refresh();
    } catch {
      toast.error("Upload failed — is storage configured for this app?");
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-16 w-16">
        {avatarUrl && <AvatarImage src={avatarUrl} alt="Avatar" />}
        <AvatarFallback className="text-lg">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? "Uploading…" : "Upload avatar"}
        </Button>
        <p className="text-xs text-muted-foreground">PNG or JPG, up to 2&nbsp;MB.</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          if (file.size > 2 * 1024 * 1024) {
            toast.error("File is too large (max 2 MB)");
            return;
          }
          handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
