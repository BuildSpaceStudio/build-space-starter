"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTodo } from "./actions";

export function TodoForm() {
  const [text, setText] = useState("");
  const { execute, isPending } = useAction(createTodo, {
    onSuccess: () => {
      setText("");
      toast.success("Todo added");
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Failed to add todo");
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        execute({ text });
      }}
      className="flex gap-2"
    >
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What needs to be done?"
        disabled={isPending}
      />
      <Button type="submit" disabled={isPending || !text.trim()}>
        Add
      </Button>
    </form>
  );
}
