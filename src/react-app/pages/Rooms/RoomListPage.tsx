import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/react-app/components/ui/button'
import { Skeleton } from '@/react-app/components/ui/skeleton'
import { useRooms } from '@/react-app/hooks/useRooms'
import { RoomCard } from './RoomCard'
import { PendingInviteBanner } from './PendingInviteBanner'

export function RoomListPage() {
  const { data: rooms, isLoading, error } = useRooms()

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Data Rooms</h1>
        <Button asChild>
          <Link to="/rooms/new">
            <Plus className="size-4" />
            New Room
          </Link>
        </Button>
      </div>

      <PendingInviteBanner />

      {error && (
        <p className="text-sm text-destructive">{error.message}</p>
      )}

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      )}

      {rooms && rooms.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-muted-foreground mb-4">No data rooms yet.</p>
          <Button asChild>
            <Link to="/rooms/new">Create your first room</Link>
          </Button>
        </div>
      )}

      {rooms && rooms.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  )
}
