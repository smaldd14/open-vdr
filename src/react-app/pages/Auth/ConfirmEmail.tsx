import { GalleryVerticalEnd, Mail } from 'lucide-react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { useSession } from '@/react-app/hooks/useUserProfile'

export function ConfirmEmailPage() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email')
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
            Open VDR
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm text-center">
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="size-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Check your email</h1>
            <p className="text-muted-foreground text-sm mb-6">
              We sent a confirmation link to{' '}
              {email ? (
                <span className="font-medium text-foreground">{email}</span>
              ) : (
                'your email address'
              )}
              . Click the link in the email to verify your account.
            </p>
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>
                Didn't receive the email? Check your spam folder or{' '}
                <a href="/auth?mode=sign-up" className="text-primary underline underline-offset-4">
                  try again
                </a>
              </p>
              <p>
                Already confirmed?{' '}
                <a href="/auth?mode=sign-in" className="text-primary underline underline-offset-4">
                  Sign in
                </a>
              </p>
            </div>
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
