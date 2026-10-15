-- Local-only database check: confirm the rate-limit function rejects an
-- over-limit request, then exercise the actual post trigger at its threshold.
-- A savepoint-like exception block rolls the probe rows/events back.
do $$
declare
  v_rejected boolean := false;
  v_post_id uuid;
  v_user_id constant uuid := '00000000-0000-4000-8000-000000000001';
  v_index integer;
begin
  perform set_config('request.jwt.claim.sub', v_user_id::text, true);

  begin
    perform public.register_rate_limit_event('smoke_probe', 0, interval '1 minute');
  exception when check_violation then
    v_rejected := true;
  end;

  if not v_rejected then
    raise exception 'Rate limiter accepted a request when the limit was zero';
  end if;

  v_rejected := false;

  begin
    for v_index in 1..10 loop
      insert into public.posts (user_id, content)
      values (v_user_id, 'Rate limit probe ' || v_index)
      returning id into v_post_id;
    end loop;

    begin
      insert into public.posts (user_id, content)
      values (v_user_id, 'Rate limit probe over limit');
    exception when check_violation then
      v_rejected := true;
    end;

    if not v_rejected then
      raise exception 'Post trigger accepted the eleventh post';
    end if;

    raise exception using errcode = 'ZX001', message = 'roll back rate-limit probe';
  exception when sqlstate 'ZX001' then
    null;
  end;
end;
$$;
