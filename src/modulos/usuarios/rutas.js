const express = require("express");
const router = express.Router();
const respuestas = require("../../red/respuestas");
const controlador = require("./index");
const seguridad = require("./seguridad");
const { normalizarParametro } = require("../../utils/normalizar");

router.post("/login", login);
router.get("/", seguridad({ requireRole: 1 }), todos);
router.get("/:id", seguridad(), uno);
router.put("/", seguridad(), actualizar);
router.delete("/:id", seguridad(), eliminar);
router.post("/", insertar);
router.get("/oficio/:nombre", seguridad(), profesionalesPorOficio);
router.get("/ubicacion/:zona/:ciudad", seguridad(), profesionalesPorUbicacion);

async function todos(req, res, next) {
  try {
    const lista = await controlador.todos();
    respuestas.success(req, res, lista, 200);
  } catch (err) {
    next(err);
  }
}

async function insertar(req, res, next) {
  try {
    await controlador.insertar(req.body);
    respuestas.success(req, res, "Item agregado satisfactoriamente", 201);
  } catch (err) {
    next(err);
  }
}

async function actualizar(req, res, next) {
  try {
    await controlador.actualizar(req.body);
    respuestas.success(req, res, "Item actualizado satisfactoriamente", 200);
  } catch (err) {
    next(err);
  }
}

async function uno(req, res, next) {
  try {
    const item = await controlador.obtenerUsuarioPorId(req.params.id);
    respuestas.success(req, res, item, 200);
  } catch (err) {
    next(err);
  }
}

async function eliminar(req, res, next) {
  try {
    await controlador.eliminar(Number(req.params.id));
    respuestas.success(req, res, "Item eliminado satisfactoriamente", 200);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const token = await controlador.login(req.body.email, req.body.password);
    respuestas.success(req, res, token, 200);
  } catch (err) {
    next(err);
  }
}

async function profesionalesPorOficio(req, res, next) {
  try {
    const nombre = normalizarParametro(req.params.nombre || "");
    const lista = await controlador.profesionalesPorOficio(nombre);
    respuestas.success(req, res, lista, 200);
  } catch (err) {
    next(err);
  }
}

async function profesionalesPorUbicacion(req, res, next) {
  try {
    const zona = normalizarParametro(req.params.zona || "");
    const ciudad = normalizarParametro(req.params.ciudad || "");
    const lista = await controlador.profesionalesPorUbicacion(zona, ciudad);
    respuestas.success(req, res, lista, 200);
  } catch (err) {
    next(err);
  }
}

router.get("/ubicacion/:zona/:ciudad", seguridad(), profesionalesPorUbicacion);

module.exports = router;