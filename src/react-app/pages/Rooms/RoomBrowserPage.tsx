import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ClipboardList, Settings } from 'lucide-react'
import { Button } from '@/react-app/components/ui/button'
import { Skeleton } from '@/react-app/components/ui/skeleton'
import { useRoom, useRoomMembership, useRoomLogoUrl } from '@/react-app/hooks/useRooms'
import { useSession } from '@/react-app/hooks/useUserProfile'
import { useFolders } from '@/react-app/hooks/useFolders'
import { useDocuments } from '@/react-app/hooks/useDocuments'
import { FolderBreadcrumb } from './FolderBreadcrumb'
import { FolderList } from './FolderList'
import { DocumentTable } from './DocumentTable'
import { RoomBrowserActions } from './RoomBrowserActions'

export function RoomBrowserPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const [folderStack, setFolderStack] = useState<(string | null)[]>([null])

  const { data: session } = useSession()
  const userId = session?.user?.id ?? ''
  const { data: room, isLoading: roomLoading } = useRoom(roomId!)
  const { data: membership } = useRoomMembership(roomId!, userId)
  const { data: logoUrl } = useRoomLogoUrl(roomId!, !!room?.logo_url)
  const { data: folders = [] } = useFolders(roomId!)

  const currentFolderId = folderStack[folderStack.length - 1]
  const childFolders = folders.filter((f) => f.parent_id === currentFolderId)
  const isAdmin = membership?.role === 'admin'

  const { data: documents, isLoading: documentsLoading } = useDocuments(roomId!, currentFolderId)

  if (roomLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div
          className="flex items-center gap-4"
          style={room?.primary_color ? { borderLeft: `4px solid ${room.primary_color}`, paddingLeft: '12px' } : undefined}
        >
          {logoUrl && (
            <img
              src={logoUrl}
              alt="Room logo"
              className="h-10 object-contain"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold">{room?.name}</h1>
            {room?.company_name && (
              <p className="text-sm text-muted-foreground mt-1">{room.company_name}</p>
            )}
          </div>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <RoomBrowserActions roomId={roomId!} userId={userId} folderId={currentFolderId} />
            <Button variant="outline" size="sm" asChild>
              <Link to={`/rooms/${roomId}/audit`}>
                <ClipboardList className="size-4" />
                Audit Log
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/rooms/${roomId}/settings`}>
                <Settings className="size-4" />
                Settings
              </Link>
            </Button>
          </div>
        )}
      </div>

      <div className="mb-4">
        <FolderBreadcrumb
          folderStack={folderStack}
          folders={folders}
          onNavigate={(index) => setFolderStack((prev) => prev.slice(0, index + 1))}
        />
      </div>

      <FolderList
        folders={childFolders}
        roomId={roomId!}
        isAdmin={isAdmin}
        onEnterFolder={(folderId) => setFolderStack((prev) => [...prev, folderId])}
      />

      <div className={childFolders.length > 0 ? 'mt-6' : ''}>
        <DocumentTable
          documents={documents}
          isLoading={documentsLoading}
          roomId={roomId!}
          folderId={currentFolderId}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  )
}
