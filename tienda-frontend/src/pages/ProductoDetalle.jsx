import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { obtenerProducto } from '../services/productoService'
import { useCarrito } from '../context/CarritoContext'
import { formatearPrecio, mensajeError } from '../utils/formato'

function ProductoDetalle() {
  const { id } = useParams()
  const { agregar } = useCarrito()
  const [producto, setProducto] = useState(null)
  const [error, setError] = useState('')
  const [agregado, setAgregado] = useState(false)

  useEffect(() => {
    obtenerProducto(id)
      .then((datos) => setProducto(datos))
      .catch((err) => setError(mensajeError(err)))
  }, [id])

  function handleAgregar() {
    agregar(producto)
    setAgregado(true)
  }

  if (error) return <div className="alert alert-danger">{error}</div>
  if (!producto) return <p>Cargando...</p>

  return (
    <div>
      <Link to="/" className="btn btn-link px-0 mb-3">&larr; Volver a la tienda</Link>
      <div className="row g-4">
        <div className="col-md-6">
          <img src={producto.imagen} alt={producto.nombre} className="img-fluid rounded w-100 img-detalle" />
        </div>
        <div className="col-md-6">
          <small className="text-muted">{producto.categoria ? producto.categoria.nombre : ''}</small>
          <h2>{producto.nombre}</h2>
          <p className="fs-3 fw-bold">{formatearPrecio(producto.precio)}</p>
          <p>{producto.descripcion}</p>
          <p>Stock disponible: {producto.stock}</p>

          <button className="btn btn-primary" disabled={producto.stock === 0} onClick={handleAgregar}>
            Agregar al carrito
          </button>

          {agregado && (
            <div className="alert alert-success mt-3">
              Producto agregado. <Link to="/carrito">Ir al carrito</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductoDetalle
