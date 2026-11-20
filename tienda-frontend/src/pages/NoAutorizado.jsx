import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function NoAutorizado() {
  const { usuario } = useAuth()
  const inicio = usuario && usuario.rol === 'VENDEDOR' ? '/admin/productos' : '/'

  return (
    <div className="text-center mt-5">
      <h2>Acceso no autorizado</h2>
      <p>No tienes permisos para ver esta página.</p>
      <Link to={inicio} className="btn btn-primary">Volver al inicio</Link>
    </div>
  )
}

export default NoAutorizado
