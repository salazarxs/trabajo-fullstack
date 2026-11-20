import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { actualizarProducto, crearProducto, obtenerProducto } from '../../services/productoService'
import { listarCategorias } from '../../services/categoriaService'
import { mensajeError } from '../../utils/formato'

// el mismo formulario sirve para crear y para editar
function ProductoForm() {
  const { id } = useParams()
  const esEdicion = id !== undefined
  const navigate = useNavigate()

  const [categorias, setCategorias] = useState([])
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    imagen: '',
    categoriaId: '',
  })

  useEffect(() => {
    listarCategorias().then((datos) => setCategorias(datos))

    if (esEdicion) {
      obtenerProducto(id)
        .then((p) =>
          setForm({
            nombre: p.nombre,
            descripcion: p.descripcion || '',
            precio: p.precio,
            stock: p.stock,
            imagen: p.imagen || '',
            categoriaId: p.categoria ? p.categoria.id : '',
          })
        )
        .catch((err) => setError(mensajeError(err)))
    }
  }, [id, esEdicion])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const producto = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio: Number(form.precio),
      stock: Number(form.stock),
      imagen: form.imagen,
      categoria: { id: Number(form.categoriaId) },
    }

    try {
      if (esEdicion) {
        await actualizarProducto(id, producto)
      } else {
        await crearProducto(producto)
      }
      navigate('/admin/productos')
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <h1 className="mb-4">{esEdicion ? 'Editar producto' : 'Nuevo producto'}</h1>

        {error && <div className="alert alert-danger">{error}</div>}

        <form className="card p-4" onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Nombre</label>
            <input name="nombre" className="form-control" value={form.nombre} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Descripción</label>
            <textarea name="descripcion" className="form-control" rows="3" value={form.descripcion} onChange={handleChange} />
          </div>
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Precio</label>
              <input name="precio" type="number" min="1" className="form-control" value={form.precio} onChange={handleChange} required />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Stock</label>
              <input name="stock" type="number" min="0" className="form-control" value={form.stock} onChange={handleChange} required />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Categoría</label>
              <select name="categoriaId" className="form-select" value={form.categoriaId} onChange={handleChange} required>
                <option value="">Seleccione...</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">URL de la imagen</label>
            <input name="imagen" className="form-control" value={form.imagen} onChange={handleChange} placeholder="https://..." />
          </div>

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary">Guardar</button>
            <Link to="/admin/productos" className="btn btn-secondary">Cancelar</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductoForm
