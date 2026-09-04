import { TaskBoardLoading } from "@/components/task-board-loading";

export default function SharedTasksLoading() {
  return (
    <TaskBoardLoading
      controlCount={1}
      label="Loading shared tasks"
      screenReaderText="Loading shared tasks…"
    />
  );
}
