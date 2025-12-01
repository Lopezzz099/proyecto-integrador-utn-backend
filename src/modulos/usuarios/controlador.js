const crearError = require("../../middleware/errors");
const bcrypt = require("bcrypt");
const auth = require("../../auth");
const { stripPassword, stripPasswords } = require("../../utils/segPassword");

const TABLA = "usuarios";

module.exports = function (dbInyectada) {
  let db = dbInyectada;
  if (!db) {
    db = require("../../DB/mysql");
  }

  async function todos() {
    const usuarios = await db.todos(TABLA);
    const resultado = await Promise.all(
      usuarios.map(async (usuario) => {
        if (usuario.rol_id === 3) {
          return await unoConProfesional(usuario.id);
        }
        return stripPassword(usuario);
      })
    );
    return resultado;
  }

  function uno(id) {
    return db.uno(TABLA, id).then(stripPasswords);
  }

  async function unoConProfesional(id) {
    const rows = await db.consulta(
      `
      SELECT 
        u.id AS usuario_id,
        u.nombre AS usuario_nombre,
        u.condiciones AS usuario_condiciones,
        u.email AS usuario_email,
        u.telefono AS usuario_telefono,
        u.rol_id,
        u.ubicacion_id AS usuario_ubicacion_id,
        p.id AS profesional_id,
        p.descripcion,
        p.verificacion,
        p.estado,
        p.promedio,
        p.disponibilidad,
        c.id AS comentario_id,
        c.comentario,
        c.estrellas,
        c.usuario_id AS comentario_usuario_id,
        pu.ubicacion_id AS ubicacion_id,
        ub.localidad AS ubicacion_localidad,
        ub.municipio AS ubicacion_municipio,
        po.oficio_id AS oficio_id,
        ofi.nombre AS oficio_nombre
      FROM usuarios u
      LEFT JOIN profesionales p ON p.usuario_id = u.id
      LEFT JOIN comentarios c ON c.profesional_id = p.id
      LEFT JOIN ubicaciones_prof pu ON pu.profesional_id = p.id
      LEFT JOIN ubicaciones ub ON ub.id = pu.ubicacion_id
      LEFT JOIN oficios_prof po ON po.profesional_id = p.id
      LEFT JOIN oficios ofi ON ofi.id = po.oficio_id
      WHERE u.id = ?
    `,
      [id]
    );

    if (!rows || rows.length === 0) {
      return null;
    }

    const usuario = {
      id: rows[0].usuario_id,
      nombre: rows[0].usuario_nombre,
      email: rows[0].usuario_email,
      telefono: rows[0].usuario_telefono,
      condiciones: rows[0].usuario_condiciones,
      rol_id: rows[0].rol_id,
      ubicacion_id: rows[0].usuario_ubicacion_id,
      profesional: null,
    };

    if (rows[0].profesional_id) {
      usuario.profesional = {
        id: rows[0].profesional_id,
        descripcion: rows[0].descripcion,
        verificacion: rows[0].verificacion,
        estado: rows[0].estado,
        disponibilidad: rows[0].disponibilidad,
        promedio: rows[0].promedio,
        ubicaciones: [],
        oficios: [],
        comentarios: [],
      };

      const comentariosUnicos = new Set();
      const ubicacionesUnicas = new Set();
      const oficiosUnicos = new Set();

      rows.forEach((r) => {
        if (r.comentario_id && !comentariosUnicos.has(r.comentario_id)) {
          comentariosUnicos.add(r.comentario_id);
          usuario.profesional.comentarios.push({
            id: r.comentario_id,
            comentario: r.comentario,
            estrellas: r.estrellas,
            usuario_id: r.comentario_usuario_id,
          });
        }
        if (r.ubicacion_id && !ubicacionesUnicas.has(r.ubicacion_id)) {
          ubicacionesUnicas.add(r.ubicacion_id);
          usuario.profesional.ubicaciones.push({
            id: r.ubicacion_id,
            localidad: r.ubicacion_localidad,
            municipio: r.ubicacion_municipio,
          });
        }
        if (r.oficio_id && !oficiosUnicos.has(r.oficio_id)) {
          oficiosUnicos.add(r.oficio_id);
          usuario.profesional.oficios.push({
            id: r.oficio_id,
            nombre: r.oficio_nombre,
          });
        }
      });
    }

    return usuario;
  }

  async function obtenerUsuarioPorId(id) {
    const rows = await db.uno(TABLA, id);
    if (!rows || rows.length === 0) {
      throw crearError(`Usuario con id ${id} no encontrado`, 404);
    }
    const usuario = rows[0];
    if (usuario.rol_id === 3) {
      return await unoConProfesional(id);
    }
    return stripPassword(usuario);
  }

  async function obtenerOCrearUbicacion(localidad, municipio) {
    if (!localidad || !municipio) {
      throw crearError("Ubicación debe tener localidad y municipio", 400);
    }
    const existente = await db.consulta(
      "SELECT id FROM ubicaciones WHERE localidad = ? AND municipio = ?",
      [localidad, municipio]
    );
    if (existente && existente.length > 0) {
      return existente[0].id;
    }
    const resultado = await db.insertar("ubicaciones", {
      localidad,
      municipio,
    });
    return resultado.insertId;
  }

  async function obtenerOCrearOficio(nombre) {
    if (!nombre) {
      throw crearError("El oficio debe tener nombre", 400);
    }
    const existente = await db.consulta(
      "SELECT id FROM oficios WHERE nombre = ?",
      [nombre]
    );
    if (existente && existente.length > 0) {
      return existente[0].id;
    }
    const resultado = await db.insertar("oficios", { nombre });
    return resultado.insertId;
  }

  async function insertar(body) {
    if (!body.password) {
      throw crearError("Password requerido", 400);
    }
    if (!body.rol_id) {
      throw crearError("rol_id requerido", 400);
    }

    body.password = bcrypt.hashSync(body.password, 10);
    const { ubicacion, oficios, ...datosUsuario } = body;

    await db.consulta("START TRANSACTION");
    try {
      if (!ubicacion || !ubicacion.localidad || !ubicacion.municipio) {
        throw crearError(
          "Ubicación con localidad y municipio es requerida",
          400
        );
      }

      const ubicacionId = await obtenerOCrearUbicacion(
        ubicacion.localidad,
        ubicacion.municipio
      );
      datosUsuario.ubicacion_id = ubicacionId;

      const resultadoUsuario = await db.insertar(TABLA, datosUsuario);
      const usuarioId = resultadoUsuario.insertId;

      if (datosUsuario.rol_id === 2) {
        await db.consulta("COMMIT");
        return resultadoUsuario;
      }

      if (datosUsuario.rol_id === 3) {
        const profesionalData = {
          usuario_id: usuarioId,
          descripcion: datosUsuario.descripcion || "",
          verificacion: datosUsuario.verificacion || "0",
          estado: datosUsuario.estado || "0",
          disponibilidad: datosUsuario.disponibilidad || "",
          promedio: 0,
        };

        const resultadoProfesional = await db.insertar(
          "profesionales",
          profesionalData
        );
        const profesionalId = resultadoProfesional.insertId;

        if (oficios && Array.isArray(oficios) && oficios.length > 0) {
          for (const nombreOficio of oficios) {
            if (typeof nombreOficio !== "string") {
              throw crearError("Cada oficio debe ser un string (nombre)", 400);
            }
            const oficioId = await obtenerOCrearOficio(nombreOficio.trim());
            await db.insertar("oficios_prof", {
              profesional_id: profesionalId,
              oficio_id: oficioId,
            });
          }
        }
      }

      await db.consulta("COMMIT");
      return resultadoUsuario;
    } catch (error) {
      await db.consulta("ROLLBACK");
      throw error;
    }
  }

  async function actualizar(body) {
    if (!body.id) {
      throw crearError("ID no proporcionado", 400);
    }

    const usuarioExistente = await db.uno(TABLA, body.id);
    if (!usuarioExistente || usuarioExistente.length === 0) {
      throw crearError(`Usuario con id ${body.id} no encontrado`, 404);
    }

    const {
      ubicacion,
      ubicaciones,
      oficios,
      descripcion,
      estado,
      disponibilidad,
      ...datosUsuario
    } = body;

    await db.consulta("START TRANSACTION");

    try {
      if (!ubicacion || !ubicacion.localidad || !ubicacion.municipio) {
        throw crearError(
          "Ubicación con localidad y municipio es requerida",
          400
        );
      }

      const ubicacionId = await obtenerOCrearUbicacion(
        ubicacion.localidad,
        ubicacion.municipio
      );
      datosUsuario.ubicacion_id = ubicacionId;

      await db.actualizar(TABLA, datosUsuario);

      if (datosUsuario.rol_id === 2) {
        await db.consulta("COMMIT");
        return { message: "Usuario actualizado correctamente" };
      }

      if (datosUsuario.rol_id === 3) {
        const profesionalExistente = await db.consulta(
          `SELECT * FROM profesionales WHERE usuario_id = ?`,
          [body.id]
        );

        const profesionalDataActual = profesionalExistente[0];
        let verificado = profesionalDataActual.verificacion;

        if (verificado !== 1) {
          if (
            descripcion &&
            estado &&
            disponibilidad &&
            ubicaciones &&
            Array.isArray(ubicaciones) &&
            ubicaciones.length > 0
          ) {
            verificado = 1;
          }
        }

        const profesionalData = {
          id: profesionalDataActual.id,
          descripcion: descripcion || profesionalDataActual.descripcion,
          verificacion: verificado,
          estado: estado || profesionalDataActual.estado,
          disponibilidad:
            disponibilidad || profesionalDataActual.disponibilidad,
          promedio: profesionalDataActual.promedio,
        };

        await db.actualizar("profesionales", profesionalData);

        if (
          ubicaciones &&
          Array.isArray(ubicaciones) &&
          ubicaciones.length > 0
        ) {
          await db.consulta(
            `DELETE FROM ubicaciones_prof WHERE profesional_id = ?`,
            [profesionalDataActual.id]
          );
          for (const nombreUbicacion of ubicaciones) {
            if (
              typeof nombreUbicacion.localidad !== "string" ||
              typeof nombreUbicacion.municipio !== "string"
            ) {
              throw crearError(
                "Cada ubicación debe tener localidad y municipio como texto",
                400
              );
            }
            if (
              !nombreUbicacion.localidad.trim() ||
              !nombreUbicacion.municipio.trim()
            ) {
              throw crearError(
                "La localidad y la municipio no pueden estar vacías",
                400
              );
            }
            const ubicacionIdTemp = await obtenerOCrearUbicacion(
              nombreUbicacion.localidad,
              nombreUbicacion.municipio
            );
            await db.insertar("ubicaciones_prof", {
              profesional_id: profesionalDataActual.id,
              ubicacion_id: ubicacionIdTemp,
            });
          }
        }

        if (oficios && Array.isArray(oficios) && oficios.length > 0) {
          await db.consulta(
            `DELETE FROM oficios_prof WHERE profesional_id = ?`,
            [profesionalDataActual.id]
          );
          for (const nombreOficio of oficios) {
            if (typeof nombreOficio !== "string") {
              throw crearError("Cada oficio debe ser un string (nombre)", 400);
            }
            if (!nombreOficio.trim()) {
              throw crearError(
                "El nombre del oficio no puede estar vacío",
                400
              );
            }
            const oficioId = await obtenerOCrearOficio(nombreOficio);
            await db.insertar("oficios_prof", {
              profesional_id: profesionalDataActual.id,
              oficio_id: oficioId,
            });
          }
        }
      }

      await db.consulta("COMMIT");
      return { message: "Usuario profesional actualizado correctamente" };
    } catch (error) {
      await db.consulta("ROLLBACK");
      throw error;
    }
  }

  async function eliminar(id) {
    const existe = await db.uno(TABLA, id);
    if (!existe || existe.length === 0) {
      throw crearError(`No existe usuario con id ${id}`, 404);
    }
    const resultado = await db.eliminar(TABLA, id);
    if (resultado.affectedRows === 0) {
      throw crearError(`No se eliminó registro con id ${id}`, 404);
    }
    return resultado;
  }

  async function login(email, password) {
    const data = await db.login(TABLA, email);
    if (!data || data.length === 0) {
      throw crearError("Usuario no encontrado", 404);
    }
    const usuario = data[0];
    const resultado = await bcrypt.compare(password, usuario.password);
    if (resultado === true) {
      const usuarioSinPassword = stripPassword(usuario);
      return auth.asignarToken(usuarioSinPassword);
    } else {
      throw crearError("Credenciales inválidas", 401);
    }
  }

  async function profesionalesPorOficio(nombreOficio) {
    if (!nombreOficio || !nombreOficio.trim()) {
      throw crearError("Nombre de oficio requerido", 400);
    }
    const filtro = nombreOficio.trim();
    const rows = await db.consulta(
      `
      SELECT DISTINCT u.id
      FROM usuarios u
      JOIN profesionales p ON p.usuario_id = u.id
      JOIN oficios_prof op ON op.profesional_id = p.id
      JOIN oficios o ON o.id = op.oficio_id
      WHERE u.rol_id = 3
        AND p.verificacion = 1
        AND o.nombre LIKE ?
      `,
      [`%${filtro}%`]
    );
    if (!rows || rows.length === 0) {
      return [];
    }
    const resultado = [];
    for (const r of rows) {
      const detalle = await unoConProfesional(r.id);
      if (detalle) resultado.push(detalle);
    }
    return resultado;
  }

  async function profesionalesPorUbicacion(localidadParam, municipioParam) {
    if (
      !localidadParam ||
      !localidadParam.trim() ||
      !municipioParam ||
      !municipioParam.trim()
    ) {
      throw crearError("localidad y municipio requeridas", 400);
    }
    const rows = await db.consulta(
      `
      SELECT DISTINCT u.id
      FROM usuarios u
      JOIN profesionales p ON p.usuario_id = u.id
      JOIN ubicaciones_prof up ON up.profesional_id = p.id
      JOIN ubicaciones ub ON ub.id = up.ubicacion_id
      WHERE u.rol_id = 3
        AND p.verificacion = 1
        AND ub.localidad LIKE ?
        AND ub.municipio LIKE ?
      `,
      [`%${localidadParam}%`, `%${municipioParam}%`]
    );
    if (!rows || rows.length === 0) {
      return [];
    }
    const resultado = [];
    for (const r of rows) {
      const detalle = await unoConProfesional(r.id);
      if (detalle) resultado.push(detalle);
    }
    return resultado;
  }

  async function profesionalesPorNombre(nombreParam) {
    if (!nombreParam || !nombreParam.trim()) {
      throw crearError("Nombre requerido", 400);
    }
    const filtro = nombreParam.trim();
    const rows = await db.consulta(
      `
      SELECT DISTINCT u.id
      FROM usuarios u
      JOIN profesionales p ON p.usuario_id = u.id
      WHERE u.rol_id = 3
        AND p.verificacion = 1
        AND u.nombre LIKE ?
      `,
      [`%${filtro}%`]
    );
    if (!rows || rows.length === 0) {
      return [];
    }
    const resultado = [];
    for (const r of rows) {
      const detalle = await unoConProfesional(r.id);
      if (detalle) resultado.push(detalle);
    }
    return resultado;
  }

  async function listarProfesionales() {
    const rows = await db.consulta(`
      SELECT u.id
      FROM usuarios u
      JOIN profesionales p ON p.usuario_id = u.id
      WHERE u.rol_id = 3
    `);
    const resultado = [];
    for (const r of rows) {
      const detalle = await unoConProfesional(r.id);
      if (detalle) resultado.push(detalle);
    }
    return resultado;
  }

  async function listarUsuariosNormales() {
    const rows = await db.consulta(`
      SELECT *
      FROM usuarios
      WHERE rol_id = 2
    `);
    return stripPasswords(rows);
  }

  return {
    todos,
    uno,
    obtenerUsuarioPorId,
    unoConProfesional,
    eliminar,
    insertar,
    actualizar,
    login,
    profesionalesPorOficio,
    profesionalesPorUbicacion,
    profesionalesPorNombre,
    listarProfesionales,
    listarUsuariosNormales,
  };
};
