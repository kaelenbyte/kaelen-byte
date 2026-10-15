-- Enable Realtime change delivery only for tables used by the UI.
do $$
declare
  v_table text;
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    raise exception 'Supabase Realtime publication is missing';
  end if;

  foreach v_table in array array['posts', 'likes', 'comments', 'follows', 'notifications'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = v_table
    ) then
      execute format('alter publication supabase_realtime add table public.%I', v_table);
    end if;
  end loop;
end;
$$;
