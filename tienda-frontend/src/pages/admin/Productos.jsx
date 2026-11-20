import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { eliminarProducto, listarProductos } from '../../services/productoService'
import { formatearPrecio, mensajeError } from '../../utils/formato'

// lista de productos del panel. El vendedor solo puede ver, el admin puede crear/editar/eliminar
function Productos() {
  const { usuario } = useAuth()
  const esAdmin = usuario.rol === 'ADMIN'

  const [productos, setProductos] = useState([])
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    cargar()
  }, [])

  async function cargar() {
    try {
      const datos = await listarProductos()
      setProductos(datos)
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  async function handleEliminar(producto) {
    if (!window.confirm(`¿Eliminar el producto "${producto.nombre}"?`)) return

    setError('')
    setMensaje('')
    try {
      await eliminarProducto(producto.id)
      setMensaje('Producto eliminado correctamente')
      cargar()
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Productos</h1>
        {esAdmin && (
          <Link to="/admin/productos/nuevo" className="btn btn-success">+ Nuevo producto</Link>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {mensaje && <div className="alert alert-success">{mensaje}</div>}

      <div className="table-responsive">
        <table className="table table-hover bg-white align-middle">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td><img src={p.imagen} alt={p.nombre} className="img-tabla rounded" /></td>
                <td>{p.nombre}</td>
                <td>{p.categoria ? p.categoria.nombre : '-'}</td>
                <td>{formatearPrecio(p.precio)}</td>
                <td>{p.stock}</td>
                <td className="text-nowrap">
                  <Link to={`/admin/productos/${p.id}`} className="btn btn-outline-primary btn-sm me-1">Ver</Link>
                  {esAdmin && (
                    <>
                      <Link to={`/admin/productos/${p.id}/editar`} className="btn btn-outline-warning btn-sm me-1">Editar</Link>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => handleEliminar(p)}>Eliminar</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Productos
