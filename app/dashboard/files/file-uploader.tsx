"use client";

import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getBrowserClient } from "@/lib/buildspace-client";

const MAX_SIZE = 10 * 1024 * 1024;

// Browser-direct upload: bs.storage.upload requests a signed URL and PUTs the
// file straight to storage — the file never passes through your server.
export function FileUploader({ userId }: { userId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const bs = getBrowserClient();
      const { key } = await bs.storage.upload(file, {
        path: `files/${userId}/${file.name}`,
      });
      bs.events.track("file_uploaded", { key, size: file.size });
      toast.success("File uploaded");
      router.refresh();
    } catch {
      toast.error("Upload failed — is storage configured for this app?");
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <Button disabled={uploading} onClick={() => inputRef.current?.click()}>
        <Upload className="h-4 w-4" />
        {uploading ? "Uploading…" : "Upload file"}
      </Button>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          if (file.size > MAX_SIZE) {
            toast.error("File is too large (max 10 MB)");
            return;
          }
          handleFile(file);
          e.target.value = "";
        }}
      />
    </>
  );
}
