import { api } from './client'

export type FeedbackType = 'bug_report' | 'feature_request' | 'general_feedback'

export const getScreenshotUploadUrl = (
  token: string,
  data: { file_name: string; file_type: string; file_size_bytes: number },
) =>
  api.post<{ upload_url: string; storage_path: string }>(
    '/feedback/screenshot-upload-url',
    data,
    token,
  )

// Payload shape mirrors the backend SubmitFeedbackDto exactly. The API uses
// forbidNonWhitelisted, so field names must match per feedback type.
export type GeneralFeedbackType =
  | 'praise'
  | 'suggestion'
  | 'complaint'
  | 'question'
  | 'other'

export type FeedbackPayload =
  | { type: 'bug_report'; location?: string; description: string; screenshot_path?: string }
  | {
      type: 'feature_request'
      feature_description: string
      feature_benefit: string
      screenshot_path?: string
    }
  | {
      type: 'general_feedback'
      feedback_type?: GeneralFeedbackType
      description: string
      screenshot_path?: string
    }

export const submitFeedback = (token: string, data: FeedbackPayload) =>
  api.post<{ id: string; type: FeedbackType; message: string }>('/feedback', data, token)
