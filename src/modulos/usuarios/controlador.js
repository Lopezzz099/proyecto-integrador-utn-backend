const crearError = require("../../middleware/errors");
const bcrypt = require("bcrypt");
const auth = require("../../auth");

const TABLA = "usuarios";
// const ROL_POR_DEFECTO = 2;

module.exports = function (dbInyectada) {
  let db = dbInyectada;
  if (!db) {
    db = require("../../DB/mysql");
  }

  function stripPassword(row) {
    if (!row) return row;
    const { password, ...rest } = row;
    return rest;
  }

  // GET /usuarios - Trae todos, profesionales con datos completos
  async function todos() {
    const usuarios = await db.todos(TABLA);
    
    // Para cada usuario con rol_id 3, obtener sus datos completos
    const resultado = await Promise.all(
      usuarios.map(async (usuario) => {
        const usuarioSinPassword = stripPassword(usuario);
        
        if (usuario.rol_id === 3) {
          // Obtener profesional + comentarios
          const completo = await unoConProfesional(usuario.id);
          return completo;
        }
        
        return usuarioSinPassword;
      })
    );
    
    return resultado;
  }

  function uno(id) {
    return db.uno(TABLA, id).then((rows) => rows.map(stripPassword));
  }

  // GET usuario con rol 3: incluye profesional + comentarios
  async function unoConProfesional(id) {
    const rows = await db.consulta(`
      SELECT 
        u.id AS usuario_id,
        u.nombre AS usuario_nombre,
        u.apellido AS usuario_apellido,
        u.email AS usuario_email,
        u.telefono AS usuario_telefono,
        u.rol_id,
        p.id AS profesional_id,
        p.condiciones,
        p.descripcion,
        p.verificacion,
        p.estado,
        p.disponibilidad,
        c.id AS comentario_id,
        c.comentario,
        c.estrellas,
        c.usuario_id AS comentario_usuario_id
      FROM usuarios u
      LEFT JOIN profesionales p ON p.usuario_id = u.id
      LEFT JOIN comentarios c ON c.profesional_id = p.id
      WHERE u.id = ?
    `, [id]);

    if (!rows || rows.length === 0) {
      return null;
    }

    const usuario = {
      id: rows[0].usuario_id,
      nombre: rows[0].usuario_nombre,
      apellido: rows[0].usuario_apellido,
      email: rows[0].usuario_email,
      telefono: rows[0].usuario_telefono,
      rol_id: rows[0].rol_id,
      profesional: null,
      comentarios: []
    };

    if (rows[0].profesional_id) {
      usuario.profesional = {
        id: rows[0].profesional_id,
        condiciones: rows[0].condiciones,
        descripcion: rows[0].descripcion,
        verificacion: rows[0].verificacion,
        estado: rows[0].estado,
        disponibilidad: rows[0].disponibilidad
      };

      const comentariosUnicos = new Set();
      rows.forEach(r => {
        if (r.comentario_id && !comentariosUnicos.has(r.comentario_id)) {
          comentariosUnicos.add(r.comentario_id);
          usuario.comentarios.push({
            id: r.comentario_id,
            comentario: r.comentario,
            estrellas: r.estrellas,
            usuario_id: r.comentario_usuario_id
          });
        }
      });
    }

    return usuario;
  }

  // Verifica si el usuario buscado tiene rol_id 3 y devuelve apropiadamente
  async function obtenerUsuarioPorId(id) {
    const rows = await db.uno(TABLA, id);
    
    if (!rows || rows.length === 0) {
      throw crearError(`Usuario con id ${id} no encontrado`, 404);
    }
    
    const usuario = rows[0];
    
    // Si el usuario consultado tiene rol_id 3, traer datos completos
    if (usuario.rol_id === 3) {
      return await unoConProfesional(id);
    }
    
    // Usuario normal: solo datos básicos sin password
    return stripPassword(usuario);
  }

  function insertar(body) {
    if (!body.password) {
      throw crearError("Password requerido", 400);
    }
    body.password = bcrypt.hashSync(body.password, 10);

    // if (!body.rol_id) {
    //   body.rol_id = ROL_POR_DEFECTO;
    // }

    return db.insertar(TABLA, body);
  }

  function actualizar(body) {
    if (body.password) {
      body.password = bcrypt.hashSync(body.password, 10);
    }
    return db.actualizar(TABLA, body);
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
      const { password, ...usuarioSinPassword } = usuario;
      return auth.asignarToken(usuarioSinPassword);
    } else {
      throw crearError("Credenciales inválidas", 401);
    }
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
  };
};