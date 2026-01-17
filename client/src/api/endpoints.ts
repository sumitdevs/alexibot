const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function apiClient<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    credentials: "include",
    ...options
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "API Error");
  }

  return res.json() as Promise<T>;
}
