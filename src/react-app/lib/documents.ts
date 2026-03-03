import type { Tables } from '@/types/supabase'
import { supabase } from './supabase'
import { apiClient } from './api-client'

export type Document = Tables<'documents'>

export async function fetchDocuments(roomId: string, folderId: string | null) {
  let query = supabase
    .from('documents')
    .select('*')
    .eq('room_id', roomId)
    .order('name')

  if (folderId) {
    query = query.eq('folder_id', folderId)
  } else {
    query = query.is('folder_id', null)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function uploadDocument(roomId: string, folderId: string | null, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  if (folderId) {
    formData.append('folder_id', folderId)
  }
  const response = await apiClient.uploadFile<Document>(
    `/rooms/${roomId}/documents`,
    formData
  )
  if (!response.success) {
    throw new Error(response.error ?? 'Upload failed')
  }
  return response.data!
}

export async function deleteDocument(roomId: string, documentId: string) {
  const response = await apiClient.delete(`/rooms/${roomId}/documents/${documentId}`)
  if (!response.success) {
    throw new Error(response.error ?? 'Delete failed')
  }
}

export async function downloadDocument(roomId: string, documentId: string, fileName: string) {
  const token = (await supabase.auth.getSession()).data.session?.access_token
  const response = await fetch(`/api/rooms/${roomId}/documents/${documentId}/download`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })

  if (!response.ok) {
    throw new Error(`Download failed: ${response.status}`)
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function viewDocument(roomId: string, documentId: string) {
  const token = (await supabase.auth.getSession()).data.session?.access_token
  const response = await fetch(`/api/rooms/${roomId}/documents/${documentId}/view`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })

  if (!response.ok) {
    throw new Error(`View failed: ${response.status}`)
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
