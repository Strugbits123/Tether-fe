export interface User {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  full_name: string
  date_of_birth: string | null
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say' | null
  phone_number: string | null
  sms_opted_in: boolean
  auth_provider: 'email' | 'google' | 'magic_link'
  email_verified_at: string | null
  last_login_at: string | null
  account_status: 'trial' | 'active' | 'grace_period' | 'restricted' | 'delivered' | 'closing' | 'deleted'
  notification_preferences: {
    release_plan: boolean
    recipient_activity: boolean
    billing: boolean
    product_updates: boolean
  }
  onboarding: {
    finish_account: boolean
    add_release_manager: boolean
    add_recipients: boolean
    add_photos: boolean
    create_message: boolean
    completed_at: string | null
  }
  role: 'account_owner' | 'admin'
  created_at: string
  updated_at: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  expires_at: number
  user: {
    id: string
    email: string
  }
}

export interface DashboardStats {
  messages: number
  documents: number
  photos: number
  memoir_chapters: number
  recipients: number
  release_manager_status: 'not_designated' | 'invited' | 'accepted'
}

export interface ActivityItem {
  id: string
  event_type: string
  event_label: string
  created_at: string
}

export interface OnboardingStep {
  key: keyof User['onboarding']
  label: string
  description: string
  href: string
  completed: boolean
}
