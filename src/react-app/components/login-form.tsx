import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { cn } from "@/react-app/lib/utils"
import { Button } from "@/react-app/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/react-app/components/ui/field"
import { Input } from "@/react-app/components/ui/input"
import { useAuthActions } from "../hooks/useUserProfile"

interface LoginFormProps extends React.ComponentProps<"form"> {
  mode?: 'sign-in' | 'sign-up'
}

export function LoginForm({
  className,
  mode = 'sign-in',
  ...props
}: LoginFormProps) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const redirectUrl = searchParams.get('redirect') || '/rooms'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { signIn, signUp } = useAuthActions()

  const isSignUp = mode === 'sign-up'

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        if (isSignUp) {
          const result = await signUp(email, password, name)
          setLoading(false)
          if (result.error) {
            setError(result.error.message)
          } else if (result.needsEmailConfirmation) {
            const redirect = searchParams.get('redirect')
            const confirmParams = new URLSearchParams({ email })
            if (redirect) confirmParams.set('redirect', redirect)
            navigate(`/auth/confirm-email?${confirmParams}`)
          } else {
            navigate(redirectUrl)
          }
        } else {
          const result = await signIn(email, password)
          setLoading(false)
          if (result.error) {
            setError(result.error.message)
          } else {
            navigate(redirectUrl)
          }
        }
      }}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">
            {isSignUp ? 'Create an account' : 'Login to your account'}
          </h1>
          <p className="text-muted-foreground text-sm text-balance">
            {isSignUp
              ? 'Enter your details below to create your account'
              : 'Enter your email below to login to your account'}
          </p>
        </div>
        {isSignUp && (
          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Field>
        )}
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </Field>
        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}
        <Field>
          <Button type="submit" disabled={loading}>
            {loading ? 'Loading...' : isSignUp ? 'Sign up' : 'Login'}
          </Button>
        </Field>
        <FieldDescription className="text-center">
          {isSignUp ? (
            <>
              Already have an account?{" "}
              <a href="/auth?mode=sign-in" className="underline underline-offset-4">
                Sign in
              </a>
            </>
          ) : (
            <>
              Don&apos;t have an account?{" "}
              <a href="/auth?mode=sign-up" className="underline underline-offset-4">
                Sign up
              </a>
            </>
          )}
        </FieldDescription>
      </FieldGroup>
    </form>
  )
}
