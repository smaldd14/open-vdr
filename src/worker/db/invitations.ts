import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Tables, TablesInsert } from '@/types/supabase'

type Invitation = Tables<'invitations'>

export async function fetchInvitationByToken(
  supabase: SupabaseClient<Database>,
  token: string
): Promise<Invitation | null> {
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('token', token)
    .single()
  if (error) return null
  return data
}

export async function fetchRoomInvitations(
  supabase: SupabaseClient<Database>,
  roomId: string
): Promise<Invitation[]> {
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('room_id', roomId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function fetchInvitationsForEmail(
  supabase: SupabaseClient<Database>,
  email: string
) {
  const { data, error } = await supabase
    .from('invitations')
    .select('*, data_rooms(name)')
    .eq('email', email.toLowerCase())
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function insertInvitation(
  supabase: SupabaseClient<Database>,
  invitation: TablesInsert<'invitations'>
): Promise<Invitation> {
  const { data, error } = await supabase
    .from('invitations')
    .insert(invitation)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function markInvitationAccepted(
  supabase: SupabaseClient<Database>,
  invitationId: string
) {
  const { error } = await supabase
    .from('invitations')
    .update({ status: 'accepted' })
    .eq('id', invitationId)
  if (error) throw error
}

export async function removeInvitation(
  supabase: SupabaseClient<Database>,
  invitationId: string
) {
  const { error } = await supabase
    .from('invitations')
    .delete()
    .eq('id', invitationId)
  if (error) throw error
}

export async function insertRoomMember(
  supabase: SupabaseClient<Database>,
  member: TablesInsert<'data_room_members'>
) {
  const { error } = await supabase
    .from('data_room_members')
    .insert(member)
  if (error) throw error
}
