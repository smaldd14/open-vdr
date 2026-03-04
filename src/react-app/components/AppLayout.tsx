import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { useSession, useAuthActions } from '../hooks/useUserProfile'

export function AppLayout({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const { signOut } = useAuthActions()
  const queryClient = useQueryClient()

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link to="/rooms" className="flex items-center gap-2 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="size-6">
              <rect x="10" y="10" width="55" height="55" fill="none" stroke="#8EAB87" strokeWidth="7"/>
              <rect x="35" y="35" width="55" height="55" fill="none" stroke="#4E7252" strokeWidth="7"/>
              <rect x="35" y="35" width="30" height="30" fill="#C8DBC5"/>
            </svg>
            Open VDR
          </Link>

          {session && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  {session.user.email}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={async () => {
                    await signOut()
                    queryClient.clear()
                  }}
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
