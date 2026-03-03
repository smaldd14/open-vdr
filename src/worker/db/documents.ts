import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import type { TablesInsert, Tables } from '@/types/supabase'

type Document = Tables<'documents'>

export async function insertDocument(
  supabase: SupabaseClient<Database>,
  doc: TablesInsert<'documents'>
): Promise<Document> {
  const { data, error } = await supabase
    .from('documents')
    .insert(doc)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function fetchDocument(
  supabase: SupabaseClient<Database>,
  documentId: string
): Promise<Document | null> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single()
  if (error) return null
  return data
}

export async function removeDocument(
  supabase: SupabaseClient<Database>,
  documentId: string
) {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId)
  if (error) throw error
}
