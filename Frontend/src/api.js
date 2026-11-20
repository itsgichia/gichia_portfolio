// Same-origin by default (FastAPI serves the built app). Set VITE_API_URL if the
// frontend is hosted separately, e.g. on Vercel.
const BASE = (import.meta.env.VITE_API_URL || '') + '/api'
const TOKEN_KEY = 'portfolio_admin_token'

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}
const setToken = (t) => {
  try {
    t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* storage unavailable */
  }
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) headers.Authorization = `Bearer ${getToken()}`
  const res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined })
  if (res.status === 401 && auth) {
    setToken(null)
    throw new Error('Your session has ended. Sign in again.')
  }
  if (res.status === 204) return null
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const detail = Array.isArray(data.detail) ? data.detail.map((d) => d.msg).join('; ') : data.detail
    throw new Error(detail || `Request failed (${res.status})`)
  }
  return data
}

export const api = {
  profile: () => request('/profile'),
  projects: () => request('/projects'),
  project: (slug) => request(`/projects/${slug}`),
  experience: () => request('/experience'),
  education: () => request('/education'),
  contact: (msg) => request('/contact', { method: 'POST', body: msg }),
  rsv: (params) => request('/rsv/simulate', { method: 'POST', body: params }),
  rsvDefaults: () => request('/rsv/defaults'),
  health: () => request('/health'),
  guestbook: () => request('/guestbook'),
  signGuestbook: (entry) => request('/guestbook', { method: 'POST', body: entry }),
  visit: () => request('/visits', { method: 'POST' }),

  login: async (password) => {
    const { token } = await request('/auth/login', { method: 'POST', body: { password } })
    setToken(token)
  },
  logout: () => setToken(null),
  isSignedIn: () => !!getToken(),
  admin: {
    projects: () => request('/admin/projects', { auth: true }),
    createProject: (p) => request('/admin/projects', { method: 'POST', body: p, auth: true }),
    updateProject: (id, p) => request(`/admin/projects/${id}`, { method: 'PUT', body: p, auth: true }),
    deleteProject: (id) => request(`/admin/projects/${id}`, { method: 'DELETE', auth: true }),
    updateProfile: (p) => request('/admin/profile', { method: 'PUT', body: p, auth: true }),
    messages: () => request('/admin/messages', { auth: true }),
    markRead: (id) => request(`/admin/messages/${id}/read`, { method: 'PATCH', auth: true }),
    deleteGuestbookEntry: (id) => request(`/admin/guestbook/${id}`, { method: 'DELETE', auth: true }),
    clearChat: () => request('/admin/chat', { method: 'DELETE', auth: true }),
  },
}
