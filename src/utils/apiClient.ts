const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
const API_KEY = process.env.EXPO_PUBLIC_API_KEY || '';

const headers: Record<string, string> = {
  'Content-Type': 'application/json',
  ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
};

export async function apiFetch<T>(path: string): Promise<T> {
  const url = path ? `${API_URL}/${path}` : API_URL;
  console.log('[apiFetch] URL:', url);
  console.log('[apiFetch] API_URL:', API_URL);
  try {
    const response = await fetch(url, { headers });
    console.log('[apiFetch] status:', response.status);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return response.json();
  } catch (err) {
    console.error('[apiFetch] FAILED:', url, err);
    throw err;
  }
}

export function getApiUrl(): string {
  return API_URL;
}
