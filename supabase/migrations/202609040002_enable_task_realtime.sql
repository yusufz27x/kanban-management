create policy "Users can receive their own task broadcasts"
on realtime.messages
for select
to authenticated
using (
  (select auth.uid()) is not null
  and realtime.messages.extension = 'broadcast'
  and (select realtime.topic()) = ('tasks:' || (select auth.uid())::text)
);

create function private.broadcast_task_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform realtime.broadcast_changes(
    'tasks:' || coalesce(new.user_id, old.user_id)::text,
    tg_op,
    tg_op,
    tg_table_name,
    tg_table_schema,
    new,
    old
  );

  return null;
end;
$$;

comment on function private.broadcast_task_changes() is
  'Broadcasts task changes to a private channel owned by the task user.';

revoke execute on function private.broadcast_task_changes() from public;

create trigger tasks_broadcast_changes
after insert or update or delete on public.tasks
for each row
execute function private.broadcast_task_changes();
