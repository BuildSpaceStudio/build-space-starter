"use client";

import { useUpload } from "@buildspacestudio/sdk/react";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getBrowserClient } from "@/lib/buildspace-client";

const MAX_SIZE = 10 * 1024 * 1024;

// Browser upload via `app/api/upload`: the route checks the session and picks
// the key, then the file goes straight to storage over a signed URL.
export function FileUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { upload, isUploading, progress } = useUpload({ endpoint: "/api/upload" });

  async function handleFile(file: File) {
    try {
      const { key } = await upload(file);
      getBrowserClient().events.track("file_uploaded", { key, size: file.size });
      toast.success("File uploaded");
      router.refresh();
    } catch {
      toast.error("Upload failed — is storage configured for this app?");
    }
  }

  return (
    <>
      <Button disabled={isUploading} onClick={() => inputRef.current?.click()}>
        <Upload className="h-4 w-4" />
        {isUploading ? `Uploading${progress === null ? "…" : ` ${progress}%`}` : "Upload file"}
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
