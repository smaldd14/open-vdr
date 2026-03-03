import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/react-app/components/ui/button'
import { Skeleton } from '@/react-app/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/react-app/components/ui/table'
import { useAuditLogs } from '@/react-app/hooks/useAuditLogs'
import { useRoomMembership } from '@/react-app/hooks/useRooms'
import { useSession } from '@/react-app/hooks/useUserProfile'
import { formatDateTime } from '@/react-app/lib/date-utils'

export function AuditLogPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const { data: session } = useSession()
  const userId = session?.user?.id ?? ''
  const { data: membership, isLoading: membershipLoading } = useRoomMembership(roomId!, userId)
  const { data: logs = [], isLoading: logsLoading } = useAuditLogs(roomId!)

  const isAdmin = membership?.role === 'admin'
  const isLoading = membershipLoading || logsLoading

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-10">
        <p className="text-muted-foreground">Admin access required.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/rooms/${roomId}`}>
            <ArrowLeft className="size-4" />
            Back to Room
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Audit Log</h1>
      </div>

      {logs.length === 0 ? (
        <p className="text-muted-foreground">No audit log entries yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-sm whitespace-nowrap">
                  {formatDateTime(log.created_at)}
                </TableCell>
                <TableCell className="text-sm">{log.users?.email ?? log.user_id}</TableCell>
                <TableCell className="text-sm font-mono">{log.action}</TableCell>
                <TableCell className="text-sm">{log.target_name ?? '—'}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {log.ip_address ?? '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
