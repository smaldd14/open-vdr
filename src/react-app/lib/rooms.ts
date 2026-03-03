import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'
import { supabase } from './supabase'
import { apiClient } from './api-client'

export type DataRoom = Tables<'data_rooms'>
export type CreateRoomInput = Pick<TablesInsert<'data_rooms'>, 'name' | 'company_name' | 'description'>

export async function fetchRooms() {
  const { data, error } = await supabase
    .from('data_rooms')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function fetchRoom(roomId: string) {
  const { data, error } = await supabase
    .from('data_rooms')
    .select('*')
    .eq('id', roomId)
    .single()
  if (error) throw error
  return data
}

export async function fetchRoomMemberCount(roomId: string) {
  const { count, error } = await supabase
    .from('data_room_members')
    .select('*', { count: 'exact', head: true })
    .eq('room_id', roomId)
  if (error) throw error
  return count ?? 0
}

export async function fetchRoomMembership(roomId: string, userId: string) {
  const { data, error } = await supabase
    .from('data_room_members')
    .select('role')
    .eq('room_id', roomId)
    .eq('user_id', userId)
    .single()
  if (error) throw error
  return data
}

export async function updateRoom(
  roomId: string,
  patch: Pick<TablesUpdate<'data_rooms'>, 'company_name' | 'primary_color'>
) {
  const { error } = await supabase
    .from('data_rooms')
    .update(patch)
    .eq('id', roomId)
  if (error) throw error
}

export async function uploadRoomLogo(roomId: string, file: File) {
  const formData = new FormData()
  formData.append('logo', file)
  const response = await apiClient.uploadFile<{ logo_url: string }>(
    `/rooms/${roomId}/branding/logo`,
    formData
  )
  if (!response.success) {
    throw new Error(response.error ?? 'Logo upload failed')
  }
  return response.data!
}

export async function createRoom(input: CreateRoomInput, userId: string) {
  // Insert without .select() -- the AFTER INSERT trigger creates the admin
  // member row, but it hasn't fired yet when PostgREST evaluates RETURNING,
  // so the SELECT RLS policy (is_room_member) would fail.
  const { error } = await supabase
    .from('data_rooms')
    .insert({ ...input, created_by: userId })
  if (error) throw error

  // Fetch separately -- by now the trigger has fired and we're a member
  const { data, error: fetchError } = await supabase
    .from('data_rooms')
    .select('*')
    .eq('created_by', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  if (fetchError) throw fetchError
  return data
}
