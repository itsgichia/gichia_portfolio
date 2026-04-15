const BASE = '/api'
const h = (token) => ({ 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) })
const tok = () => localStorage.getItem('pt')

async function safeFetch(url, options = {}) {
  const res = await fetch(url, options)
  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw new Error('Backend not running — start uvicorn first')
  }
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export const getProfile = () => safeFetch(`${BASE}/profile`)
export const getProjects = () => safeFetch(`${BASE}/projects`)

export const login = async (pw) => {
  const data = await safeFetch(`${BASE}/login`, {
    method: 'POST', headers: h(),
    body: JSON.stringify({ password: pw })
  })
  localStorage.setItem('pt', data.token)
  return data
}

export const logout = () => { localStorage.removeItem('pt') }
export const isAdmin = () => !!tok()
export const createProject = (p) => safeFetch(`${BASE}/projects`, { method: 'POST', headers: h(tok()), body: JSON.stringify(p) })
export const updateProject = (id, p) => safeFetch(`${BASE}/projects/${id}`, { method: 'PUT', headers: h(tok()), body: JSON.stringify(p) })
export const deleteProject = (id) => safeFetch(`${BASE}/projects/${id}`, { method: 'DELETE', headers: h(tok()) })
export const updateProfile = (p) => safeFetch(`${BASE}/profile`, { method: 'PUT', headers: h(tok()), body: JSON.stringify(p) })