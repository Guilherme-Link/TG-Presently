export function getApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  // Em desenvolvimento, o proxy do Vite encaminha as chamadas ao backend.
  // Em produção, os rewrites do host (por exemplo, Vercel) fazem o mesmo.
  // Usar caminhos relativos também mantém cookies de sessão no domínio do front.
  return "";
}

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export function buildApiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${getApiBaseUrl()}${normalizedPath}`;
}

export async function apiFetch(path, options = {}) {
  const { headers: customHeaders = {}, ...fetchOptions } = options;
  const method = (fetchOptions.method || "GET").toUpperCase();
  const csrfCookie = typeof document === "undefined"
    ? ""
    : document.cookie
        .split(";")
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith("XSRF-TOKEN="))
        ?.slice("XSRF-TOKEN=".length);

  const response = await fetch(buildApiUrl(path), {
    credentials: "include",
    ...fetchOptions,
    headers: {
      ...(fetchOptions.body ? { "Content-Type": "application/json" } : {}),
      ...(csrfCookie && !["GET", "HEAD", "OPTIONS"].includes(method)
        ? { "X-XSRF-TOKEN": decodeURIComponent(csrfCookie) }
        : {}),
      ...customHeaders,
    },
  });

  const contentType = response.headers.get("content-type") || "";
  let payload = null;

  if (response.status !== 204) {
    if (contentType.includes("application/json")) {
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }
    } else {
      try {
        payload = await response.text();
      } catch {
        payload = null;
      }
    }
  }

  if (!response.ok) {
    const message =
      (payload && typeof payload === "object" && (payload.message || payload.error)) ||
      (typeof payload === "string" && payload.trim()) ||
      `Requisição falhou com status ${response.status}`;

    throw new ApiError(message, response.status, payload);
  }

  return payload;
}

export function isFetchNetworkError(error) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    error.name === "TypeError" ||
    message.includes("failed to fetch") ||
    message.includes("networkerror")
  );
}
