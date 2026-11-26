export const MAX_UPLOAD_FILE_SIZE_BYTES = 4 * 1024 * 1024;
export const MAX_UPLOAD_FILE_SIZE_LABEL = "4 MB";

export const UPLOAD_ALLOWED_EXTENSIONS = {
  teacherMaterial: [
    "jpg", "jpeg", "png", "gif", "webp", "pdf",
    "mp3", "wav", "m4a", "aac", "ogg",
    "mp4", "mov", "avi", "webm", "mkv",
  ],
  studentAssessment: ["pdf", "png", "jpg", "jpeg"],
  adminStudentImport: ["xlsx"],
} as const;

export type UploadKind = keyof typeof UPLOAD_ALLOWED_EXTENSIONS;

export function uploadFileExtension(fileName: string) {
  return fileName.split(".").at(-1)?.toLowerCase() || "";
}

export function isAllowedUploadExtension(fileName: string, kind: UploadKind) {
  const extension = uploadFileExtension(fileName);
  return (UPLOAD_ALLOWED_EXTENSIONS[kind] as readonly string[]).includes(extension);
}

export function uploadAccept(kind: UploadKind) {
  return UPLOAD_ALLOWED_EXTENSIONS[kind].map(extension => `.${extension}`).join(",");
}

export function uploadExtensionsLabel(kind: UploadKind) {
  return UPLOAD_ALLOWED_EXTENSIONS[kind].map(extension => `.${extension.toUpperCase()}`).join(", ");
}
