# TechStore - Backend (API REST)

API REST de la tienda online, hecha con **Spring Boot**, **Spring Security + JWT**, **JPA/Hibernate** y **MySQL**.
Proyecto para DSY1104 Desarrollo Fullstack II - Evaluación Parcial 3.

## Requisitos
- Java 21 o superior
- Docker (para levantar MySQL)
- No hace falta instalar Maven, se usa el wrapper `./mvnw`

## Cómo ejecutar
```bash
# 1. levantar la base de datos MySQL (puerto 3307)
docker compose up -d

# 2. levantar la API (puerto 8080)
./mvnw spring-boot:run

# correr los tests
./mvnw test
```
En Windows usar `mvnw.cmd` en vez de `./mvnw`.

### Variables de entorno (opcionales)
Los valores por defecto sirven para desarrollo local. En un servidor real se deben definir:

| Variable | Por defecto |
|---|---|
| `JWT_SECRET` | clave de desarrollo (mínimo 32 caracteres) |
| `DB_URL` | `jdbc:mysql://localhost:3307/tienda` |
| `DB_USER` / `DB_PASSWORD` | `tienda` / `tienda123` |

La primera vez se crean las tablas solas (`ddl-auto=update`) y se cargan datos de prueba (`DataLoader`).

- Swagger UI: http://localhost:8080/swagger-ui.html
- OpenAPI JSON: http://localhost:8080/v3/api-docs

Para probar endpoints privados en Swagger: hacer login en `/api/v1/auth/login`, copiar el `token` y pegarlo en el botón **Authorize**.

## Usuarios de prueba
| Rol | Email | Contraseña |
|---|---|---|
| ADMIN | admin@tienda.cl | admin123 |
| VENDEDOR | vendedor@tienda.cl | vendedor123 |
| CLIENTE | cliente@tienda.cl | cliente123 |

## Modelo de datos
```
USUARIO 1 ── * BOLETA 1 ── * DETALLE_BOLETA * ── 1 PRODUCTO * ── 1 CATEGORIA
```
- **usuario**: id, nombre, email (único), password (BCrypt), rol (ADMIN / VENDEDOR / CLIENTE)
- **categoria**: id, nombre
- **producto**: id, nombre, descripcion, precio, stock, imagen, categoria_id
- **boleta**: id, fecha, total, estado (PENDIENTE / ENVIADA / ENTREGADA), usuario_id
- **detalle_boleta**: id, boleta_id, producto_id, cantidad, precio_unitario, subtotal

## Estructura del proyecto
```
src/main/java/cl/duoc/tienda
├── config/        OpenApiConfig (Swagger), DataLoader (datos de prueba)
├── controller/    Controladores REST (v1 y v2)
├── dto/           Objetos para recibir/enviar datos (login, registro, compra...)
├── exception/     Excepciones propias y manejo global de errores
├── model/         Entidades JPA
├── repository/    Repositorios JPA
├── security/      JWT (JwtUtil, JwtFilter) y configuración de Spring Security
└── service/       Lógica de negocio
```

## Seguridad (JWT)
1. El usuario hace login en `/api/v1/auth/login` y recibe un **token** (dura 1 hora) y un **refreshToken** (dura 7 días).
2. En cada petición el frontend envía `Authorization: Bearer <token>`.
3. `JwtFilter` valida la firma y la expiración del token, busca al usuario y le asigna su rol (`ROLE_ADMIN`, etc).
4. `SecurityConfig` define qué rol puede usar cada ruta. Sin token → **401**, sin permisos → **403**.
5. Cuando el token vence, el frontend llama a `/api/v1/auth/refresh` con el refreshToken y obtiene tokens nuevos.
   El refreshToken no sirve como token de acceso (se valida el claim `tipo`).

## Lógica de negocio principal (compra)
`BoletaService.crearBoleta`:
1. Valida que el carrito no esté vacío.
2. Por cada producto revisa que exista y que haya stock suficiente.
3. Calcula subtotal (precio × cantidad) y el total de la boleta.
4. Descuenta el stock y guarda la boleta con sus detalles en una transacción.

Otras reglas: email único, el registro público siempre crea un CLIENTE, no se puede eliminar una categoría con productos, un producto que está en una boleta ni un usuario con compras.

## Documentación de endpoints

Base URL: `http://localhost:8080`

