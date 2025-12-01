# Backend API

## Overview

API RESTful para gestión de usuarios (normales y profesionales), oficios, ubicaciones, roles y comentarios con cálculo dinámico de promedio de calificaciones. Incluye autenticación JWT, control de acceso por roles y operaciones transaccionales para crear/actualizar profesionales junto con sus asociaciones.

## Características Principales

- Creación unificada de usuario y perfil profesional (rol_id 3) en una transacción.
- Hash seguro de contraseñas con bcrypt (10 salt rounds).
- Autenticación JWT (header Authorization: Bearer <token>).
- Control de acceso por rol (middleware seguridad) para endpoints protegidos.
- Gestión de oficios y ubicaciones reutilizables (evita duplicados mediante búsqueda previa).
- Asociación N:M profesionales-oficios y profesionales-ubicaciones.
- Comentarios con recalculo automático de promedio (AVG estrellas) en tabla `profesionales`.
- Filtros por oficio, ubicación (localidad/municipio) y nombre de profesional.
- Sanitización de salida (remoción de password en respuestas).
- CORS configurable vía variable de entorno `CORS_ORIGINS`.

## Stack Tecnológico

- Node.js + Express
- MySQL (`mysql` driver)
- JWT (`jsonwebtoken`)
- Bcrypt (`bcrypt`)
- CORS (`cors`)
- Logger (`morgan`)
- Variables de entorno (`dotenv`)

## Requisitos Previos

- Node.js >= 18
- MySQL/MariaDB (ej: XAMPP) configurado y accesible.
- Crear base de datos y tablas (ver Esquema). Ajustar puerto si difiere (ej: 3310 en XAMPP).

## Instalación

```bash
npm install
```

## Scripts

```bash
npm run dev   # Inicia servidor con nodemon en ./src/index.js
```

## Configuración (.env)

Ejemplo de archivo `.env`:

