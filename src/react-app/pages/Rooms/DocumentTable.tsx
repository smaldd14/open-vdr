import { Download, Trash2 } from 'lucide-react'
import { Button } from '@/react-app/components/ui/button'
import { Skeleton } from '@/react-app/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/react-app/components/ui/table'
import type { Document } from '@/react-app/lib/documents'
import { useDeleteDocument, useDownloadDocument } from '@/react-app/hooks/useDocuments'
import { formatDate } from '@/react-app/lib/date-utils'

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function DocumentTable({
  documents,
  isLoading,
  roomId,
  folderId,
  isAdmin,
}: {
  documents: Document[] | undefined
  isLoading: boolean
  roomId: string
  folderId: string | null
  isAdmin: boolean
}) {
  const deleteDoc = useDeleteDocument(roomId, folderId)
  const downloadDoc = useDownloadDocument(roomId)

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm text-muted-foreground">No documents in this folder.</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead className="w-24">Size</TableHead>
          <TableHead className="w-32">Uploaded</TableHead>
          <TableHead className="w-20" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((doc) => (
          <TableRow key={doc.id}>
            <TableCell className="font-medium">{doc.name}</TableCell>
            <TableCell className="text-muted-foreground">
              {formatFileSize(doc.file_size)}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDate(doc.created_at)}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1 justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() =>
                    downloadDoc.mutate({ documentId: doc.id, fileName: doc.name })
                  }
                >
                  <Download className="size-4" />
                </Button>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive hover:text-destructive"
                    onClick={() => deleteDoc.mutate(doc.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
