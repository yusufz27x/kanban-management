import { TaskBoardLoading } from "@/components/task-board-loading";

export default function TasksLoading() {
  return (
    <TaskBoardLoading
      controlCount={3}
      label="Loading tasks"
      screenReaderText="Loading your tasks…"
    />
  );
}
