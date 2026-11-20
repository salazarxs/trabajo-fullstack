import api from '../api/axios'

export async function login(email, password) {
  const res = await api.post('/v1/auth/login', { email, password })
  return res.data
}

export async function registro(datos) {
  const res = await api.post('/v1/auth/registro', datos)
  return res.data
}

export async function obtenerUsuarioActual() {
  const res = await api.get('/v1/auth/me')
  return res.data
}
