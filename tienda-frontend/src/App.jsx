import { Link, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import RutaProtegida from './components/RutaProtegida'

import Tienda from './pages/Tienda'
import ProductoDetalle from './pages/ProductoDetalle'
import Carrito from './pages/Carrito'
import Login from './pages/Login'
import Registro from './pages/Registro'
import MisCompras from './pages/MisCompras'
import NoAutorizado from './pages/NoAutorizado'

import AdminProductos from './pages/admin/Productos'
import AdminProductoDetalle from './pages/admin/ProductoDetalle'
import AdminProductoForm from './pages/admin/ProductoForm'
import AdminCategorias from './pages/admin/Categorias'
import AdminUsuarios from './pages/admin/Usuarios'
import AdminUsuarioForm from './pages/admin/UsuarioForm'
import AdminBoletas from './pages/admin/Boletas'
import AdminBoletaDetalle from './pages/admin/BoletaDetalle'

// roles que pueden usar la tienda (el vendedor no)
const TIENDA = ['CLIENTE', 'ADMIN']
const ADMIN = ['ADMIN']
const ADMIN_VENDEDOR = ['ADMIN', 'VENDEDOR']

function App() {
  return (
    <>
      <Navbar />
      <main className="container py-4">
        <Routes>
          {/* Tienda: publica para visitantes, clientes y admin */}
          <Route path="/" element={<RutaProtegida roles={TIENDA} permitirAnonimo><Tienda /></RutaProtegida>} />
          <Route path="/producto/:id" element={<RutaProtegida roles={TIENDA} permitirAnonimo><ProductoDetalle /></RutaProtegida>} />
          <Route path="/carrito" element={<RutaProtegida roles={TIENDA} permitirAnonimo><Carrito /></RutaProtegida>} />
          <Route path="/mis-compras" element={<RutaProtegida roles={['CLIENTE']}><MisCompras /></RutaProtegida>} />

          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/no-autorizado" element={<NoAutorizado />} />

          {/* Panel: productos y ordenes los ve el vendedor (solo lectura) */}
          <Route path="/admin/productos" element={<RutaProtegida roles={ADMIN_VENDEDOR}><AdminProductos /></RutaProtegida>} />
          <Route path="/admin/productos/nuevo" element={<RutaProtegida roles={ADMIN}><AdminProductoForm /></RutaProtegida>} />
          <Route path="/admin/productos/:id" element={<RutaProtegida roles={ADMIN_VENDEDOR}><AdminProductoDetalle /></RutaProtegida>} />
          <Route path="/admin/productos/:id/editar" element={<RutaProtegida roles={ADMIN}><AdminProductoForm /></RutaProtegida>} />

          <Route path="/admin/boletas" element={<RutaProtegida roles={ADMIN_VENDEDOR}><AdminBoletas /></RutaProtegida>} />
          <Route path="/admin/boletas/:id" element={<RutaProtegida roles={ADMIN_VENDEDOR}><AdminBoletaDetalle /></RutaProtegida>} />

          {/* Solo administrador */}
          <Route path="/admin/categorias" element={<RutaProtegida roles={ADMIN}><AdminCategorias /></RutaProtegida>} />
          <Route path="/admin/usuarios" element={<RutaProtegida roles={ADMIN}><AdminUsuarios /></RutaProtegida>} />
          <Route path="/admin/usuarios/nuevo" element={<RutaProtegida roles={ADMIN}><AdminUsuarioForm /></RutaProtegida>} />
          <Route path="/admin/usuarios/:id/editar" element={<RutaProtegida roles={ADMIN}><AdminUsuarioForm /></RutaProtegida>} />

          <Route
            path="*"
            element={
              <div className="text-center mt-5">
                <h2>Página no encontrada</h2>
                <Link to="/">Volver al inicio</Link>
              </div>
            }
          />
        </Routes>
      </main>
    </>
  )
}

export default App
