import { useEffect, useState } from 'react'
import { misBoletas } from '../services/boletaService'
import { formatearFecha, formatearPrecio, mensajeError } from '../utils/formato'

function MisCompras() {
  const [boletas, setBoletas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    misBoletas()
      .then((datos) => setBoletas(datos))
      .catch((err) => setError(mensajeError(err)))
      .finally(() => setCargando(false))
  }, [])

  if (cargando) return <p>Cargando...</p>

  return (
    <div>
      <h1 className="mb-4">Mis compras</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {!error && boletas.length === 0 && <p>Todavía no has hecho compras.</p>}

      {boletas.map((boleta) => (
        <div className="card mb-3" key={boleta.id}>
          <div className="card-header d-flex justify-content-between">
            <span>Boleta N° {boleta.id} - {formatearFecha(boleta.fecha)}</span>
            <span className="badge bg-info text-dark">{boleta.estado}</span>
          </div>
          <div className="card-body">
            <table className="table table-sm mb-2">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {boleta.detalles.map((d) => (
                  <tr key={d.id}>
                    <td>{d.producto.nombre}</td>
                    <td>{d.cantidad}</td>
                    <td>{formatearPrecio(d.precioUnitario)}</td>
                    <td>{formatearPrecio(d.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-end fw-bold mb-0">Total: {formatearPrecio(boleta.total)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default MisCompras
