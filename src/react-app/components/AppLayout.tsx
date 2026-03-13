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
          <Link to="/rooms" className="flex items-center gap-3">
            <img src="/favicon.svg" alt="" className="h-9 w-9" />
            <span className="font-semibold text-foreground tracking-tight">RPS VDR</span>
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
