const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function getToken() {
  return localStorage.getItem('token') || localStorage.getItem('accessToken') || '';
}

async function request(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
  });
  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(message || `Request failed (${response.status})`);
  }
  return response.status === 204 ? null : response.json();
}

// These endpoints are proposed integration points. Match them to your existing backend routes.
export const getMyProfile = () => request('/api/profile/me');
export const getMyHistory = (from, to) => {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  return request(`/api/profile/history${params.size ? `?${params}` : ''}`);
};
export const getDashboardData = () => request('/api/dashboard');
