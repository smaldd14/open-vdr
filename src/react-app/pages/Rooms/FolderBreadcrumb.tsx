import { Fragment } from 'react'
import type { Folder } from '@/react-app/lib/folders'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/react-app/components/ui/breadcrumb'

export function FolderBreadcrumb({
  folderStack,
  folders,
  onNavigate,
}: {
  folderStack: (string | null)[]
  folders: Folder[]
  onNavigate: (index: number) => void
}) {
  const folderMap = new Map(folders.map((f) => [f.id, f]))

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {folderStack.map((folderId, index) => {
          const isLast = index === folderStack.length - 1
          const label = folderId ? folderMap.get(folderId)?.name ?? 'Unknown' : 'All Files'

          return (
            <Fragment key={folderId ?? 'root'}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    role="button"
                    tabIndex={0}
                    className="cursor-pointer"
                    onClick={() => onNavigate(index)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') onNavigate(index)
                    }}
                  >
                    {label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
