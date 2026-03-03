import { Hono } from 'hono'
import { requireAuth, requireRoomAdmin, requireRoomMember } from '../middleware/auth'
import { createServiceRoleClient } from '../lib/supabase'

const branding = new Hono<{ Bindings: Env }>()

// POST /logo -- upload room logo
branding.post('/logo', requireAuth, requireRoomAdmin, async (c) => {
  const roomId = c.get('roomId')

  const formData = await c.req.formData()
  const logo = formData.get('logo') as File | null

  if (!logo || logo.size === 0) {
    return c.json({ success: false, error: 'Logo file is required' }, 400)
  }

  const r2Key = `rooms/${roomId}/branding/logo`

  await c.env.VDR_R2.put(r2Key, logo.stream(), {
    httpMetadata: { contentType: logo.type },
  })

  const supabase = createServiceRoleClient(c.env)
  const { error } = await supabase
    .from('data_rooms')
    .update({ logo_url: r2Key })
    .eq('id', roomId)

  if (error) throw error

  return c.json({ success: true, data: { logo_url: r2Key } })
})

// GET /logo -- proxy-serve logo from R2 (requires room membership)
branding.get('/logo', requireAuth, requireRoomMember, async (c) => {
  const roomId = c.get('roomId')
  const r2Key = `rooms/${roomId}/branding/logo`

  const r2Object = await c.env.VDR_R2.get(r2Key)
  if (!r2Object) {
    return c.json({ success: false, error: 'Logo not found' }, 404)
  }

  return new Response(r2Object.body, {
    headers: {
      'Content-Type': r2Object.httpMetadata?.contentType ?? 'image/png',
      'Cache-Control': 'private, max-age=3600',
    },
  })
})

export { branding }
