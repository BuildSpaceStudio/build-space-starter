"use client";

import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { setUserRole } from "./actions";

export function RoleSelect({
  userId,
  role,
  disabled,
}: {
  userId: string;
  role: "member" | "super_admin";
  disabled?: boolean;
}) {
  const { execute, isPending } = useAction(setUserRole, {
    onSuccess: () => toast.success("Role updated"),
    onError: ({ error }) => toast.error(error.serverError ?? "Failed to update role"),
  });

  return (
    <Select
      value={role}
      disabled={disabled || isPending}
      onValueChange={(value) => execute({ userId, role: value as "member" | "super_admin" })}
    >
      <SelectTrigger className="h-8 w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="member">Member</SelectItem>
        <SelectItem value="super_admin">Super admin</SelectItem>
      </SelectContent>
    </Select>
  );
}
