import { Trash2 } from 'lucide-react'
import { Button } from '@/react-app/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/react-app/components/ui/table'
import { useRoomInvitations, useRevokeInvitation } from '@/react-app/hooks/useInvitations'
import { formatRelative } from '@/react-app/lib/date-utils'

export function InvitationsTable({ roomId }: { roomId: string }) {
  const { data: invitations, isLoading } = useRoomInvitations(roomId)
  const revokeInvitation = useRevokeInvitation(roomId)

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading invitations...</p>
  }

  if (!invitations || invitations.length === 0) {
    return <p className="text-sm text-muted-foreground">No pending invitations.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Expires</TableHead>
          <TableHead className="w-[60px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {invitations.map((invitation) => (
          <TableRow key={invitation.id}>
            <TableCell>{invitation.email}</TableCell>
            <TableCell className="capitalize">{invitation.role}</TableCell>
            <TableCell>{formatRelative(invitation.expires_at)}</TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="sm"
                disabled={revokeInvitation.isPending}
                onClick={() => revokeInvitation.mutate(invitation.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
