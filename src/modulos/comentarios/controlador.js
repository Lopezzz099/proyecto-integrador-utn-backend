const crearError = require("../../middleware/errors");

const TABLA = "comentarios";

module.exports = function (dbInyectada) {
  let db = dbInyectada;
  if (!db) {
    db = require("../../DB/mysql");
  }

  function todos() {
    return db.todos(TABLA);
  }

  async function recalcularPromedio(profesionalId) {
    if (!profesionalId) return;

    const rows = await db.consulta(
      "SELECT AVG(estrellas) AS promedio FROM comentarios WHERE profesional_id = ?",
      [profesionalId]
    );

    const promedio = rows && rows[0] ? rows[0].promedio : null;

    const valor = promedio === null ? 0 : Number(promedio.toFixed(2));

    await db.actualizar("profesionales", { id: profesionalId, promedio: valor });
  }

  async function insertar(body) {
    if (!body || !body.profesional_id) {
      throw crearError("profesional_id requerido en comentario", 400);
    }
    const res = await db.insertar(TABLA, body);
    await recalcularPromedio(body.profesional_id);
    return res;
  }

  async function actualizar(body) {
    if (!body || !body.id) {
      throw crearError("ID de comentario requerido", 400);
    }
    const actual = await db.uno(TABLA, body.id);
    if (!actual || actual.length === 0) {
      throw crearError(`Comentario con id ${body.id} no encontrado`, 404);
    }
    const profesionalId = actual[0].profesional_id;

    const res = await db.actualizar(TABLA, body);
    await recalcularPromedio(profesionalId);
    return res;
  }

  async function uno(id) {
    return db.uno(TABLA, id);
  }

  async function eliminar(id) {
    const existe = await db.uno(TABLA, id);
    if (!existe || existe.length === 0) {
      throw crearError(`No existe comentario con id ${id}`, 404);
    }
    const profesionalId = existe[0].profesional_id;

    const resultado = await db.eliminar(TABLA, id);
    if (resultado.affectedRows === 0) {
      throw crearError(`No se eliminó registro con id ${id}`, 404);
    }

    await recalcularPromedio(profesionalId);
    return resultado;
  }

  return {
    todos,
    uno,
    eliminar,
    insertar,
    actualizar,
    // Opcional: exportar para recalcular manualmente si lo necesitás
    recalcularPromedio,
  };
};