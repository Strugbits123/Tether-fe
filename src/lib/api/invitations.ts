import { api } from './client'

export type InvitationRole = 'release_manager' | 'guardian' | 'recipient' | string

export interface InvitationAlreadyAccepted {
  alreadyAccepted: true
  role: InvitationRole
  loggedIn: boolean
}

/** Not logged in yet — the user must sign up (or sign in) before the
 *  invitation can be finalized. `redirectUrl` is a full frontend URL, e.g.
 *  `{frontend}/auth/signup?invite_token=...&role=...&name=...`. */
export interface InvitationNeedsAuth {
  alreadyAccepted: false
  loggedIn: false
  redirectUrl: string
}

/** Already logged in — the backend accepted the invitation server-side as
 *  part of this call. `redirectUrl` is `{frontend}/portal/{role}`. */
export interface InvitationAcceptedNow {
  alreadyAccepted: false
  loggedIn: true
  role: InvitationRole
  redirectUrl: string
}

export type InvitationAcceptResponse =
  | InvitationAlreadyAccepted
  | InvitationNeedsAuth
  | InvitationAcceptedNow

/**
 * GET /invitations/accept/:token. `token` here is optional and, when
 * present, forwards the caller's session so the backend can link/finalize
 * the invitation against the already-authenticated user.
 */
export const acceptInvitation = (inviteToken: string, token?: string) =>
  api.get<InvitationAcceptResponse>(`/invitations/accept/${inviteToken}`, token)
