// ---------------------------------------------------------------------------
// API client — typed fetch helpers for the app's own REST routes. All paths
// are RELATIVE (gateway rule); JSON everywhere; errors normalized to
// ApiError so views can render actionable messages.
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function parse<T>(res: Response): Promise<T> {
  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }
  if (!res.ok) {
    const message =
      body && typeof body === "object" && "error" in body && typeof (body as { error: unknown }).error === "string"
        ? (body as { error: string }).error
        : `Request failed (${res.status})`;
    throw new ApiError(res.status, message);
  }
  return body as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  return parse<T>(await fetch(path, { credentials: "same-origin" }));
}

export async function apiSend<T>(
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
): Promise<T> {
  return parse<T>(
    await fetch(path, {
      method,
      credentials: "same-origin",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  );
}

/** Upload a file (multipart) to the Files API. */
export async function apiUpload<T>(path: string, file: File, folderId?: string | null): Promise<T> {
  const form = new FormData();
  form.append("file", file);
  if (folderId) form.append("folderId", folderId);
  return parse<T>(await fetch(path, { method: "POST", credentials: "same-origin", body: form }));
}
