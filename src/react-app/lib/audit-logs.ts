import type { Tables } from '@/types/supabase'
import { supabase } from './supabase'

export type AuditLogWithUser = Tables<'audit_logs'> & {
  users: { email: string } | null
}

export async function fetchAuditLogs(roomId: string): Promise<AuditLogWithUser[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*, users(email)')
    .eq('room_id', roomId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as AuditLogWithUser[]
}
