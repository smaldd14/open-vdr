import { Hono } from 'hono'
import { requireAuth, requireRoomAdmin } from '../middleware/auth'
import { createServiceRoleClient } from '../lib/supabase'
import { removeRoomMember } from '../db/members'
import { insertAuditLog } from '../db/audit-logs'

const members = new Hono<{ Bindings: Env }>()

members.delete('/:userId', requireAuth, requireRoomAdmin, async (c) => {
  const user = c.get('user')
  const roomId = c.get('roomId')
  const targetUserId = c.req.param('userId')
  const supabase = createServiceRoleClient(c.env)

  if (targetUserId === user.id) {
    return c.json({ success: false, error: 'Cannot remove yourself' }, 400)
  }

  const { data: targetMember } = await supabase
    .from('data_room_members')
    .select('role, users(email)')
    .eq('room_id', roomId)
    .eq('user_id', targetUserId)
    .single()

  if (!targetMember) {
    return c.json({ success: false, error: 'Member not found' }, 404)
  }

  if (targetMember.role === 'admin') {
    const { count } = await supabase
      .from('data_room_members')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', roomId)
      .eq('role', 'admin')
    if (count === 1) {
      return c.json({ success: false, error: 'Cannot remove the last admin' }, 400)
    }
  }

  await removeRoomMember(supabase, roomId, targetUserId)

  const targetEmail = (targetMember.users as { email: string } | null)?.email ?? targetUserId

  await insertAuditLog(supabase, {
    room_id: roomId,
    user_id: user.id,
    action: 'member_removed',
    target_id: targetUserId,
    target_name: targetEmail,
    ip_address: c.req.header('cf-connecting-ip') ?? null,
    user_agent: c.req.header('user-agent') ?? null,
  })

  return c.json({ success: true })
})

export { members }
