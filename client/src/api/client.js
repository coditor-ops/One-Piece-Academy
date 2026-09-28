const BASE = '/api/v1';

function getToken() {
  return localStorage.getItem('token');
}

async function req(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data?.error?.message || 'Request failed'), { code: data?.error?.code, status: res.status });
  return data;
}

export const api = {
  get:    (path)        => req('GET', path),
  post:   (path, body)  => req('POST', path, body),
  put:    (path, body)  => req('PUT', path, body),
  delete: (path)        => req('DELETE', path),
};
