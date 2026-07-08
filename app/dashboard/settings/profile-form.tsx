"use client";

import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateProfile } from "./actions";

export function ProfileForm({
  initialName,
  initialMarketingOptIn,
  email,
}: {
  initialName: string;
  initialMarketingOptIn: boolean;
  email: string;
}) {
  const [name, setName] = useState(initialName);
  const [marketingOptIn, setMarketingOptIn] = useState(initialMarketingOptIn);
  const { execute, isPending } = useAction(updateProfile, {
    onSuccess: () => toast.success("Profile updated"),
    onError: ({ error }) => toast.error(error.serverError ?? "Failed to update profile"),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        execute({ name, marketingOptIn });
      }}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled />
        <p className="text-xs text-muted-foreground">
          Managed by BuildSpace — change it from your BuildSpace account.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Display name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          disabled={isPending}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="flex flex-col gap-1">
          <Label htmlFor="marketing">Product updates</Label>
          <p className="text-xs text-muted-foreground">
            Receive occasional emails about new features.
          </p>
        </div>
        <Switch
          id="marketing"
          checked={marketingOptIn}
          onCheckedChange={setMarketingOptIn}
          disabled={isPending}
        />
      </div>

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
