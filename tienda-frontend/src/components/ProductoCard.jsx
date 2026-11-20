import { Link } from 'react-router-dom'
import { useCarrito } from '../context/CarritoContext'
import { formatearPrecio } from '../utils/formato'

function ProductoCard({ producto }) {
  const { agregar } = useCarrito()
  const sinStock = producto.stock === 0

  return (
    <div className="card h-100">
      <img src={producto.imagen} className="card-img-top" alt={producto.nombre} />
      <div className="card-body d-flex flex-column">
        <small className="text-muted">{producto.categoria ? producto.categoria.nombre : ''}</small>
        <h5 className="card-title">{producto.nombre}</h5>
        <p className="fs-5 fw-bold mb-1">{formatearPrecio(producto.precio)}</p>
        <p className="small mb-3">
          {sinStock ? <span className="text-danger">Sin stock</span> : `Stock: ${producto.stock}`}
        </p>
        <div className="mt-auto d-flex gap-2">
          <Link to={`/producto/${producto.id}`} className="btn btn-outline-secondary btn-sm">
            Ver detalle
          </Link>
          <button className="btn btn-primary btn-sm" disabled={sinStock} onClick={() => agregar(producto)}>
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductoCard
