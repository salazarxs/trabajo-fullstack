import api from '../api/axios'

// items: [{ productoId, cantidad }]
export async function comprar(items) {
  const res = await api.post('/v1/boletas', { items })
  return res.data
}

export async function misBoletas() {
  const res = await api.get('/v1/boletas/mis-boletas')
  return res.data
}

export async function listarBoletas() {
  const res = await api.get('/v1/boletas')
  return res.data
}

export async function obtenerBoleta(id) {
  const res = await api.get(`/v1/boletas/${id}`)
  return res.data
}

export async function cambiarEstado(id, estado) {
  const res = await api.put(`/v1/boletas/${id}/estado`, { estado })
  return res.data
}

export async function eliminarBoleta(id) {
  const res = await api.delete(`/v1/boletas/${id}`)
  return res.data
}
