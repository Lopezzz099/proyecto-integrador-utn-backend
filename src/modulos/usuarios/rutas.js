const express = require("express");
const router = express.Router();
const respuestas = require("../../red/respuestas");
const controlador = require("./index");
const seguridad = require("./seguridad");

router.post("/login", login);
router.get("/", seguridad({ requireRole: 1 }), todos);
router.get("/:id", seguridad(), uno);
router.put("/", seguridad(), actualizar);
router.delete("/:id", seguridad(), eliminar);
router.post("/", insertar);

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

module.exports = router;