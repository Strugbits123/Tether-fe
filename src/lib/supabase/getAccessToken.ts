import { createClient } from './client'

/** Reads the current Supabase session's access token, or null if there isn't
 *  one. Centralized so every caller shares the same behavior (e.g. future
 *  refresh-on-expiry or error handling only needs to change here). */
export async function getAccessToken(): Promise<string | null> {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.access_token ?? null
}
