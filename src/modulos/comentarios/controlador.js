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

  function insertar(body) {
    return db.insertar(TABLA, body);
  }

  function actualizar(body) {
    return db.actualizar(TABLA, body);
  }

  function uno(id) {
    return db.uno(TABLA, id);
  }

  async function eliminar(id) {
    const existe = await db.uno(TABLA, id);
    if (!existe || existe.length === 0) {
      throw crearError(`No existe comentario con id ${id}`, 404);
    }
    const resultado = await db.eliminar(TABLA, id);
    if (resultado.affectedRows === 0) {
      throw crearError(`No se eliminó registro con id ${id}`, 404);
    }
    return resultado;
  }

  return {
    todos,
    uno,
    eliminar,
    insertar,
    actualizar,
  };
};
