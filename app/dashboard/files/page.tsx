import { BuildspaceError } from "@buildspacestudio/sdk";
import { CloudOff, FolderOpen } from "lucide-react";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { getSession } from "@/lib/auth";
import { getServerClient } from "@/lib/buildspace";
import { FileRow } from "./file-row";
import { FileUploader } from "./file-uploader";

// Server-side listing scoped to the signed-in user's prefix. Storage being
// unreachable (e.g. dummy keys locally) degrades to an empty state.
async function listFiles(userId: string) {
  try {
    const bs = getServerClient();
    const { objects } = await bs.storage.list(`files/${userId}/`, { limit: 100 });
    return { objects, available: true };
  } catch (err) {
    if (err instanceof BuildspaceError) {
      console.error(`[files] list failed: ${err.code} (${err.status})`);
      return { objects: [], available: false };
    }
    throw err;
  }
}

export default async function FilesPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const { objects, available } = await listFiles(session.user.id);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Files"
        description="Browser-direct uploads, server-signed downloads."
        actions={available ? <FileUploader userId={session.user.id} /> : undefined}
      />
      <Card>
        <CardContent className="pt-6">
          {!available ? (
            <EmptyState
              icon={CloudOff}
              title="Storage isn't reachable"
              description="Check your BuildSpace keys — file storage is available once the app can reach the platform."
            />
          ) : objects.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title="No files yet"
              description="Upload a file to see the storage flow end to end."
            />
          ) : (
            <div className="flex flex-col gap-2">
              {objects.map((object) => (
                <FileRow
                  key={object.key}
                  file={{ key: object.key, size: object.size, createdAt: object.createdAt }}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
