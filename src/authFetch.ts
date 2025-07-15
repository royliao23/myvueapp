// authFetch.ts
import { getValidAccessToken } from './authService';

export async function authFetch(input: RequestInfo, init: RequestInit = {}) {
  const token = await getValidAccessToken();
  if (!token) throw new Error("No valid auth token");

  const headers = new Headers(init.headers || {});
  headers.set("Authorization", `Bearer ${token}`);

  return fetch(input, { ...init, headers });
}
