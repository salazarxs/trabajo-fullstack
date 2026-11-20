import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCarrito } from '../context/CarritoContext'
import { comprar } from '../services/boletaService'
import { formatearPrecio, mensajeError } from '../utils/formato'

function Carrito() {
  const { usuario } = useAuth()
  const { items, quitar, cambiarCantidad, vaciar, total } = useCarrito()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [boletaCreada, setBoletaCreada] = useState(null)
  const [enviando, setEnviando] = useState(false)

  async function handleComprar() {
    // para comprar hay que iniciar sesion
    if (!usuario) {
      navigate('/login', { state: { desde: '/carrito' } })
      return
    }

    setError('')
    setEnviando(true)
    try {
      const lista = items.map((item) => ({ productoId: item.producto.id, cantidad: item.cantidad }))
      const boleta = await comprar(lista)
      setBoletaCreada(boleta)
      vaciar()
    } catch (err) {
      setError(mensajeError(err))
    }
    setEnviando(false)
  }

  if (boletaCreada) {
    return (
      <div className="alert alert-success">
        <h4>¡Compra realizada!</h4>
        <p>
          Tu boleta N° {boletaCreada.id} por {formatearPrecio(boletaCreada.total)} fue creada correctamente.
        </p>
        {usuario.rol === 'CLIENTE' && <Link to="/mis-compras" className="btn btn-success me-2">Ver mis compras</Link>}
        <Link to="/" className="btn btn-outline-success">Seguir comprando</Link>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center mt-5">
        <h3>Tu carrito está vacío</h3>
        <Link to="/" className="btn btn-primary mt-2">Ir a la tienda</Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-4">Carrito</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="table-responsive">
        <table className="table bg-white align-middle">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Precio</th>
              <th style={{ width: 120 }}>Cantidad</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.producto.id}>
                <td>{item.producto.nombre}</td>
                <td>{formatearPrecio(item.producto.precio)}</td>
                <td>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    min="1"
                    max={item.producto.stock}
                    value={item.cantidad}
                    onChange={(e) => cambiarCantidad(item.producto.id, Number(e.target.value))}
                  />
                </td>
                <td>{formatearPrecio(item.producto.precio * item.cantidad)}</td>
                <td>
                  <button className="btn btn-outline-danger btn-sm" onClick={() => quitar(item.producto.id)}>
                    Quitar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between align-items-center">
        <button className="btn btn-outline-secondary" onClick={vaciar}>Vaciar carrito</button>
        <div className="text-end">
          <p className="fs-4 mb-2">Total: <strong>{formatearPrecio(total)}</strong></p>
          <button className="btn btn-success" onClick={handleComprar} disabled={enviando}>
            {enviando ? 'Procesando...' : usuario ? 'Comprar' : 'Inicia sesión para comprar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Carrito
