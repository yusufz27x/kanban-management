import { TaskNotFound } from "@/components/task-route-state";

export default function SharedTasksNotFound() {
  return (
    <TaskNotFound
      actionLabel="Log in"
      href="/login"
      message="Invalid or disabled."
      title="Link unavailable"
    />
  );
}
