import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { apiClient } from '../lib/api-client'
import { supabase } from '../lib/supabase'
import {
  fetchRooms,
  fetchRoom,
  fetchRoomMemberCount,
  fetchRoomMembership,
  createRoom,
  updateRoom,
  uploadRoomLogo,
  type CreateRoomInput,
} from '../lib/rooms'

export function useRooms() {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: fetchRooms,
  })
}

export function useRoom(roomId: string) {
  return useQuery({
    queryKey: ['rooms', roomId],
    queryFn: () => fetchRoom(roomId),
  })
}

export function useRoomMemberCount(roomId: string) {
  return useQuery({
    queryKey: ['rooms', roomId, 'member-count'],
    queryFn: () => fetchRoomMemberCount(roomId),
  })
}

export function useRoomMembership(roomId: string, userId: string) {
  return useQuery({
    queryKey: ['rooms', roomId, 'membership'],
    queryFn: () => fetchRoomMembership(roomId, userId),
    enabled: !!userId,
  })
}

export function useUpdateRoom(roomId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (patch: Parameters<typeof updateRoom>[1]) => updateRoom(roomId, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms', roomId] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export function useRoomLogoUrl(roomId: string, hasLogo: boolean) {
  return useQuery({
    queryKey: ['rooms', roomId, 'logo'],
    enabled: hasLogo,
    staleTime: Infinity,
    queryFn: async () => {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token
      const res = await fetch(`/api/rooms/${roomId}/branding/logo`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) throw new Error('Failed to load logo')
      const blob = await res.blob()
      return URL.createObjectURL(blob)
    },
  })
}

export function useUploadRoomLogo(roomId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => uploadRoomLogo(roomId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms', roomId] })
      queryClient.invalidateQueries({ queryKey: ['rooms', roomId, 'logo'] })
      toast.success('Logo uploaded')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export function useCreateRoom(userId: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (input: CreateRoomInput) => createRoom(input, userId),
    onSuccess: (room) => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      navigate(`/rooms/${room.id}`)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export function useRemoveRoomMember(roomId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiClient.delete(`/rooms/${roomId}/members/${userId}`)
      if (!response.success) throw new Error(response.error ?? 'Failed to remove member')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms', roomId, 'members'] })
      queryClient.invalidateQueries({ queryKey: ['rooms', roomId, 'member-count'] })
      toast.success('Member removed')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
