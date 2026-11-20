import api from '../api/axios'

export async function listarUsuarios() {
  const res = await api.get('/v1/usuarios')
  return res.data
}

export async function obtenerUsuario(id) {
  const res = await api.get(`/v1/usuarios/${id}`)
  return res.data
}

export async function crearUsuario(usuario) {
  const res = await api.post('/v1/usuarios', usuario)
  return res.data
}

export async function actualizarUsuario(id, usuario) {
  const res = await api.put(`/v1/usuarios/${id}`, usuario)
  return res.data
}

export async function eliminarUsuario(id) {
  const res = await api.delete(`/v1/usuarios/${id}`)
  return res.data
}
