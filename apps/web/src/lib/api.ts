import axios, { AxiosError } from "axios";

export interface ApiErrorPayload {
  success: boolean;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

const baseURL = (import.meta.env.VITE_API_URL as string | undefined) ?? "";

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Unwrap `{ success: true, data: ... }` responses.
api.interceptors.response.use(
  (response) => response.data?.data !== undefined ? response.data.data : response.data,
  (error: AxiosError<ApiErrorPayload>) => {
    const message =
      error.response?.data?.error?.message ??
      (error.response?.status === 401
        ? "You are not authenticated. Please log in."
        : error.response?.status && error.response.status >= 500
          ? "The server encountered an error. Please try again."
          : "Request failed. Check your connection.");

    const err = new Error(message) as Error & { status?: number; code?: string };
    err.status = error.response?.status;
    err.code = error.response?.data?.error?.code;
    return Promise.reject(err);
  },
);

export async function uploadFile(url: string, file: File): Promise<unknown> {
  const form = new FormData();
  form.append("file", file);
  const response = await axios.post(url, form, {
    baseURL,
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data?.data ?? response.data;
}
