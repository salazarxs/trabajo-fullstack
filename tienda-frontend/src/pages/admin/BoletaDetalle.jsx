import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { cambiarEstado, obtenerBoleta } from '../../services/boletaService'
import { formatearFecha, formatearPrecio, mensajeError } from '../../utils/formato'

function BoletaDetalle() {
  const { id } = useParams()
  const { usuario } = useAuth()
  const esAdmin = usuario.rol === 'ADMIN'

  const [boleta, setBoleta] = useState(null)
  const [estado, setEstado] = useState('')
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    obtenerBoleta(id)
      .then((datos) => {
        setBoleta(datos)
        setEstado(datos.estado)
      })
      .catch((err) => setError(mensajeError(err)))
  }, [id])

  async function guardarEstado() {
    setError('')
    setMensaje('')
    try {
      const actualizada = await cambiarEstado(id, estado)
      setBoleta(actualizada)
      setMensaje('Estado actualizado')
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  if (error && !boleta) return <div className="alert alert-danger">{error}</div>
  if (!boleta) return <p>Cargando...</p>

  return (
    <div>
      <Link to="/admin/boletas" className="btn btn-link px-0 mb-3">&larr; Volver a órdenes</Link>

      <h1 className="mb-3">Boleta N° {boleta.id}</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {mensaje && <div className="alert alert-success">{mensaje}</div>}

      <div className="card mb-4">
        <div className="card-body">
          <p><strong>Fecha:</strong> {formatearFecha(boleta.fecha)}</p>
          <p><strong>Cliente:</strong> {boleta.usuario ? `${boleta.usuario.nombre} (${boleta.usuario.email})` : '-'}</p>
          <p className="mb-0">
            <strong>Estado:</strong> <span className="badge bg-info text-dark">{boleta.estado}</span>
          </p>

          {/* solo el admin puede cambiar el estado */}
          {esAdmin && (
            <div className="d-flex gap-2 mt-3" style={{ maxWidth: 400 }}>
              <select className="form-select" value={estado} onChange={(e) => setEstado(e.target.value)}>
                <option value="PENDIENTE">PENDIENTE</option>
                <option value="ENVIADA">ENVIADA</option>
                <option value="ENTREGADA">ENTREGADA</option>
              </select>
              <button className="btn btn-primary" onClick={guardarEstado}>Guardar</button>
            </div>
          )}
        </div>
      </div>

      <table className="table bg-white">
        <thead className="table-dark">
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio unitario</th>
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
        <tfoot>
          <tr>
            <th colSpan="3" className="text-end">Total</th>
            <th>{formatearPrecio(boleta.total)}</th>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default BoletaDetalle
