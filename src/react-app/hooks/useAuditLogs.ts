import { useQuery } from '@tanstack/react-query'
import { fetchAuditLogs } from '../lib/audit-logs'

export function useAuditLogs(roomId: string) {
  return useQuery({
    queryKey: ['rooms', roomId, 'audit-logs'],
    queryFn: () => fetchAuditLogs(roomId),
  })
}
