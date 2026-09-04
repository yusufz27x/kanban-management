create function private.can_receive_shared_task_broadcast(topic text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.task_shares as shares
    where shares.enabled
      and topic = ('task-share:' || shares.token::text)
  );
$$;

comment on function private.can_receive_shared_task_broadcast(text) is
  'Checks whether a Realtime topic contains a currently enabled task share token.';

revoke execute on function private.can_receive_shared_task_broadcast(text) from public;
grant usage on schema private to authenticated;
grant execute on function private.can_receive_shared_task_broadcast(text)
  to anon, authenticated;

create policy "Visitors can receive enabled shared task broadcasts"
on realtime.messages
for select
to anon, authenticated
using (
  realtime.messages.extension = 'broadcast'
  and (
    select private.can_receive_shared_task_broadcast(
      (select realtime.topic())
    )
  )
);

create or replace function private.broadcast_task_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_id uuid := coalesce(new.user_id, old.user_id);
  share_token uuid;
begin
  perform realtime.broadcast_changes(
    'tasks:' || owner_id::text,
    tg_op,
    tg_op,
    tg_table_name,
    tg_table_schema,
    new,
    old
  );

  select shares.token
  into share_token
  from public.task_shares as shares
  where shares.user_id = owner_id
    and shares.enabled;

  if share_token is not null then
    perform realtime.send(
      jsonb_build_object('operation', tg_op),
      'changed',
      'task-share:' || share_token::text,
      true
    );
  end if;

  return null;
end;
$$;

comment on function private.broadcast_task_changes() is
  'Broadcasts private task changes to the owner and enabled read-only share.';

create function private.broadcast_task_share_revocation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    if old.enabled then
      perform realtime.send(
        jsonb_build_object('reason', 'revoked'),
        'changed',
        'task-share:' || old.token::text,
        true
      );
    end if;

    return null;
  end if;

  if old.enabled
    and (not new.enabled or old.token is distinct from new.token)
  then
    perform realtime.send(
      jsonb_build_object('reason', 'revoked'),
      'changed',
      'task-share:' || old.token::text,
      true
    );
  end if;

  return null;
end;
$$;

comment on function private.broadcast_task_share_revocation() is
  'Refreshes open shared pages when their share is disabled or replaced.';

revoke execute on function private.broadcast_task_share_revocation() from public;

create trigger task_shares_broadcast_revocation
after update or delete on public.task_shares
for each row
execute function private.broadcast_task_share_revocation();
