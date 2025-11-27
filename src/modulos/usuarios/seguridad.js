// const auth = require('../../auth');

// module.exports = function chequearToken(){

//     function middleware(req, res, next){
//         // const rol_id = req.body.rol_id
//         // auth.chequearToken.confirmarToken(req, rol_id)
//         auth.chequearToken.confirmarToken(req)
//         next();
//     }
//     return middleware;
// }

const auth = require("../../auth");
const crearError = require("../../middleware/errors");

module.exports = function seguridad(opciones = {}) {
  const { requireAuth = true, requireRole } = opciones;

  return function middleware(req, res, next) {
    try {
      if (requireAuth || requireRole) {
        auth.chequearToken.confirmarToken(req);
      }

      if (requireRole && req.user.rol_id !== requireRole) {
        throw crearError("No autorizado: rol insuficiente", 403);
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
