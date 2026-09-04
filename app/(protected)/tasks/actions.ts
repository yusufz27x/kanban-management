"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  createTaskSchema,
  deleteTaskSchema,
  type TaskActionState,
  updateTaskSchema,
} from "@/lib/validation/task";

async function getAuthenticatedContext() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/login");
  }

  return { supabase, userId: data.claims.sub };
}

export async function createTask(
  _previousState: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const { supabase } = await getAuthenticatedContext();
  const validated = createTaskSchema.safeParse({
    description: formData.get("description"),
    dueDate: formData.get("dueDate"),
    priority: formData.get("priority"),
    title: formData.get("title"),
  });

  if (!validated.success) {
    return {
      fieldErrors: validated.error.flatten().fieldErrors,
      message: "Check the highlighted fields and try again.",
      status: "error",
    };
  }

  const { error } = await supabase.from("tasks").insert({
    description: validated.data.description,
    due_date: validated.data.dueDate,
    priority: validated.data.priority,
    title: validated.data.title,
  });

  if (error) {
    console.error("Task creation failed", { code: error.code });
    return {
      message: "Task could not be created. Please try again.",
      status: "error",
    };
  }

  revalidatePath("/tasks");
  return { message: "Task created.", status: "success" };
}

export async function updateTask(
  _previousState: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const { supabase, userId } = await getAuthenticatedContext();
  const validated = updateTaskSchema.safeParse({
    description: formData.get("description"),
    dueDate: formData.get("dueDate"),
    priority: formData.get("priority"),
    status: formData.get("status"),
    taskId: formData.get("taskId"),
    title: formData.get("title"),
  });

  if (!validated.success) {
    return {
      fieldErrors: validated.error.flatten().fieldErrors,
      message: "Check the highlighted fields and try again.",
      status: "error",
    };
  }

  const { data, error } = await supabase
    .from("tasks")
    .update({
      description: validated.data.description,
      due_date: validated.data.dueDate,
      priority: validated.data.priority,
      status: validated.data.status,
      title: validated.data.title,
    })
    .eq("id", validated.data.taskId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error("Task update failed", { code: error.code });
    }

    return {
      message: "Task could not be updated. Please try again.",
      status: "error",
    };
  }

  revalidatePath("/tasks");
  return { message: "Task updated.", status: "success" };
}

export async function deleteTask(
  _previousState: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const { supabase, userId } = await getAuthenticatedContext();
  const validated = deleteTaskSchema.safeParse({
    taskId: formData.get("taskId"),
  });

  if (!validated.success) {
    return {
      message: validated.error.issues[0]?.message ?? "Invalid task.",
      status: "error",
    };
  }

  const { data, error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", validated.data.taskId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error("Task deletion failed", { code: error.code });
    }

    return {
      message: "Task could not be deleted. It may no longer exist.",
      status: "error",
    };
  }

  revalidatePath("/tasks");
  return { status: "success" };
}
