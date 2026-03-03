import { useRef, useState } from 'react'
import { FolderPlus, Upload } from 'lucide-react'
import { Button } from '@/react-app/components/ui/button'
import { Input } from '@/react-app/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/react-app/components/ui/dialog'
import { useCreateFolder } from '@/react-app/hooks/useFolders'
import { useUploadDocument } from '@/react-app/hooks/useDocuments'

export function RoomBrowserActions({
  roomId,
  userId,
  folderId,
}: {
  roomId: string
  userId: string
  folderId: string | null
}) {
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [folderName, setFolderName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const createFolder = useCreateFolder(roomId, userId)
  const uploadDocument = useUploadDocument(roomId, folderId)

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setFolderName('')
            setShowNewFolder(true)
          }}
        >
          <FolderPlus className="size-4" />
          New Folder
        </Button>
        <Button
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadDocument.isPending}
        >
          <Upload className="size-4" />
          {uploadDocument.isPending ? 'Uploading...' : 'Upload'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              uploadDocument.mutate(file)
              e.target.value = ''
            }
          }}
        />
      </div>

      <Dialog open={showNewFolder} onOpenChange={setShowNewFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Folder</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Folder name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && folderName.trim()) {
                createFolder.mutate(
                  { name: folderName.trim(), parent_id: folderId },
                  { onSuccess: () => setShowNewFolder(false) }
                )
              }
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFolder(false)}>
              Cancel
            </Button>
            <Button
              disabled={!folderName.trim() || createFolder.isPending}
              onClick={() => {
                if (folderName.trim()) {
                  createFolder.mutate(
                    { name: folderName.trim(), parent_id: folderId },
                    { onSuccess: () => setShowNewFolder(false) }
                  )
                }
              }}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
