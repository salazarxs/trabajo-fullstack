import { createContext, useContext, useEffect, useState } from 'react'
import * as authService from '../services/authService'

const AuthContext = createContext()

// guarda quien esta logueado y lo comparte con toda la aplicacion
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  // si hay token guardado, hay que esperar a validarlo con el backend
  const [cargando, setCargando] = useState(localStorage.getItem('token') !== null)

  // al cargar (o recargar) la pagina se revisa si hay un token guardado.
  // si lo hay, se le pregunta al backend quien es el usuario (/auth/me),
  // asi la sesion se mantiene aunque se recargue la pagina
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    authService
      .obtenerUsuarioActual()
      .then((datos) => setUsuario(datos))
      .catch(() => borrarTokens())
      .finally(() => setCargando(false))
  }, [])

  function guardarSesion(datos) {
    localStorage.setItem('token', datos.token)
    localStorage.setItem('refreshToken', datos.refreshToken)
    setUsuario({ id: datos.id, nombre: datos.nombre, email: datos.email, rol: datos.rol })
  }

  function borrarTokens() {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
  }

  async function login(email, password) {
    const datos = await authService.login(email, password)
    guardarSesion(datos)
    return datos
  }

  async function registro(nombre, email, password) {
    const datos = await authService.registro({ nombre, email, password })
    guardarSesion(datos)
    return datos
  }

  function logout() {
    borrarTokens()
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, registro, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
