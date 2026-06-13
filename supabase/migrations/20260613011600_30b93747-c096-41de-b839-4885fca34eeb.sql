
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_room_member(uuid, uuid) FROM PUBLIC, anon;
-- is_room_member is used inside RLS policies on chat_rooms/room_members/messages,
-- which run as the querying role, so authenticated still needs EXECUTE.
GRANT EXECUTE ON FUNCTION public.is_room_member(uuid, uuid) TO authenticated;
