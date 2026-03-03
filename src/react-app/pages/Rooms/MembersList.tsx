import { useQuery } from '@tanstack/react-query'
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
import { supabase } from '@/react-app/lib/supabase'
import { useRemoveRoomMember } from '@/react-app/hooks/useRooms'

function useRoomMembers(roomId: string) {
  return useQuery({
    queryKey: ['rooms', roomId, 'members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('data_room_members')
        .select('id, user_id, role, created_at, users(email, name)')
        .eq('room_id', roomId)
        .order('created_at')
      if (error) throw error
      return data
    },
  })
}

export function MembersList({ roomId, currentUserId }: { roomId: string; currentUserId: string }) {
  const { data: members, isLoading } = useRoomMembers(roomId)
  const removeMember = useRemoveRoomMember(roomId)

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading members...</p>
  }

  if (!members || members.length === 0) {
    return <p className="text-sm text-muted-foreground">No members.</p>
  }

  const adminCount = members.filter((m) => m.role === 'admin').length

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="w-[60px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <TableRow key={member.id}>
            <TableCell>{member.users?.name ?? '-'}</TableCell>
            <TableCell>{member.users?.email ?? '-'}</TableCell>
            <TableCell className="capitalize">{member.role}</TableCell>
            <TableCell>
              {member.user_id === currentUserId || (member.role === 'admin' && adminCount === 1) ? null : (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={removeMember.isPending}
                  onClick={() => removeMember.mutate(member.user_id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
