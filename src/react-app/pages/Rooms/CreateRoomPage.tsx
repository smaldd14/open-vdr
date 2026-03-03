import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/react-app/components/ui/button'
import { Input } from '@/react-app/components/ui/input'
import { Field, FieldGroup, FieldLabel } from '@/react-app/components/ui/field'
import { useSession } from '@/react-app/hooks/useUserProfile'
import { useCreateRoom } from '@/react-app/hooks/useRooms'

export function CreateRoomPage() {
  const { data: session } = useSession()
  const createRoom = useCreateRoom(session!.user.id)

  const [name, setName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [description, setDescription] = useState('')

  return (
    <div className="container mx-auto max-w-lg px-4 py-10">
      <Link
        to="/rooms"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="size-4" />
        Back to rooms
      </Link>

      <h1 className="text-3xl font-bold mb-8">Create Room</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          createRoom.mutate({
            name,
            company_name: companyName || null,
            description: description || null,
          })
        }}
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">Room Name</FieldLabel>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Series A Due Diligence"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="company-name">Company Name</FieldLabel>
            <Input
              id="company-name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Acme Corp"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of this data room"
            />
          </Field>
          <Button type="submit" disabled={createRoom.isPending}>
            {createRoom.isPending ? 'Creating...' : 'Create Room'}
          </Button>
        </FieldGroup>
      </form>
    </div>
  )
}
