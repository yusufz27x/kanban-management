import { TaskBoardLoading } from "@/components/task-board-loading";

export default function TasksLoading() {
  return (
    <TaskBoardLoading
      label="Loading tasks"
      screenReaderText="Loading your tasks…"
    />
  );
}
