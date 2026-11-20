import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCarrito } from '../context/CarritoContext'

// el menu cambia segun el rol del usuario logueado
function Navbar() {
  const { usuario, logout } = useAuth()
  const { cantidadTotal } = useCarrito()
  const navigate = useNavigate()

  const rol = usuario ? usuario.rol : null
  const esAdmin = rol === 'ADMIN'
  const esVendedor = rol === 'VENDEDOR'
  const esCliente = rol === 'CLIENTE'

  // el vendedor no ve la tienda, solo productos y ordenes
  const puedeVerTienda = !usuario || esCliente || esAdmin

  function cerrarSesion() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-expand navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to={esVendedor ? '/admin/productos' : '/'}>
          TechStore
        </Link>

        <ul className="navbar-nav me-auto flex-wrap">
          {puedeVerTienda && (
            <>
              <li className="nav-item">
                <NavLink className="nav-link" to="/" end>Tienda</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/carrito">
                  Carrito <span className="badge bg-primary">{cantidadTotal}</span>
                </NavLink>
              </li>
            </>
          )}

          {esCliente && (
            <li className="nav-item">
              <NavLink className="nav-link" to="/mis-compras">Mis compras</NavLink>
            </li>
          )}

          {(esAdmin || esVendedor) && (
            <>
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin/productos">Productos</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin/boletas">Órdenes</NavLink>
              </li>
            </>
          )}

          {esAdmin && (
            <>
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin/categorias">Categorías</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin/usuarios">Usuarios</NavLink>
              </li>
            </>
          )}
        </ul>

        <div className="d-flex align-items-center gap-2">
          {usuario ? (
            <>
              <span className="text-light small">
                {usuario.nombre} <span className="badge bg-secondary">{usuario.rol}</span>
              </span>
              <button className="btn btn-outline-light btn-sm" onClick={cerrarSesion}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link className="btn btn-outline-light btn-sm" to="/login">Iniciar sesión</Link>
              <Link className="btn btn-primary btn-sm" to="/registro">Registrarse</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
