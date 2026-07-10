import { api } from './client';
import { type Assignment } from './messages';

// Wire values must match the backend's content_assignments.content_type.
// The memoir feature is stored as `chapter` server-side (see content.service);
// the UI labels it "Memoir" but the value on the wire is `chapter`.
export interface UnassignedItem {
  id: string;
  contentType: 'message' | 'document' | 'photo' | 'chapter';
  title: string;
  subType: string | null;
  fileSize: number | null;
  createdAt: string;
}

export interface UnassignedResponse {
  items: UnassignedItem[];
  counts: {
    total: number;
    message: number;
    document: number;
    photo: number;
    chapter: number;
  };
}

export const getUnassignedContent = (token: string, type?: string): Promise<UnassignedResponse> => {
  const query = type ? `?type=${type}` : '';
  return api.get<UnassignedResponse>(`/content/unassigned${query}`, token);
};

export const bulkAssignContent = (
  token: string,
  body: {
    items: { contentType: string; contentId: string }[];
    assignments: Assignment[];
  },
): Promise<{ updated: number }> =>
  api.post<{ updated: number }>('/content/bulk-assign', body, token);

export interface BulkDeleteResponse {
  deleted: number;
  skipped: Array<{ contentType: string; contentId: string }>;
}

export const bulkDeleteContent = (
  token: string,
  body: { items: { contentType: string; contentId: string }[] },
): Promise<BulkDeleteResponse> =>
  api.post<BulkDeleteResponse>('/content/bulk-delete', body, token);
