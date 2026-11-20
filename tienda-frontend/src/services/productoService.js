import api from '../api/axios'

export async function listarProductos() {
  const res = await api.get('/v1/productos')
  return res.data
}

// usa la version 2 de la API que permite filtrar
export async function filtrarProductos(categoriaId, buscar) {
  const res = await api.get('/v2/productos', {
    params: {
      categoriaId: categoriaId || undefined,
      buscar: buscar || undefined,
    },
  })
  return res.data
}

export async function obtenerProducto(id) {
  const res = await api.get(`/v1/productos/${id}`)
  return res.data
}

export async function crearProducto(producto) {
  const res = await api.post('/v1/productos', producto)
  return res.data
}

export async function actualizarProducto(id, producto) {
  const res = await api.put(`/v1/productos/${id}`, producto)
  return res.data
}

export async function eliminarProducto(id) {
  const res = await api.delete(`/v1/productos/${id}`)
  return res.data
}