```
PORT=4000
MYSQL_HOST=localhost
MYSQL_PORT=3310
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=tu_base
JWT_SECRET=un_secret_seguro
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

## Esquema de Base de Datos (Campos Relevantes)

Tabla `usuarios`: id, nombre, email, telefono, password, rol_id, condiciones, ubicacion_id
Tabla `profesionales`: id, usuario_id (FK usuarios.id), descripcion, verificacion, estado, disponibilidad, promedio
Tabla `comentarios`: id, comentario, estrellas, usuario_id (autor), profesional_id
Tabla `ubicaciones`: id, localidad, municipio
Tabla `ubicaciones_prof`: profesional_id, ubicacion_id
Tabla `oficios`: id, nombre
Tabla `oficios_prof`: profesional_id, oficio_id
Tabla `roles`: id, nombre (referenciado por rol_id)

**Nota**: `rol_id` = 1 (Admin), 2 (Usuario Normal), 3 (Profesional)

## Arquitectura

- `src/app.js`: Configura middlewares (morgan, JSON parsing, CORS) y monta rutas bajo `/api/*`.
- `src/index.js`: Punto de arranque (`app.listen`).
- `src/config.js`: Carga y expone configuración de entorno (app, mysql, jwt).
- `src/DB/mysql.js`: Conexión MySQL, helpers CRUD y `consulta` para SQL arbitrario + soporte transacciones manuales.
- `src/modulos/*`: Cada módulo separa `rutas.js`, `controlador.js` y lógica específica.
- `src/auth`: Generación/verificación de JWT.
- `src/utils`: Utilidades (normalizar parámetros, quitar password).
- `src/middleware/errors.js`: Crea objetos de error uniformes.

## Seguridad

- Hash de contraseña: `bcrypt.hashSync(password, 10)` al insertar.
- Login: compara bcrypt y emite JWT con payload sin password.
- Middleware `seguridad()`: Verifica token y opcionalmente valida `requireRole`.
- Tokens: Expiración configurable (ej. 24h). Header: `Authorization: Bearer <token>`.

## CORS

Lista blanca configurable con `CORS_ORIGINS` (CSV). Si el origen está incluido se permite. Cabeceras permitidas: `Content-Type`, `Authorization`.

## Flujo Transaccional de Creación de Profesional

1. START TRANSACTION
2. Crear/obtener ubicación principal (usuarios.ubicacion_id)
3. Insertar usuario
4. Si `rol_id=3`: insertar profesional y asociaciones de oficios
5. COMMIT (o ROLLBACK en error)

## Recalculo de Promedio

Cada inserción/actualización/eliminación de comentario dispara `AVG(estrellas)` sobre comentarios del profesional y actualiza `profesionales.promedio` (dos decimales, default 0 si no hay comentarios).

## Normalización de Parámetros

Rutas que aceptan strings con guiones los transforman a espacios (`normalizarParametro`). Ej: `electricista-plomero` -> `electricista plomero`.

## Endpoints Principales (Prefijo /api)

### Autenticación

POST `/api/usuarios/login` -> Body: { email, password } => JWT

### Usuarios

GET `/api/usuarios/` (rol 1) -> Lista todos (profesionales enriquecidos)
GET `/api/usuarios/:id` (auth) -> Usuario; si rol_id=3 incluye profesional, ubicaciones, oficios, comentarios, promedio
POST `/api/usuarios/` -> Crear usuario (body incluye: nombre, email, password, rol_id, ubicacion{localidad, municipio}, oficios[] opcional si rol 3, descripción/estado/disponibilidad opcionales)
PUT `/api/usuarios/` (auth) -> Actualizar (misma estructura; reemplaza asociaciones si rol 3)
DELETE `/api/usuarios/:id` (auth) -> Eliminar usuario

### Filtros Profesionales (auth)

GET `/api/usuarios/oficio/:nombre` -> Profesionales cuyo oficio LIKE nombre
GET `/api/usuarios/ubicacion/:localidad/:municipio` -> Profesionales por localidad y municipio
GET `/api/usuarios/nombre/:nombre` -> Profesionales por nombre
GET `/api/usuarios/todos/profesionales` -> Lista solo profesionales
GET `/api/usuarios/todos/usuarios` -> Lista solo usuarios normales

### Comentarios

POST `/api/comentarios/` -> Crear comentario (comentario, estrellas, usuario_id, profesional_id)
PUT `/api/comentarios/` -> Actualizar comentario
DELETE `/api/comentarios/:id` -> Eliminar comentario
GET `/api/comentarios/` -> Listar todos
GET `/api/comentarios/:id` -> Obtener uno

### Oficios / Ubicaciones / Roles

(Definir según rutas implementadas en sus módulos; siguen patrón CRUD básico si existen)

## Manejo de Errores

- Uso de `crearError(mensaje, status)` para lanzar errores controlados.
- Middleware final captura y retorna JSON consistente.

## Respuestas

Formato estándar:

```json
{ "error": false, "status": 200, "body": <data> }
```

Errores:

```json
{ "error": true, "status": <code>, "body": <mensaje>, "details": <interno?> }
```

## Buenas Prácticas Integradas

- Prevención de duplicados en oficios/ubicaciones.
- Remoción de contraseña en todas las respuestas.
- Uso de transacciones para consistencia multi-table.
- Re-cálculo automático derivado de eventos (comentarios).
- Parámetros normalizados para mejorar coincidencias de búsqueda.

## Mejoras Futuras Sugeridas

- Paginación y límites en listados y filtros.
- Cache de resultados de profesionales para reducir joins repetidos.
- Endpoint de verificación administrativa (cambiar verificacion manual).
- Soft delete / auditoría (timestamps, deleted_at).
- Tests automatizados (unitarios e integración).
- Migrar a `mysql2` y/o usar pool de conexiones.
- Validación más estricta con librería (ej: Joi / Zod).

## Inicio Rápido

1. Crear `.env`.
2. Crear base y tablas.
3. `npm install`.
4. `npm run dev`.
5. Registrar usuario rol 2 o 3.
6. Login y usar token en `Authorization`.

## Licencia

Uso interno. Añadir licencia si se publica.
