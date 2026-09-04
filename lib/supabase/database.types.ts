export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in_progress" | "done";

export type Database = {
  public: {
    Tables: {
      task_shares: {
        Row: {
          created_at: string;
          enabled: boolean;
          token: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          enabled?: boolean;
          token?: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          enabled?: boolean;
          token?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          created_at: string;
          description: string | null;
          due_date: string | null;
          id: string;
          priority: TaskPriority;
          status: TaskStatus;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          priority?: TaskPriority;
          status?: TaskStatus;
          title: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          priority?: TaskPriority;
          status?: TaskStatus;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      regenerate_task_share: {
        Args: Record<PropertyKey, never>;
        Returns: {
          enabled: boolean;
          token: string;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type TaskShare = Database["public"]["Tables"]["task_shares"]["Row"];
export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type PublicTask = Pick<
  Task,
  "description" | "due_date" | "id" | "priority" | "status" | "title"
>;
export type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
export type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"];
