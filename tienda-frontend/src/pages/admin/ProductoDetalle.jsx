import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { obtenerProducto } from '../../services/productoService'
import { formatearPrecio, mensajeError } from '../../utils/formato'

function ProductoDetalle() {
  const { id } = useParams()
  const { usuario } = useAuth()
  const [producto, setProducto] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    obtenerProducto(id)
      .then((datos) => setProducto(datos))
      .catch((err) => setError(mensajeError(err)))
  }, [id])

  if (error) return <div className="alert alert-danger">{error}</div>
  if (!producto) return <p>Cargando...</p>

  return (
    <div>
      <Link to="/admin/productos" className="btn btn-link px-0 mb-3">&larr; Volver a productos</Link>

      <div className="card">
        <div className="row g-0">
          <div className="col-md-4">
            <img src={producto.imagen} alt={producto.nombre} className="img-fluid rounded-start w-100 img-detalle" />
          </div>
          <div className="col-md-8">
            <div className="card-body">
              <h3 className="card-title">{producto.nombre}</h3>
              <table className="table">
                <tbody>
                  <tr><th>ID</th><td>{producto.id}</td></tr>
                  <tr><th>Categoría</th><td>{producto.categoria ? producto.categoria.nombre : '-'}</td></tr>
                  <tr><th>Precio</th><td>{formatearPrecio(producto.precio)}</td></tr>
                  <tr><th>Stock</th><td>{producto.stock}</td></tr>
                  <tr><th>Descripción</th><td>{producto.descripcion}</td></tr>
                </tbody>
              </table>
              {usuario.rol === 'ADMIN' && (
                <Link to={`/admin/productos/${producto.id}/editar`} className="btn btn-warning">Editar</Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductoDetalle
