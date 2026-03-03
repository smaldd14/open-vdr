import { Hono } from 'hono'
import { addDays } from 'date-fns'
import { requireAuth, requireRoomAdmin } from '../middleware/auth'
import { createServiceRoleClient } from '../lib/supabase'
import {
  fetchRoomInvitations,
  insertInvitation,
  removeInvitation,
} from '../db/invitations'
import { insertAuditLog } from '../db/audit-logs'
import { getSESConfig, sendEmail, buildInviteEmail } from '../lib/email'

const invitations = new Hono<{ Bindings: Env }>()

// GET / -- list pending invitations for a room
invitations.get('/', requireAuth, requireRoomAdmin, async (c) => {
  const roomId = c.get('roomId')
  const supabase = createServiceRoleClient(c.env)
  const data = await fetchRoomInvitations(supabase, roomId)
  return c.json({ success: true, data })
})

// POST / -- create invitation and send email
invitations.post('/', requireAuth, requireRoomAdmin, async (c) => {
  const user = c.get('user')
  const roomId = c.get('roomId')
  const body = await c.req.json<{ email?: string; role?: string }>()

  const email = body.email?.trim().toLowerCase()
  const role = body.role

  if (!email || !role || (role !== 'admin' && role !== 'viewer')) {
    return c.json({ success: false, error: 'Valid email and role (admin/viewer) are required' }, 400)
  }

  const supabase = createServiceRoleClient(c.env)

  // Check if user is already a room member
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (existingUser) {
    const { data: existingMember } = await supabase
      .from('data_room_members')
      .select('id')
      .eq('room_id', roomId)
      .eq('user_id', existingUser.id)
      .single()

    if (existingMember) {
      return c.json({ success: false, error: 'User is already a member of this room' }, 409)
    }
  }

  // Insert invitation
  let invitation
  try {
    invitation = await insertInvitation(supabase, {
      room_id: roomId,
      email,
      role,
      invited_by: user.id,
      expires_at: addDays(new Date(), 7).toISOString(),
    })
  } catch (err: unknown) {
    const pgError = err as { code?: string }
    if (pgError.code === '23505') {
      return c.json({ success: false, error: 'An invitation has already been sent to this email' }, 409)
    }
    throw err
  }

  // Fetch room name for email
  const { data: room } = await supabase
    .from('data_rooms')
    .select('name')
    .eq('id', roomId)
    .single()

  // Send invite email
  const inviteUrl = `${c.env.APP_URL}/invite?token=${invitation.token}`
  const emailContent = buildInviteEmail({
    inviterEmail: user.email,
    roomName: room?.name ?? 'Data Room',
    role,
    inviteUrl,
  })

  const sesConfig = getSESConfig(c.env)
  await sendEmail(
    { to: email, ...emailContent },
    sesConfig
  )

  await insertAuditLog(supabase, {
    room_id: roomId,
    user_id: user.id,
    action: 'invitation_created',
    target_id: invitation.id,
    target_name: email,
    ip_address: c.req.header('cf-connecting-ip') ?? null,
    user_agent: c.req.header('user-agent') ?? null,
  })

  return c.json({ success: true, data: invitation }, 201)
})

// DELETE /:invitationId -- revoke invitation
invitations.delete('/:invitationId', requireAuth, requireRoomAdmin, async (c) => {
  const user = c.get('user')
  const roomId = c.get('roomId')
  const invitationId = c.req.param('invitationId')

  const supabase = createServiceRoleClient(c.env)
  await removeInvitation(supabase, invitationId)

  await insertAuditLog(supabase, {
    room_id: roomId,
    user_id: user.id,
    action: 'invitation_revoked',
    target_id: invitationId,
    ip_address: c.req.header('cf-connecting-ip') ?? null,
    user_agent: c.req.header('user-agent') ?? null,
  })

  return c.json({ success: true })
})

export { invitations }
