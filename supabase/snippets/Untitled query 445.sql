
create policy "Members can view audit logs"
  on audit_logs for select
  using (is_room_admin(room_id));