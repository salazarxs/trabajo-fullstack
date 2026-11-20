import { useEffect, useState } from 'react'
import {
  actualizarCategoria,
  crearCategoria,
  eliminarCategoria,
  listarCategorias,
} from '../../services/categoriaService'
import { mensajeError } from '../../utils/formato'

function Categorias() {
  const [categorias, setCategorias] = useState([])
  const [nombre, setNombre] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    cargar()
  }, [])

  async function cargar() {
    try {
      const datos = await listarCategorias()
      setCategorias(datos)
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMensaje('')
    try {
      if (editandoId) {
        await actualizarCategoria(editandoId, { nombre })
        setMensaje('Categoría actualizada')
      } else {
        await crearCategoria({ nombre })
        setMensaje('Categoría creada')
      }
      cancelar()
      cargar()
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  function editar(categoria) {
    setEditandoId(categoria.id)
    setNombre(categoria.nombre)
  }

  function cancelar() {
    setEditandoId(null)
    setNombre('')
  }

  async function handleEliminar(categoria) {
    if (!window.confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) return

    setError('')
    setMensaje('')
    try {
      await eliminarCategoria(categoria.id)
      setMensaje('Categoría eliminada')
      cargar()
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  return (
    <div>
      <h1 className="mb-4">Categorías</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {mensaje && <div className="alert alert-success">{mensaje}</div>}

      <form className="card p-3 mb-4" onSubmit={handleSubmit}>
        <label className="form-label">{editandoId ? 'Editar categoría' : 'Nueva categoría'}</label>
        <div className="d-flex gap-2">
          <input className="form-control" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" required />
          <button type="submit" className="btn btn-primary">{editandoId ? 'Guardar' : 'Agregar'}</button>
          {editandoId && (
            <button type="button" className="btn btn-secondary" onClick={cancelar}>Cancelar</button>
          )}
        </div>
      </form>

      <table className="table bg-white align-middle">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categorias.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.nombre}</td>
              <td>
                <button className="btn btn-outline-warning btn-sm me-1" onClick={() => editar(c)}>Editar</button>
                <button className="btn btn-outline-danger btn-sm" onClick={() => handleEliminar(c)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Categorias
