import { BuildspaceError } from "@buildspacestudio/sdk";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { getServerClient } from "@/lib/buildspace";
import { AvatarUpload } from "./avatar-upload";
import { ProfileForm } from "./profile-form";

function initials(name: string | null, email: string): string {
  const source = name?.trim() || email;
  return source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

// Server-signed download pattern: avatarUrl stores the storage *key*; a signed
// URL is minted server-side on read, so links never go stale in the DB.
async function getAvatarSignedUrl(key: string | null): Promise<string | null> {
  if (!key) return null;
  try {
    const bs = getServerClient();
    const { url } = await bs.storage.getSignedUrl(key, { expiresIn: 3600 });
    return url;
  } catch (err) {
    if (err instanceof BuildspaceError) return null;
    throw err;
  }
}

export default async function SettingsPage() {
  const current = await getCurrentUser();
  if (!current) redirect("/");

  const { session, record } = current;
  const avatarSignedUrl = await getAvatarSignedUrl(record?.avatarUrl ?? null);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" description="Your profile, stored in this app's own database." />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Avatar</CardTitle>
        </CardHeader>
        <CardContent>
          <AvatarUpload
            userId={session.user.id}
            initials={initials(record?.name ?? session.user.name, session.user.email)}
            avatarUrl={avatarSignedUrl}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            email={session.user.email}
            initialName={record?.name ?? session.user.name ?? ""}
            initialMarketingOptIn={record?.marketingOptIn ?? false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
