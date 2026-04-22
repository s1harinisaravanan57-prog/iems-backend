// js/api.js — central API layer, all fetch calls live here
// Auto-detect API base URL (works for both local dev and cloud deployment)
const API_HOST = typeof window !== 'undefined' ? window.location.origin : '';
const BASE = `${API_HOST}/api/v1`;

function getToken() { return localStorage.getItem('iems_token'); }

async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  try {
    const res = await fetch(`${BASE}${path}`, {
      method, headers,
      body: body ? JSON.stringify(body) : null,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
    return data;
  } catch (err) {
    console.error(`[API] ${method} ${path}:`, err.message);
    throw err;
  }
}

export const api = {
  // Auth / Users
  usersList: () => request('GET', '/users'),
  workerCreate: (body) => request('POST', '/users', body),
  workerUpdate: (id, body) => request('PUT', `/users/${id}`, body),
  workerDelete: (id) => request('DELETE', `/users/${id}`),
  login:  (email, password) => request('POST', '/auth/login', { email, password }),
  me:     ()                => request('GET',  '/auth/me'),

  // Equipment
  equipmentList:   (params = {}) => { const q = new URLSearchParams(params).toString(); return request('GET', `/equipment${q ? '?'+q : ''}`); },
  equipmentGet:    (id)          => request('GET',    `/equipment/${id}`),
  equipmentCreate: (body)        => request('POST',   '/equipment', body),
  equipmentUpdate: (id, body)    => request('PUT',    `/equipment/${id}`, body),
  equipmentDelete: (id)          => request('DELETE', `/equipment/${id}`),

  // Maintenance
  maintenanceList:   (params={}) => { const q = new URLSearchParams(params).toString(); return request('GET', `/maintenance${q?'?'+q:''}`); },
  maintenanceCreate: (body)      => request('POST', '/maintenance', body),
  maintenanceUpdate: (id, body)  => request('PUT',  `/maintenance/${id}`, body),

  // Health
  health: () => request('GET', '/health'),
};
