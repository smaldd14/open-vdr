import { Hono } from 'hono'
import { requireAuth } from '../middleware/auth'
import { createServiceRoleClient } from '../lib/supabase'
import {
  fetchInvitationByToken,
  fetchInvitationsForEmail,
  markInvitationAccepted,
  insertRoomMember,
} from '../db/invitations'
import { insertAuditLog } from '../db/audit-logs'

const invite = new Hono<{ Bindings: Env }>()

// GET /?token=... -- look up invitation details (no auth required)
invite.get('/', async (c) => {
  const token = c.req.query('token')
  if (!token) {
    return c.json({ success: false, error: 'Token is required' }, 400)
  }

  const supabase = createServiceRoleClient(c.env)
  const invitation = await fetchInvitationByToken(supabase, token)

  if (!invitation) {
    return c.json({ success: false, error: 'Invalid invitation token' }, 404)
  }

  if (invitation.status !== 'pending') {
    return c.json({ success: false, error: 'This invitation has already been accepted' }, 410)
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return c.json({ success: false, error: 'This invitation has expired' }, 410)
  }

  // Fetch room name
  const { data: room } = await supabase
    .from('data_rooms')
    .select('name')
    .eq('id', invitation.room_id)
    .single()

  return c.json({
    success: true,
    data: {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      room_id: invitation.room_id,
      room_name: room?.name ?? 'Data Room',
      expires_at: invitation.expires_at,
    },
  })
})

// POST /accept -- accept invitation (requires auth)
invite.post('/accept', requireAuth, async (c) => {
  const user = c.get('user')
  const body = await c.req.json<{ token?: string }>()

  if (!body.token) {
    return c.json({ success: false, error: 'Token is required' }, 400)
  }

  const supabase = createServiceRoleClient(c.env)
  const invitation = await fetchInvitationByToken(supabase, body.token)

  if (!invitation) {
    return c.json({ success: false, error: 'Invalid invitation token' }, 404)
  }

  if (invitation.status !== 'pending') {
    return c.json({ success: false, error: 'This invitation has already been accepted' }, 410)
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return c.json({ success: false, error: 'This invitation has expired' }, 410)
  }

  // Verify email matches
  if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
    return c.json({
      success: false,
      error: `This invitation was sent to ${invitation.email}. Please sign in with that email address.`,
    }, 403)
  }

  // Insert room member and mark accepted
  await insertRoomMember(supabase, {
    room_id: invitation.room_id,
    user_id: user.id,
    role: invitation.role,
  })

  await markInvitationAccepted(supabase, invitation.id)

  await insertAuditLog(supabase, {
    room_id: invitation.room_id,
    user_id: user.id,
    action: 'invitation_accepted',
    target_id: invitation.id,
    target_name: user.email,
    ip_address: c.req.header('cf-connecting-ip') ?? null,
    user_agent: c.req.header('user-agent') ?? null,
  })

  return c.json({ success: true, data: { room_id: invitation.room_id } })
})

// GET /pending -- pending invitations for current user
invite.get('/pending', requireAuth, async (c) => {
  const user = c.get('user')
  const supabase = createServiceRoleClient(c.env)
  const data = await fetchInvitationsForEmail(supabase, user.email)
  return c.json({ success: true, data })
})

export { invite }