| Método | Ruta | Descripción | Datos de entrada | Respuestas | Pública/Privada | Requiere auth | Roles | Observaciones |
|---|---|---|---|---|---|---|---|---|
| POST | /api/v1/auth/login | Iniciar sesión | `{email, password}` | 200, 400, 401 | Pública | No | - | Devuelve token (1 h) y refreshToken (7 días) |
| POST | /api/v1/auth/registro | Registrar cliente | `{nombre, email, password}` | 201, 400 | Pública | No | - | Siempre crea rol CLIENTE y deja la sesión iniciada |
| POST | /api/v1/auth/refresh | Renovar token | `{refreshToken}` | 200, 401 | Pública | No | - | Un token de acceso no sirve como refreshToken |
| GET | /api/v1/auth/me | Usuario logueado | - | 200, 401 | Privada | Sí | Todos | Usado por el frontend para restaurar la sesión al recargar |
| GET | /api/v1/categorias | Listar categorías | - | 200 | Pública | No | - | - |
| GET | /api/v1/categorias/{id} | Obtener categoría | - | 200, 404 | Pública | No | - | - |
| POST | /api/v1/categorias | Crear categoría | `{nombre}` | 201, 400, 401, 403 | Privada | Sí | ADMIN | - |
| PUT | /api/v1/categorias/{id} | Actualizar categoría | `{nombre}` | 200, 400, 404 | Privada | Sí | ADMIN | - |
| DELETE | /api/v1/categorias/{id} | Eliminar categoría | - | 200, 400, 404 | Privada | Sí | ADMIN | 400 si la categoría tiene productos |
| GET | /api/v1/productos | Listar productos | - | 200 | Pública | No | - | Incluye la categoría de cada producto |
| GET | /api/v1/productos/{id} | Detalle de producto | - | 200, 404 | Pública | No | - | 400 si el id no es numérico |
| POST | /api/v1/productos | Crear producto | `{nombre, descripcion, precio, stock, imagen, categoria:{id}}` | 201, 400, 404 | Privada | Sí | ADMIN | precio > 0, stock ≥ 0, categoría obligatoria |
| PUT | /api/v1/productos/{id} | Actualizar producto | igual que POST | 200, 400, 404 | Privada | Sí | ADMIN | Mismas validaciones que POST |
| DELETE | /api/v1/productos/{id} | Eliminar producto | - | 200, 400, 404 | Privada | Sí | ADMIN | 400 si el producto está en una boleta |
| GET | /api/v2/productos | Listar con filtros | query: `categoriaId`, `buscar` | 200 | Pública | No | - | v2: agrega filtros respecto a v1 |
| GET | /api/v2/productos/{id} | Detalle de producto | - | 200, 404 | Pública | No | - | - |
| GET | /api/v1/usuarios | Listar usuarios | - | 200, 401, 403 | Privada | Sí | ADMIN | La contraseña nunca se devuelve |
| GET | /api/v1/usuarios/{id} | Obtener usuario | - | 200, 404 | Privada | Sí | ADMIN | - |
| POST | /api/v1/usuarios | Crear usuario | `{nombre, email, password, rol}` | 201, 400 | Privada | Sí | ADMIN | Permite elegir cualquier rol; email único |
| PUT | /api/v1/usuarios/{id} | Actualizar usuario | `{nombre, email, password?, rol}` | 200, 400, 404 | Privada | Sí | ADMIN | Si password viene vacía no se cambia |
| DELETE | /api/v1/usuarios/{id} | Eliminar usuario | - | 200, 400, 404 | Privada | Sí | ADMIN | 400 si el usuario tiene compras |
| POST | /api/v1/boletas | Comprar | `{items:[{productoId, cantidad}]}` | 201, 400, 404 | Privada | Sí | CLIENTE, ADMIN | Valida stock, calcula total y descuenta stock (transacción) |
| GET | /api/v1/boletas/mis-boletas | Compras del cliente | - | 200 | Privada | Sí | CLIENTE | Solo las boletas del usuario del token |
| GET | /api/v1/boletas | Listar boletas | - | 200, 403 | Privada | Sí | ADMIN, VENDEDOR | Ordenadas por fecha descendente |
| GET | /api/v1/boletas/{id} | Detalle de boleta | - | 200, 404 | Privada | Sí | ADMIN, VENDEDOR | Incluye detalles y cliente |
| PUT | /api/v1/boletas/{id}/estado | Cambiar estado | `{estado}` | 200, 400, 404 | Privada | Sí | ADMIN | PENDIENTE, ENVIADA o ENTREGADA |
| DELETE | /api/v1/boletas/{id} | Eliminar boleta | - | 200, 404 | Privada | Sí | ADMIN | - |

Todos los errores se devuelven como `{"mensaje": "..."}`:

| Código | Cuándo |
|---|---|
| 400 | Validación, regla de negocio, JSON mal formado o parámetro con tipo incorrecto |
| 401 | Sin token, token inválido/vencido, o credenciales incorrectas |
| 403 | El rol del usuario no tiene permiso para esa ruta |
| 404 | El recurso no existe |
| 409 | La base de datos rechaza la operación por conflicto con datos existentes |
| 500 | Error interno no controlado |

## Tests
Tests unitarios con JUnit 5 + Mockito (no necesitan base de datos):
- `BoletaServiceTest`: cálculo del total, descuento de stock, stock insuficiente, carrito vacío, estado inválido.
- `UsuarioServiceTest`: registro como CLIENTE con password encriptada, email repetido, login incorrecto, rol inválido.
- `ProductoServiceTest`: producto no encontrado, precio inválido, creación con categoría, no eliminar si está en una boleta.
- `JwtUtilTest`: generación y validación del token, refresh token no sirve como acceso, token modificado y vencido.

Tests de seguridad con MockMvc (`SeguridadIntegracionTest`), que usan tokens JWT reales y pasan por `JwtFilter` y `SecurityConfig`:
- Endpoint público sin token → 200; endpoint de ADMIN sin token → 401.
- VENDEDOR creando producto → 403; ADMIN → 201. VENDEDOR listando boletas → 200; CLIENTE → 403.
- CLIENTE listando usuarios → 403.
- Refresh token usado como token de acceso → 401; token con payload alterado (cliente haciéndose pasar por admin) → 401.
- Renovación: refresh token válido → tokens nuevos; token de acceso enviado a `/refresh` → 401.
- JSON mal formado → 400; id no numérico → 400.
