import { useEffect, useState } from 'react'
import ProductoCard from '../components/ProductoCard'
import { filtrarProductos } from '../services/productoService'
import { listarCategorias } from '../services/categoriaService'
import { mensajeError } from '../utils/formato'

function Tienda() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [categoriaId, setCategoriaId] = useState('')
  // buscar = lo que se escribe en el input; busqueda = el texto que se aplica al presionar "Buscar"
  const [buscar, setBuscar] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    listarCategorias()
      .then((datos) => setCategorias(datos))
      .catch(() => setCategorias([]))
  }, [])

  // cada vez que cambia la categoria o la busqueda se vuelven a pedir los productos (API v2)
  useEffect(() => {
    let activo = true // evita mostrar una respuesta vieja si el filtro cambia antes de que llegue
    filtrarProductos(categoriaId, busqueda)
      .then((datos) => activo && setProductos(datos))
      .catch((err) => activo && setError(mensajeError(err)))
      .finally(() => activo && setCargando(false))
    return () => {
      activo = false
    }
  }, [categoriaId, busqueda])

  // el estado de "cargando" se activa desde el evento que cambia el filtro
  function cambiarCategoria(valor) {
    if (valor === categoriaId) return
    setCargando(true)
    setError('')
    setCategoriaId(valor)
  }

  function handleBuscar(e) {
    e.preventDefault()
    const texto = buscar.trim()
    if (texto === busqueda) return
    setCargando(true)
    setError('')
    setBusqueda(texto)
  }

  return (
    <div>
      <h1 className="mb-4">Tienda</h1>

      <form className="row g-2 mb-4" onSubmit={handleBuscar}>
        <div className="col-md-4">
          <select className="form-select" value={categoriaId} onChange={(e) => cambiarCategoria(e.target.value)}>
            <option value="">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <input
            className="form-control"
            placeholder="Buscar producto..."
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
          />
        </div>
        <div className="col-md-2 d-grid">
          <button className="btn btn-dark" type="submit">Buscar</button>
        </div>
      </form>

      {error && <div className="alert alert-danger">{error}</div>}
      {cargando && <p>Cargando productos...</p>}
      {!cargando && !error && productos.length === 0 && <p>No se encontraron productos.</p>}

      <div className="row g-4">
        {productos.map((p) => (
          <div className="col-sm-6 col-md-4 col-lg-3" key={p.id}>
            <ProductoCard producto={p} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default Tienda
