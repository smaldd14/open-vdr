import { Link } from 'react-router-dom'
import { Users } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/react-app/components/ui/card'
import { useRoomMemberCount, useRoomLogoUrl } from '@/react-app/hooks/useRooms'
import type { DataRoom } from '@/react-app/lib/rooms'

export function RoomCard({ room }: { room: DataRoom }) {
  const { data: memberCount } = useRoomMemberCount(room.id)
  const { data: logoUrl } = useRoomLogoUrl(room.id, !!room.logo_url)

  return (
    <Link to={`/rooms/${room.id}`}>
      <Card className="h-full transition-colors hover:border-primary/50">
        <CardHeader>
          {logoUrl && (
            <img src={logoUrl} alt="Room logo" className="h-8 w-auto object-contain mb-1" />
          )}
          <CardTitle>{room.name}</CardTitle>
          {room.company_name && (
            <CardDescription>{room.company_name}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {room.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {room.description}
            </p>
          )}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="size-4" />
            <span>{memberCount ?? '...'} {memberCount === 1 ? 'member' : 'members'}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
