"use client";

import { useAction } from "next-safe-action/hooks";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getBrowserClient } from "@/lib/buildspace-client";
import { updateAvatar } from "./actions";

// Browser-direct upload: the file goes straight from the browser to storage via
// bs.storage.upload, then a server action records the key on the users row.
export function AvatarUpload({
  userId,
  initials,
  avatarUrl,
}: {
  userId: string;
  initials: string;
  avatarUrl: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { execute: saveAvatar } = useAction(updateAvatar, {
    onSuccess: () => toast.success("Avatar updated"),
    onError: ({ error }) => toast.error(error.serverError ?? "Failed to save avatar"),
  });

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const bs = getBrowserClient();
      const { key } = await bs.storage.upload(file, { path: `avatars/${userId}` });
      saveAvatar({ key });
    } catch {
      toast.error("Upload failed — is storage configured for this app?");
    } finally {
      setUploading(false);
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
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Uploading…" : "Upload avatar"}
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
