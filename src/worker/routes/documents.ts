import { Hono } from 'hono'
import { requireAuth, requireRoomMember, requireRoomAdmin } from '../middleware/auth'
import { createServiceRoleClient } from '../lib/supabase'
import { insertDocument, fetchDocument, removeDocument } from '../db/documents'
import { insertAuditLog } from '../db/audit-logs'
import { applyWatermark } from '../lib/watermark'

const documents = new Hono<{ Bindings: Env }>()

// POST / -- upload document
documents.post('/', requireAuth, requireRoomAdmin, async (c) => {
  const user = c.get('user')
  const roomId = c.get('roomId')

  const formData = await c.req.formData()
  const file = formData.get('file') as File | null
  const folderId = formData.get('folder_id') as string | null

  if (!file || file.size === 0) {
    return c.json({ success: false, error: 'File is required' }, 400)
  }

  const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100 MB
  if (file.size > MAX_FILE_SIZE) {
    return c.json({ success: false, error: 'File size exceeds 100 MB limit' }, 413)
  }

  const docId = crypto.randomUUID()
  const r2Key = `rooms/${roomId}/documents/${docId}/${file.name}`

  await c.env.VDR_R2.put(r2Key, file.stream(), {
    httpMetadata: { contentType: file.type },
  })

  const supabase = createServiceRoleClient(c.env)
  const document = await insertDocument(supabase, {
    id: docId,
    room_id: roomId,
    folder_id: folderId || null,
    name: file.name,
    file_size: file.size,
    content_type: file.type,
    r2_key: r2Key,
    uploaded_by: user.id,
  })

  await insertAuditLog(supabase, {
    room_id: roomId,
    user_id: user.id,
    action: 'document_uploaded',
    target_id: document.id,
    target_name: document.name,
    ip_address: c.req.header('cf-connecting-ip') ?? null,
    user_agent: c.req.header('user-agent') ?? null,
  })

  return c.json({ success: true, data: document }, 201)
})

// GET /:documentId/download -- download document
documents.get('/:documentId/download', requireAuth, requireRoomMember, async (c) => {
  const user = c.get('user')
  const roomId = c.get('roomId')
  const documentId = c.req.param('documentId')

  const supabase = createServiceRoleClient(c.env)
  const doc = await fetchDocument(supabase, documentId)

  if (!doc || doc.room_id !== roomId) {
    return c.json({ success: false, error: 'Document not found' }, 404)
  }

  const r2Object = await c.env.VDR_R2.get(doc.r2_key)
  if (!r2Object) {
    return c.json({ success: false, error: 'File not found in storage' }, 404)
  }

  await insertAuditLog(supabase, {
    room_id: roomId,
    user_id: user.id,
    action: 'document_downloaded',
    target_id: doc.id,
    target_name: doc.name,
    ip_address: c.req.header('cf-connecting-ip') ?? null,
    user_agent: c.req.header('user-agent') ?? null,
  })

  const asciiName = doc.name.replace(/[^\x20-\x7E]/g, '_')
  const utf8Name = encodeURIComponent(doc.name)
  const contentDisposition = `attachment; filename="${asciiName}"; filename*=UTF-8''${utf8Name}`

  if (doc.content_type === 'application/pdf') {
    const pdfBytes = await r2Object.arrayBuffer()
    const watermarked = await applyWatermark(
      pdfBytes,
      c.env.WATERMARK_TEXT,
      user.email,
      new Date().toISOString().slice(0, 10)
    )
    return new Response(watermarked.buffer as ArrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': contentDisposition,
        'Cache-Control': 'no-store',
      },
    })
  }

  return new Response(r2Object.body, {
    headers: {
      'Content-Type': doc.content_type,
      'Content-Disposition': contentDisposition,
      'Content-Length': String(doc.file_size),
    },
  })
})

// DELETE /:documentId -- delete document
documents.delete('/:documentId', requireAuth, requireRoomAdmin, async (c) => {
  const user = c.get('user')
  const roomId = c.get('roomId')
  const documentId = c.req.param('documentId')

  const supabase = createServiceRoleClient(c.env)
  const doc = await fetchDocument(supabase, documentId)

  if (!doc || doc.room_id !== roomId) {
    return c.json({ success: false, error: 'Document not found' }, 404)
  }

  // Delete R2 first -- if it fails we still have DB reference to retry
  await c.env.VDR_R2.delete(doc.r2_key)
  await removeDocument(supabase, documentId)

  await insertAuditLog(supabase, {
    room_id: roomId,
    user_id: user.id,
    action: 'document_deleted',
    target_id: doc.id,
    target_name: doc.name,
    ip_address: c.req.header('cf-connecting-ip') ?? null,
    user_agent: c.req.header('user-agent') ?? null,
  })

  return c.json({ success: true })
})

export { documents }
