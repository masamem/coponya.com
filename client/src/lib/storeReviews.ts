import { backendRequest } from "./backend";

export function reviewRequest<T>(name: string, body: unknown, options: { token?: string; signal?: AbortSignal } = {}) {
  return backendRequest<T>(`/rest/v1/rpc/${name}`, { ...options, method: "POST", body });
}

export const statusLabels: Record<string, string> = {
  published: "منشور",
  pending_review: "بانتظار المراجعة",
  rejected: "مرفوض",
};

export const reportLabels: Record<string, string> = {
  spam: "محتوى مزعج أو ترويجي",
  personal_info: "معلومات شخصية",
  abuse: "إساءة أو تهديد",
  other: "سبب آخر",
};
