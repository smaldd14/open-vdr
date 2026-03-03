import { Card, CardContent } from '@/react-app/components/ui/card'
import { Button } from '@/react-app/components/ui/button'
import { usePendingInvites, useAcceptInvite } from '@/react-app/hooks/useInvitations'

export function PendingInviteBanner() {
  const { data: invites } = usePendingInvites()
  const acceptInvite = useAcceptInvite()

  if (!invites || invites.length === 0) return null

  return (
    <div className="mb-8 grid gap-3">
      {invites.map((invite) => (
        <Card key={invite.id}>
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium">
                You've been invited to{' '}
                <span className="font-semibold">{invite.data_rooms?.name ?? 'a data room'}</span>
              </p>
              <p className="text-sm text-muted-foreground capitalize">
                Role: {invite.role}
              </p>
            </div>
            <Button
              size="sm"
              disabled={acceptInvite.isPending}
              onClick={() => acceptInvite.mutate(invite.token)}
            >
              Accept
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
