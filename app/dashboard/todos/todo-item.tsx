"use client";

import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { TodoRecord } from "@/lib/db/schema";
import { toggleTodo, deleteTodo } from "./actions";

export function TodoItem({ todo }: { todo: TodoRecord }) {
  const { execute: toggle } = useAction(toggleTodo, {
    onError: () => toast.error("Failed to update todo"),
  });
  const { execute: remove } = useAction(deleteTodo, {
    onError: () => toast.error("Failed to delete todo"),
  });

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
      <Checkbox
        checked={todo.completed}
        onCheckedChange={(checked: boolean) => toggle({ id: todo.id, completed: checked })}
      />
      <span
        className={cn("flex-1 text-sm", todo.completed && "line-through text-muted-foreground")}
      >
        {todo.text}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => remove({ id: todo.id })}
        className="h-7 w-7 text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
