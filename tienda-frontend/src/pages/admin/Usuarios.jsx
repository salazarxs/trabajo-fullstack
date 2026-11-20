import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { eliminarUsuario, listarUsuarios } from '../../services/usuarioService'
import { mensajeError } from '../../utils/formato'

function Usuarios() {
  const { usuario: usuarioActual } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    cargar()
  }, [])

  async function cargar() {
    try {
      const datos = await listarUsuarios()
      setUsuarios(datos)
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  async function handleEliminar(u) {
    if (!window.confirm(`¿Eliminar al usuario ${u.email}?`)) return

    setError('')
    setMensaje('')
    try {
      await eliminarUsuario(u.id)
      setMensaje('Usuario eliminado')
      cargar()
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Usuarios</h1>
        <Link to="/admin/usuarios/nuevo" className="btn btn-success">+ Nuevo usuario</Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {mensaje && <div className="alert alert-success">{mensaje}</div>}

      <div className="table-responsive">
        <table className="table bg-white align-middle">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.nombre}</td>
                <td>{u.email}</td>
                <td><span className="badge bg-secondary">{u.rol}</span></td>
                <td className="text-nowrap">
                  <Link to={`/admin/usuarios/${u.id}/editar`} className="btn btn-outline-warning btn-sm me-1">Editar</Link>
                  {/* no se puede eliminar a si mismo */}
                  <button
                    className="btn btn-outline-danger btn-sm"
                    disabled={u.id === usuarioActual.id}
                    onClick={() => handleEliminar(u)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Usuarios
