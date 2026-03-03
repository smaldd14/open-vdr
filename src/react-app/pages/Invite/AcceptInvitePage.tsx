import { useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/react-app/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/react-app/components/ui/card'
import { useSession } from '@/react-app/hooks/useUserProfile'
import { useInviteDetails, useAcceptInvite } from '@/react-app/hooks/useInvitations'

export function AcceptInvitePage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const { data: session, isLoading: sessionLoading } = useSession()
  const { data: invite, isLoading: inviteLoading, error: inviteError } = useInviteDetails(token)
  const acceptInvite = useAcceptInvite()
  const acceptedRef = useRef(false)

  // Auto-accept when signed in
  useEffect(() => {
    if (!session || !invite || !token || acceptedRef.current || acceptInvite.isPending) return
    acceptedRef.current = true
    acceptInvite.mutate(token)
  }, [session, invite, token]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!token) {
    return (
      <CenteredCard title="Invalid Link" description="No invitation token provided." />
    )
  }

  if (inviteLoading || sessionLoading) {
    return (
      <CenteredCard title="Loading..." description="Checking invitation details." />
    )
  }

  if (inviteError) {
    return (
      <CenteredCard
        title="Invalid Invitation"
        description={inviteError.message}
      />
    )
  }

  if (!invite) return null

  // Accept error state
  if (acceptInvite.isError) {
    return (
      <CenteredCard
        title="Could not accept invitation"
        description={acceptInvite.error.message}
      />
    )
  }

  // Accepting in progress
  if (session && (acceptInvite.isPending || acceptInvite.isSuccess)) {
    return (
      <CenteredCard title="Accepting invitation..." description="You'll be redirected shortly." />
    )
  }

  // Not logged in -- show invite details and sign-in link
  const redirectPath = `/invite?token=${token}`
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>You're invited to {invite.room_name}</CardTitle>
          <CardDescription>
            You've been invited as a <span className="font-medium capitalize">{invite.role}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link to={`/auth?redirect=${encodeURIComponent(redirectPath)}`}>
              Sign in to accept
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function CenteredCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
