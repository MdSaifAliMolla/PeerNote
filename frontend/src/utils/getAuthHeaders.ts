import { getSessionCookie } from "../contexts/session";
export const getAuthHeaders = () => {
  const session = getSessionCookie();
  const token = session?.token;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }

  return headers;
};