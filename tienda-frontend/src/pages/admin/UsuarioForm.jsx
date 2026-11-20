import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { actualizarUsuario, crearUsuario, obtenerUsuario } from '../../services/usuarioService'
import { mensajeError } from '../../utils/formato'

function UsuarioForm() {
  const { id } = useParams()
  const esEdicion = id !== undefined
  const navigate = useNavigate()

  const [error, setError] = useState('')
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'CLIENTE',
  })

  useEffect(() => {
    if (esEdicion) {
      obtenerUsuario(id)
        .then((u) => setForm({ nombre: u.nombre, email: u.email, password: '', rol: u.rol }))
        .catch((err) => setError(mensajeError(err)))
    }
  }, [id, esEdicion])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      if (esEdicion) {
        await actualizarUsuario(id, form)
      } else {
        await crearUsuario(form)
      }
      navigate('/admin/usuarios')
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <h1 className="mb-4">{esEdicion ? 'Editar usuario' : 'Nuevo usuario'}</h1>

        {error && <div className="alert alert-danger">{error}</div>}

        <form className="card p-4" onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Nombre</label>
            <input name="nombre" className="form-control" value={form.nombre} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input name="email" type="email" className="form-control" value={form.email} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input
              name="password"
              type="password"
              className="form-control"
              value={form.password}
              onChange={handleChange}
              required={!esEdicion}
              placeholder={esEdicion ? 'Dejar vacío para no cambiarla' : ''}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Rol</label>
            <select name="rol" className="form-select" value={form.rol} onChange={handleChange}>
              <option value="CLIENTE">CLIENTE</option>
              <option value="VENDEDOR">VENDEDOR</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary">Guardar</button>
            <Link to="/admin/usuarios" className="btn btn-secondary">Cancelar</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UsuarioForm
