import { TaskBoardLoading } from "@/components/task-board-loading";

export default function SharedTasksLoading() {
  return (
    <TaskBoardLoading
      label="Loading shared tasks"
      screenReaderText="Loading shared tasks…"
    />
  );
}
