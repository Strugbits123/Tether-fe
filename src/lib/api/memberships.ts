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

// Backend returns { memberships: [...] } (see MembershipsService.listMemberships),
// not a bare array — unwrap it here so every caller can keep treating this as
// a plain Membership[].
export const getMemberships = async (token: string): Promise<Membership[]> => {
  const result = await api.get<{ memberships: Membership[] }>('/auth/memberships', token)
  return result?.memberships ?? []
}

/** Whether this user has an owner-portal membership (their own Tether
 *  account), used to gate RM-only affordances like the "Create my Tether"
 *  promo. Shared so the sidebar CTA and the create-account redirect guard
 *  can never disagree on the check. */
export const hasOwnerMembership = async (token: string): Promise<boolean> => {
  const memberships = await getMemberships(token)
  return memberships.some((m) => m.portal === 'owner')
}

export const switchContext = (token: string, membershipId: string) =>
  api.post<SwitchContextResult>('/auth/switch-context', { membershipId }, token)

export const getActiveContext = (token: string) =>
  api.get<SwitchContextResult>('/auth/active-context', token)
