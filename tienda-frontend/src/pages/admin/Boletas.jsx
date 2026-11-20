import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { eliminarBoleta, listarBoletas } from '../../services/boletaService'
import { formatearFecha, formatearPrecio, mensajeError } from '../../utils/formato'

// lista de ordenes (boletas). El vendedor solo ve, el admin ademas puede eliminar
function Boletas() {
  const { usuario } = useAuth()
  const esAdmin = usuario.rol === 'ADMIN'

  const [boletas, setBoletas] = useState([])
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    cargar()
  }, [])

  async function cargar() {
    try {
      const datos = await listarBoletas()
      setBoletas(datos)
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  async function handleEliminar(boleta) {
    if (!window.confirm(`¿Eliminar la boleta N° ${boleta.id}?`)) return

    setError('')
    setMensaje('')
    try {
      await eliminarBoleta(boleta.id)
      setMensaje('Boleta eliminada')
      cargar()
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  return (
    <div>
      <h1 className="mb-4">Órdenes</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {mensaje && <div className="alert alert-success">{mensaje}</div>}
      {!error && boletas.length === 0 && <p>No hay órdenes registradas.</p>}

      {boletas.length > 0 && (
        <div className="table-responsive">
          <table className="table table-hover bg-white align-middle">
            <thead className="table-dark">
              <tr>
                <th>N°</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {boletas.map((b) => (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td>{formatearFecha(b.fecha)}</td>
                  <td>{b.usuario ? b.usuario.email : '-'}</td>
                  <td>{formatearPrecio(b.total)}</td>
                  <td><span className="badge bg-info text-dark">{b.estado}</span></td>
                  <td className="text-nowrap">
                    <Link to={`/admin/boletas/${b.id}`} className="btn btn-outline-primary btn-sm me-1">Ver detalle</Link>
                    {esAdmin && (
                      <button className="btn btn-outline-danger btn-sm" onClick={() => handleEliminar(b)}>Eliminar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Boletas
