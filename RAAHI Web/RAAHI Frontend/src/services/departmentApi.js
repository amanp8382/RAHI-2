const base = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '') + '/tourism';
async function request(path, options = {}) {
  const token = sessionStorage.getItem('authToken');
  const response = await fetch(base + path, {
    ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(options.body ? { body: JSON.stringify(options.body) } : {})
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'Department service unavailable. Please retry.');
  }
  if (path === '/reports.csv') return response.blob();
  return response.json();
}
export default {
  tourists: (params, signal) => request('/tourists?' + new URLSearchParams(params), { signal }),
  overview: signal => request('/overview', { signal }),
  list: (kind, params, signal) => request(`/records/${kind}?${new URLSearchParams(params)}`, { signal }),
  save: (kind, data, id) => request(`/records/${kind}${id ? '/' + id : ''}`, { method: id ? 'PUT' : 'POST', body: data }),
  report: () => request('/reports.csv'),
  publicInfo: async (state, signal) => {
    const response = await fetch(base.replace(/\/tourism$/, '/tourism-public') + '?' + new URLSearchParams({ state }), { signal });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Travel information is unavailable');
    return data;
  }
};
