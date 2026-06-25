import { api } from "./client";
import type { Assignment } from "@/lib/utils/assignments";

export type { Assignment };

export interface Photo {
  id: string;
  storage_path: string;
  file_type: string;
  file_size_bytes: number;
  title: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  display_order: number;
  created_at: string;
  signedUrl: string | null;
}

export interface PhotoFolder {
  id: string;
  name: string;
  photoCount: number;
  created_at: string;
}

export interface FoldersResponse {
  folders: PhotoFolder[];
  uncategorizedCount: number;
}

export const requestPhotoUploadUrls = (
  token: string,
  files: { fileName: string; fileType: string; fileSizeBytes: number }[],
) =>
  api.post<
    {
      signedUploadUrl: string;
      token: string;
      storagePath: string;
      fileIndex: number;
    }[]
  >("/photos/upload-urls", { files }, token);

export const createPhotosBatch = (
  token: string,
  body: {
    photos: {
      storagePath: string;
      fileType: string;
      fileSizeBytes: number;
      width?: number;
      height?: number;
      title?: string;
    }[];
    caption?: string;
    folderId?: string;
    assignments: Assignment[];
  },
) => api.post<{ count: number; photos: Photo[] }>("/photos/batch", body, token);

export const getPhotos = (token: string, folderId?: string | null) => {
  // folderId === undefined → all photos (no filter)
  // folderId === null      → uncategorized only (no folder assigned)
  // folderId === string    → specific folder
  const query =
    folderId === null
      ? "?folder_id=null"
      : folderId
        ? `?folder_id=${folderId}`
        : "";
  return api.get<Photo[]>(`/photos${query}`, token);
};

export interface PhotoAssignment {
  assignment_scope:
    | "all"
    | "group"
    | "release_manager"
    | "assign_later"
    | "individual";
  group_value: string | null;
  recipient_id: string | null;
}

export interface PhotoDetail extends Photo {
  assignments: PhotoAssignment[];
}

export const getPhoto = (token: string, id: string) =>
  api.get<PhotoDetail>(`/photos/${id}`, token);

export const updatePhoto = (
  token: string,
  id: string,
  body: { title?: string; caption?: string; assignments?: Assignment[] },
) => api.patch<Photo>(`/photos/${id}`, body, token);

export const movePhoto = (
  token: string,
  id: string,
  body: { folderId: string | null },
) => api.patch<Photo>(`/photos/${id}/move`, body, token);

export const deletePhoto = (token: string, id: string) =>
  api.delete<{ message: string }>(`/photos/${id}`, token);

export const getPhotoDownloadUrl = (token: string, id: string) =>
  api.get<{ downloadUrl: string; expiresIn: number }>(
    `/photos/${id}/download-url`,
    token,
  );

export const createFolder = (
  token: string,
  body: { name: string; assignments: Assignment[] },
) => api.post<PhotoFolder>("/photos/folders", body, token);

export const getFolders = (token: string) =>
  api.get<FoldersResponse>("/photos/folders", token);

export const renameFolder = (
  token: string,
  folderId: string,
  body: { name: string },
) => api.patch<PhotoFolder>(`/photos/folders/${folderId}`, body, token);

export const deleteFolder = (token: string, folderId: string) =>
  api.delete<{ success: boolean }>(`/photos/folders/${folderId}`, token);
