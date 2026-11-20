# TechStore - Frontend

Frontend de la tienda online hecho con **React + Vite** (JavaScript), **React Router**, **Axios** y **Bootstrap**.
Proyecto para DSY1104 Desarrollo Fullstack II - Evaluación Parcial 3.

## Cómo ejecutar
Primero hay que tener el backend corriendo en `http://localhost:8080` (ver el repo `tienda-backend`).

```bash
npm install
npm run dev
```
Abrir http://localhost:5173

## Usuarios de prueba
| Rol | Email | Contraseña |
|---|---|---|
| ADMIN | admin@tienda.cl | admin123 |
| VENDEDOR | vendedor@tienda.cl | vendedor123 |
| CLIENTE | cliente@tienda.cl | cliente123 |

## Estructura
```
src/
├── api/axios.js          instancia de axios + interceptores (token y renovación)
├── services/             funciones que llaman a cada endpoint de la API
├── context/
│   ├── AuthContext.jsx   sesión del usuario (login, logout, registro)
│   └── CarritoContext.jsx carrito guardado en localStorage
├── components/
│   ├── Navbar.jsx        menú que cambia según el rol
│   ├── RutaProtegida.jsx bloquea rutas según el rol
│   └── ProductoCard.jsx
├── pages/                tienda, detalle, carrito, login, registro, mis compras
└── pages/admin/          panel: productos, categorías, usuarios, órdenes
```

## Integración con el backend
- Todas las llamadas pasan por `src/api/axios.js` (baseURL `http://localhost:8080/api`).
- Un interceptor de **request** agrega `Authorization: Bearer <token>` a cada petición.
- Un interceptor de **response**: si el backend responde **401** (token vencido) llama a
  `/v1/auth/refresh` con el refreshToken, guarda los tokens nuevos y repite la petición.
  Si el refresh también falla, se cierra la sesión y se envía al login.
- Los errores del backend (`{"mensaje": "..."}`) se muestran en alertas de Bootstrap.

## Sesión (persistencia al recargar)
- Al hacer login se guardan `token` y `refreshToken` en `localStorage`.
- Al recargar la página, `AuthContext` ve que hay un token y llama a `GET /v1/auth/me`
  para saber quién es el usuario. Así la sesión se mantiene, y el rol se obtiene desde el
  backend (no se confía en un rol guardado en el navegador).
- Mientras se valida la sesión, `RutaProtegida` muestra "Cargando..." para no expulsar al usuario.
- Al cerrar sesión se borran los tokens.

## Restricciones por rol
| Pantalla | Visitante | CLIENTE | VENDEDOR | ADMIN |
|---|---|---|---|---|
| Tienda, detalle, carrito | ✔ | ✔ | ✘ | ✔ |
| Comprar | (debe iniciar sesión) | ✔ | ✘ | ✔ |
| Mis compras | ✘ | ✔ | ✘ | ✘ |
| Productos (lista y detalle) | ✘ | ✘ | ✔ solo ver | ✔ |
| Crear / editar / eliminar productos | ✘ | ✘ | ✘ | ✔ |
| Órdenes (lista y detalle) | ✘ | ✘ | ✔ solo ver | ✔ |
| Cambiar estado / eliminar órdenes | ✘ | ✘ | ✘ | ✔ |
| Categorías, Usuarios | ✘ | ✘ | ✘ | ✔ |

Se controla en tres niveles:
1. **Navbar**: solo muestra los links que el rol puede usar.
2. **RutaProtegida** (en `App.jsx`): si alguien escribe la URL a mano sin permiso, lo manda a `/no-autorizado` (o a `/login` si no inició sesión).
3. **Botones**: en las páginas compartidas (productos, órdenes) los botones de crear/editar/eliminar solo aparecen para ADMIN.

Además, el backend vuelve a validar el rol en cada petición, por lo que aunque se salten el frontend la API responde 403.
