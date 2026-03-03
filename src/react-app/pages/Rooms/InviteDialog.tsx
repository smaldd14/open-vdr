import { useState } from 'react'
import { Button } from '@/react-app/components/ui/button'
import { Input } from '@/react-app/components/ui/input'
import { Label } from '@/react-app/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/react-app/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/react-app/components/ui/select'
import { useCreateInvitation } from '@/react-app/hooks/useInvitations'

export function InviteDialog({
  roomId,
  open,
  onOpenChange,
}: {
  roomId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<string>('viewer')
  const createInvitation = useCreateInvitation(roomId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>
            Send an email invitation to join this data room.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            createInvitation.mutate(
              { email, role },
              {
                onSuccess: () => {
                  setEmail('')
                  setRole('viewer')
                  onOpenChange(false)
                },
              }
            )
          }}
          className="grid gap-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createInvitation.isPending}>
              {createInvitation.isPending ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
