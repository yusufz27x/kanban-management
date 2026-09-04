create table public.task_shares (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  token uuid not null default gen_random_uuid() unique,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.task_shares is
  'One revocable public task-list share token per authenticated user.';

create trigger task_shares_set_updated_at
before update on public.task_shares
for each row
execute function public.set_updated_at();

create schema if not exists private;
revoke all on schema private from public;

create function private.current_task_share_owner_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  with request_token as (
    select coalesce(
      nullif(current_setting('request.headers', true), '')::jsonb
        ->> 'x-task-share-token',
      ''
    ) as value
  )
  select shares.user_id
  from public.task_shares as shares
  cross join request_token
  where shares.enabled
    and shares.token = case
      when request_token.value ~* '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
        then request_token.value::uuid
      else null::uuid
    end
  limit 1;
$$;

comment on function private.current_task_share_owner_id() is
  'Resolves the active share owner from the current PostgREST request header.';

revoke execute on function private.current_task_share_owner_id() from public;
grant usage on schema private to anon;
grant execute on function private.current_task_share_owner_id() to anon;

create function public.regenerate_task_share()
returns table (token uuid, enabled boolean)
language sql
security definer
set search_path = ''
as $$
  insert into public.task_shares (user_id, enabled)
  select (select auth.uid()), true
  where (select auth.uid()) is not null
  on conflict (user_id) do update
    set token = gen_random_uuid(),
        enabled = true
  returning task_shares.token, task_shares.enabled;
$$;

comment on function public.regenerate_task_share() is
  'Generates a fresh high-entropy share token for the authenticated user.';

revoke execute on function public.regenerate_task_share() from public;
grant execute on function public.regenerate_task_share() to authenticated;

alter table public.task_shares enable row level security;

revoke all on table public.task_shares from anon, authenticated;

grant select, delete on table public.task_shares to authenticated;
grant insert (enabled) on table public.task_shares to authenticated;
grant update (enabled) on table public.task_shares to authenticated;
grant select (enabled) on table public.task_shares to anon;

create policy "Users can read their own share settings"
on public.task_shares
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own share settings"
on public.task_shares
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own share settings"
on public.task_shares
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own share settings"
on public.task_shares
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "Public can validate the supplied share token"
on public.task_shares
for select
to anon
using (user_id = (select private.current_task_share_owner_id()));

grant select (id, title, description, priority, status, due_date)
  on table public.tasks to anon;

create policy "Public can read tasks for the supplied share token"
on public.tasks
for select
to anon
using (user_id = (select private.current_task_share_owner_id()));
