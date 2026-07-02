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

export const submitFeedback = (
  token: string,
  data: {
    type: FeedbackType
    page_context?: string
    body: string
    screenshot_path?: string
  },
) => api.post<{ id: string; type: FeedbackType; message: string }>('/feedback', data, token)
