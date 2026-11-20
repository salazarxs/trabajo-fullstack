import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// protege una ruta segun el rol del usuario
// roles: lista de roles que pueden entrar (ej: ['ADMIN', 'VENDEDOR'])
// permitirAnonimo: si es true, tambien pueden entrar los que no han iniciado sesion
function RutaProtegida({ roles, permitirAnonimo = false, children }) {
  const { usuario, cargando } = useAuth()
  const location = useLocation()

  // mientras se revisa la sesion no se muestra nada
  if (cargando) {
    return <p className="text-center mt-5">Cargando...</p>
  }

  if (!usuario) {
    if (permitirAnonimo) return children
    return <Navigate to="/login" state={{ desde: location.pathname }} />
  }

  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to="/no-autorizado" />
  }

  return children
}

export default RutaProtegida
