import axios from 'axios'

export const API_URL = 'http://localhost:8080/api'

// instancia de axios que usan todos los services
const api = axios.create({
  baseURL: API_URL,
})

// antes de cada peticion se agrega el token guardado (si existe)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// rutas donde no tiene sentido intentar renovar el token
const rutasSinRefresh = ['/v1/auth/login', '/v1/auth/registro', '/v1/auth/refresh']

// si el backend responde 401 (token vencido) se intenta renovar el token con el refreshToken
// y se repite la peticion original. Si no se puede, se cierra la sesion.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const peticion = error.config
    const refreshToken = localStorage.getItem('refreshToken')

    if (
      error.response &&
      error.response.status === 401 &&
      refreshToken &&
      !peticion._reintento &&
      !rutasSinRefresh.includes(peticion.url)
    ) {
      peticion._reintento = true
      try {
        const res = await axios.post(API_URL + '/v1/auth/refresh', { refreshToken })
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('refreshToken', res.data.refreshToken)

        peticion.headers.Authorization = `Bearer ${res.data.token}`
        return api(peticion)
      } catch {
        // el refresh token tambien vencio: se cierra la sesion
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api
