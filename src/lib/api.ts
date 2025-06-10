// src/lib/api.ts
// Utilidades centralizadas para llamadas a la API del backend y logs de depuración

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

export async function apiPost(endpoint: string, data: any) {
  console.log(`[API] POST ${BASE_URL}${endpoint}`, data);
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const body = await res.clone().json().catch(() => res.clone().text());
    console.log(`[API] Respuesta POST ${endpoint}:`, res.status, body);
    return { ok: res.ok, status: res.status, body };
  } catch (err) {
    console.error(`[API] Error POST ${endpoint}:`, err);
    return { ok: false, status: 0, body: null, error: err };
  }
}

export async function apiGet(endpoint: string) {
  console.log(`[API] GET ${BASE_URL}${endpoint}`);
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`);
    const body = await res.clone().json().catch(() => res.clone().text());
    console.log(`[API] Respuesta GET ${endpoint}:`, res.status, body);
    return { ok: res.ok, status: res.status, body };
  } catch (err) {
    console.error(`[API] Error GET ${endpoint}:`, err);
    return { ok: false, status: 0, body: null, error: err };
  }
}

// Endpoints específicos
export function loginUser(data: { email: string; password: string }) {
  return apiPost('/login', data);
}

export function registerUser(data: { name: string; email: string; password: string }) {
  return apiPost('/register', data);
}

export function saveInteraction(data: any) {
  return apiPost('/interaction', data);
}

export function getUserInteractions(email: string) {
  return apiGet(`/user/${encodeURIComponent(email)}/interactions`);
}

export function getYoutubeShorts(data: { channel_handle: string; limit: number }) {
  return apiPost('/youtube/shorts', data);
}
