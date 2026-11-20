import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { mensajeError } from '../utils/formato'

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const datos = await login(email, password)

      // cada rol va a una pagina distinta
      if (datos.rol === 'VENDEDOR') {
        navigate('/admin/productos')
      } else if (datos.rol === 'ADMIN') {
        navigate('/admin/productos')
      } else if (location.state && location.state.desde) {
        navigate(location.state.desde)
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-5">
        <div className="card p-4">
          <h2 className="mb-3">Iniciar sesión</h2>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Contraseña</label>
              <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary w-100">Ingresar</button>
          </form>

          <p className="mt-3 mb-0 text-center">
            ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
