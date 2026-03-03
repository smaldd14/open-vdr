import { useState } from 'react'
import { Folder as FolderIcon, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/react-app/components/ui/button'
import { Input } from '@/react-app/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/react-app/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/react-app/components/ui/dropdown-menu'
import type { Folder } from '@/react-app/lib/folders'
import { useRenameFolder, useDeleteFolder } from '@/react-app/hooks/useFolders'

export function FolderList({
  folders,
  roomId,
  isAdmin,
  onEnterFolder,
}: {
  folders: Folder[]
  roomId: string
  isAdmin: boolean
  onEnterFolder: (folderId: string) => void
}) {
  const [renamingFolder, setRenamingFolder] = useState<Folder | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const renameFolder = useRenameFolder(roomId)
  const deleteFolderMutation = useDeleteFolder(roomId)

  if (folders.length === 0) return null

  return (
    <>
      <div className="space-y-1">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-muted/50"
          >
            <button
              className="flex flex-1 items-center gap-3 text-left"
              onClick={() => onEnterFolder(folder.id)}
            >
              <FolderIcon className="size-5 text-muted-foreground" />
              <span className="text-sm font-medium">{folder.name}</span>
            </button>

            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setRenamingFolder(folder)
                      setRenameValue(folder.name)
                    }}
                  >
                    <Pencil className="size-4" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => deleteFolderMutation.mutate(folder.id)}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        ))}
      </div>

      <Dialog open={!!renamingFolder} onOpenChange={(open) => !open && setRenamingFolder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && renamingFolder && renameValue.trim()) {
                renameFolder.mutate(
                  { folderId: renamingFolder.id, name: renameValue.trim() },
                  { onSuccess: () => setRenamingFolder(null) }
                )
              }
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenamingFolder(null)}>
              Cancel
            </Button>
            <Button
              disabled={!renameValue.trim() || renameFolder.isPending}
              onClick={() => {
                if (renamingFolder && renameValue.trim()) {
                  renameFolder.mutate(
                    { folderId: renamingFolder.id, name: renameValue.trim() },
                    { onSuccess: () => setRenamingFolder(null) }
                  )
                }
              }}
            >
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
