import { GalleryVerticalEnd, CheckCircle2 } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { useSession } from '@/react-app/hooks/useUserProfile'

export function EmailConfirmedPage() {
  const { data: session } = useSession()

  if (session) {
    return <Navigate to="/rooms" replace />
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            RPS VDR
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm text-center">
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="size-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Email verified!</h1>
            <p className="text-muted-foreground text-sm mb-6">
              Your email has been verified. You can close this tab.
            </p>
            <a
              href="/auth?mode=sign-in"
              className="text-sm text-primary underline underline-offset-4"
            >
              Go to sign in
            </a>
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/placeholder.svg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
