import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { apiClient } from '../lib/api-client'
import type { Tables } from '@/types/supabase'

type Invitation = Tables<'invitations'>

interface InvitationWithRoom extends Invitation {
  data_rooms: { name: string } | null
}

interface InviteDetails {
  id: string
  email: string
  role: string
  room_id: string
  room_name: string
  expires_at: string
}

export function useRoomInvitations(roomId: string) {
  return useQuery({
    queryKey: ['rooms', roomId, 'invitations'],
    queryFn: async () => {
      const response = await apiClient.get<Invitation[]>(`/rooms/${roomId}/invitations`)
      if (!response.success) throw new Error(response.error ?? 'Failed to fetch invitations')
      return response.data!
    },
  })
}

export function useCreateInvitation(roomId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { email: string; role: string }) => {
      const response = await apiClient.post<Invitation>(`/rooms/${roomId}/invitations`, input)
      if (!response.success) throw new Error(response.error ?? 'Failed to send invitation')
      return response.data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms', roomId, 'invitations'] })
      toast.success('Invitation sent')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export function useRevokeInvitation(roomId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const response = await apiClient.delete(`/rooms/${roomId}/invitations/${invitationId}`)
      if (!response.success) throw new Error(response.error ?? 'Failed to revoke invitation')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms', roomId, 'invitations'] })
      toast.success('Invitation revoked')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export function usePendingInvites() {
  return useQuery({
    queryKey: ['invites', 'pending'],
    queryFn: async () => {
      const response = await apiClient.get<InvitationWithRoom[]>('/invite/pending')
      if (!response.success) throw new Error(response.error ?? 'Failed to fetch pending invites')
      return response.data!
    },
  })
}

export function useInviteDetails(token: string | null) {
  return useQuery({
    queryKey: ['invite', token],
    queryFn: async () => {
      const response = await apiClient.get<InviteDetails>(`/invite?token=${token}`)
      if (!response.success) throw new Error(response.error ?? 'Invalid invitation')
      return response.data!
    },
    enabled: !!token,
  })
}

export function useAcceptInvite() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (token: string) => {
      const response = await apiClient.post<{ room_id: string }>('/invite/accept', { token })
      if (!response.success) throw new Error(response.error ?? 'Failed to accept invitation')
      return response.data!
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      queryClient.invalidateQueries({ queryKey: ['invites', 'pending'] })
      navigate(`/rooms/${data.room_id}`)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
