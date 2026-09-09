const API_BASE = '/api';

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
  } catch {
    throw new Error('Unable to connect to the content service. Please try again.');
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || `Request failed (${response.status})`);
  }

  return response.status === 204 ? null : response.json();
}

export const articleApi = {
  list: () => request('/articles'),
  get: (id) => request(`/articles/${id}`),
  create: (article) => request('/articles', { method: 'POST', body: JSON.stringify(article) }),
  update: (id, article) => request(`/articles/${id}`, { method: 'PUT', body: JSON.stringify(article) }),
  patch: (id, updates) => request(`/articles/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
  remove: (id) => request(`/articles/${id}`, { method: 'DELETE' }),
};
