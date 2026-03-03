import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import type { TablesInsert } from '@/types/supabase'

export async function insertAuditLog(
  supabase: SupabaseClient<Database>,
  entry: TablesInsert<'audit_logs'>
) {
  const { error } = await supabase
    .from('audit_logs')
    .insert(entry)
  if (error) throw error
}
