import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  fetchFolders,
  createFolder,
  renameFolder,
  deleteFolder,
  type CreateFolderInput,
} from '../lib/folders'

export function useFolders(roomId: string) {
  return useQuery({
    queryKey: ['rooms', roomId, 'folders'],
    queryFn: () => fetchFolders(roomId),
  })
}

export function useCreateFolder(roomId: string, userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateFolderInput) => createFolder(input, roomId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms', roomId, 'folders'] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export function useRenameFolder(roomId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ folderId, name }: { folderId: string; name: string }) =>
      renameFolder(folderId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms', roomId, 'folders'] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteFolder(roomId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (folderId: string) => deleteFolder(folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms', roomId, 'folders'] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
