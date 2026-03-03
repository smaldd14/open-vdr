import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export async function removeRoomMember(
  supabase: SupabaseClient<Database>,
  roomId: string,
  userId: string
) {
  const { error } = await supabase
    .from('data_room_members')
    .delete()
    .eq('room_id', roomId)
    .eq('user_id', userId)
  if (error) throw error
}
