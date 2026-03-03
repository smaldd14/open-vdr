import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useSession() {
  return useQuery({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      return session
    },
  })
}

export function useAuthActions() {
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    const needsEmailConfirmation = !error && data.user && !data.session
    return { error, needsEmailConfirmation }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return { signIn, signUp, signOut }
}
