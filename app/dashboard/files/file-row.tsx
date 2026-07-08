"use client";

import { Download, FileIcon, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/utils";
import { deleteFile, getFileDownloadUrl } from "./actions";

export function FileRow({ file }: { file: { key: string; size: number; createdAt: string } }) {
  const { execute: download, isPending: downloading } = useAction(getFileDownloadUrl, {
    onSuccess: ({ data }) => {
      if (data?.url) window.open(data.url, "_blank", "noopener");
    },
    onError: ({ error }) => toast.error(error.serverError ?? "Failed to get download link"),
  });
  const { execute: remove, isPending: removing } = useAction(deleteFile, {
    onSuccess: () => toast.success("File deleted"),
    onError: ({ error }) => toast.error(error.serverError ?? "Failed to delete file"),
  });

  const name = file.key.split("/").pop() ?? file.key;

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
      <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">
          {formatBytes(file.size)} · {new Date(file.createdAt).toLocaleDateString()}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        disabled={downloading}
        onClick={() => download({ key: file.key })}
      >
        <Download className="h-3.5 w-3.5" />
        <span className="sr-only">Download</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-destructive"
        disabled={removing}
        onClick={() => remove({ key: file.key })}
      >
        <Trash2 className="h-3.5 w-3.5" />
        <span className="sr-only">Delete</span>
      </Button>
    </div>
  );
}
