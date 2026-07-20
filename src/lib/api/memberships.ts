import { api } from './client'

/** 'owner' is the person's own Tether account; 'release_manager' is the /rm
 *  portal, entered for any account where this user has been designated (or
 *  promoted from guardian into) a Release Manager. */
export type MembershipPortal = 'owner' | 'release_manager'

export interface Membership {
  id: string
  portal: MembershipPortal
  is_self: boolean
  owner_name: string | null
  relationship: string | null
  /** Whether a release has been activated on that account (only meaningful
   *  for portal === 'release_manager'). */
  release_active: boolean
  stats: {
    messages: number
    documents: number
    recipients: number
  }
}

export interface SwitchContextResult {
  membership_id: string
  portal: MembershipPortal
}

export const getMemberships = (token: string) =>
  api.get<Membership[]>('/auth/memberships', token)

export const switchContext = (token: string, membershipId: string) =>
  api.post<SwitchContextResult>('/auth/switch-context', { membershipId }, token)

export const getActiveContext = (token: string) =>
  api.get<SwitchContextResult>('/auth/active-context', token)
