import { TaskNotFound } from "@/components/task-route-state";

export default function NotFound() {
  return (
    <TaskNotFound
      actionLabel="Go home"
      href="/"
      message="The requested page could not be found."
      title="Page unavailable"
    />
  );
}
