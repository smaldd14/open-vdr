import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { Button } from '@/react-app/components/ui/button'
import { Skeleton } from '@/react-app/components/ui/skeleton'
import { useRoom } from '@/react-app/hooks/useRooms'
import { supabase } from '@/react-app/lib/supabase'
import { BrandingForm } from './BrandingForm'
import { InviteDialog } from './InviteDialog'
import { InvitationsTable } from './InvitationsTable'
import { MembersList } from './MembersList'

export function SettingsPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const { data: room, isLoading } = useRoom(roomId!)
  const { data: authData } = useQuery({
    queryKey: ['auth-user'],
    queryFn: () => supabase.auth.getUser(),
  })
  const currentUserId = authData?.data.user?.id ?? ''
  const [inviteOpen, setInviteOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">{room?.name ?? 'Room'} Settings</h1>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Branding</h2>
        <BrandingForm roomId={roomId!} room={room!} />
      </section>

      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Pending Invitations</h2>
          <Button onClick={() => setInviteOpen(true)}>
            <Plus className="size-4" />
            Invite Member
          </Button>
        </div>
        <InvitationsTable roomId={roomId!} />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Members</h2>
        <MembersList roomId={roomId!} currentUserId={currentUserId} />
      </section>

      <InviteDialog
        roomId={roomId!}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
      />
    </div>
  )
}
