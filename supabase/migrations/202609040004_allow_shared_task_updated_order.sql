grant select (updated_at) on table public.tasks to anon;

comment on column public.tasks.updated_at is
  'Last task change time, exposed to shared readers for board ordering.';
