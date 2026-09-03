create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  description text,
  priority text not null default 'medium',
  status text not null default 'todo',
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint tasks_title_length
    check (char_length(btrim(title)) between 1 and 120),
  constraint tasks_description_length
    check (description is null or char_length(description) <= 2000),
  constraint tasks_priority_values
    check (priority in ('low', 'medium', 'high')),
  constraint tasks_status_values
    check (status in ('todo', 'in_progress', 'done'))
);

comment on table public.tasks is 'Personal tasks owned by individual authenticated users.';
comment on column public.tasks.due_date is 'A calendar date without timezone semantics.';

create index tasks_user_created_at_idx
  on public.tasks (user_id, created_at desc);

create index tasks_user_status_idx
  on public.tasks (user_id, status);

create index tasks_user_priority_idx
  on public.tasks (user_id, priority);

create index tasks_user_due_date_idx
  on public.tasks (user_id, due_date)
  where due_date is not null and status <> 'done';

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tasks_set_updated_at
before update on public.tasks
for each row
execute function public.set_updated_at();

revoke execute on function public.set_updated_at() from public;

alter table public.tasks enable row level security;

revoke all on table public.tasks from anon, authenticated;

grant select, delete on table public.tasks to authenticated;
grant insert (title, description, priority, due_date)
  on table public.tasks to authenticated;
grant update (title, description, priority, status, due_date)
  on table public.tasks to authenticated;

create policy "Users can read their own tasks"
on public.tasks
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own tasks"
on public.tasks
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own tasks"
on public.tasks
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own tasks"
on public.tasks
for delete
to authenticated
using ((select auth.uid()) = user_id);
