import { getStoredApiKey } from '@/components/ApiKeySettings'

/**
 * Wrapper around fetch that automatically includes the user's API key header
 * if one is stored in localStorage
 */
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const userApiKey = getStoredApiKey()

  const headers = new Headers(options.headers)

  // Add user's API key if available
  if (userApiKey) {
    headers.set('x-gemini-api-key', userApiKey)
  }

  return fetch(url, {
    ...options,
    headers
  })
}

/**
 * POST request with JSON body that automatically includes API key header
 */
export async function apiPost<T>(url: string, body: T): Promise<Response> {
  return apiFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
}
