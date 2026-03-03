import type { Tables, TablesInsert } from '@/types/supabase'
import { supabase } from './supabase'

export type Folder = Tables<'folders'>
export type CreateFolderInput = Pick<TablesInsert<'folders'>, 'name' | 'parent_id'>

export async function fetchFolders(roomId: string) {
  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .eq('room_id', roomId)
    .order('sort_order')
    .order('name')
  if (error) throw error
  return data
}

export async function createFolder(input: CreateFolderInput, roomId: string, userId: string) {
  const { data, error } = await supabase
    .from('folders')
    .insert({
      name: input.name,
      parent_id: input.parent_id ?? null,
      room_id: roomId,
      created_by: userId,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function renameFolder(folderId: string, name: string) {
  const { data, error } = await supabase
    .from('folders')
    .update({ name })
    .eq('id', folderId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteFolder(folderId: string) {
  const { error } = await supabase
    .from('folders')
    .delete()
    .eq('id', folderId)
  if (error) throw error
}
