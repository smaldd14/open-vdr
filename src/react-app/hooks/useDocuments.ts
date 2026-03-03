import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  fetchDocuments,
  uploadDocument,
  deleteDocument,
  downloadDocument,
  viewDocument,
} from '../lib/documents'

export function useDocuments(roomId: string, folderId: string | null) {
  return useQuery({
    queryKey: ['rooms', roomId, 'documents', folderId ?? 'root'],
    queryFn: () => fetchDocuments(roomId, folderId),
  })
}

export function useUploadDocument(roomId: string, folderId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => uploadDocument(roomId, folderId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['rooms', roomId, 'documents', folderId ?? 'root'],
      })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteDocument(roomId: string, folderId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (documentId: string) => deleteDocument(roomId, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['rooms', roomId, 'documents', folderId ?? 'root'],
      })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export function useDownloadDocument(roomId: string) {
  return useMutation({
    mutationFn: ({ documentId, fileName }: { documentId: string; fileName: string }) =>
      downloadDocument(roomId, documentId, fileName),
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export function useViewDocument(roomId: string) {
  return useMutation({
    mutationFn: ({ documentId }: { documentId: string }) =>
      viewDocument(roomId, documentId),
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
