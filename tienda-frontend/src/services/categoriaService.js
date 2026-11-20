import api from '../api/axios'

export async function listarCategorias() {
  const res = await api.get('/v1/categorias')
  return res.data
}

export async function crearCategoria(categoria) {
  const res = await api.post('/v1/categorias', categoria)
  return res.data
}

export async function actualizarCategoria(id, categoria) {
  const res = await api.put(`/v1/categorias/${id}`, categoria)
  return res.data
}

export async function eliminarCategoria(id) {
  const res = await api.delete(`/v1/categorias/${id}`)
  return res.data
}
