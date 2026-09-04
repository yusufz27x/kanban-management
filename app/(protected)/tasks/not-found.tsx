import { TaskNotFound } from "@/components/task-route-state";

export default function TasksNotFound() {
  return (
    <TaskNotFound
      actionLabel="Back to tasks"
      href="/tasks"
      message="The requested task page could not be found."
      title="Tasks unavailable"
    />
  );
}
