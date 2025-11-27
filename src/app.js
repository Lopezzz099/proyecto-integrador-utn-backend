const express = require("express");
const config = require("./config");
const app = express();
const morgan = require("morgan");
const error = require("./red/errors");
const clientes = require("./modulos/clientes/rutas");
const usuarios = require("./modulos/usuarios/rutas");
const profesionales = require("./modulos/profesionales/rutas");
const comentarios = require("./modulos/comentarios/rutas");
const roles = require("./modulos/roles/rutas");

//middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//middlewares

//configuracion
app.set("port", config.app.port);

//rutas
app.use("/api/clientes", clientes);
app.use("/api/usuarios", usuarios);
app.use("/api/profesionales", profesionales);
app.use("/api/comentarios", comentarios);
app.use("/api/roles", roles);

app.use(error);

module.exports = app;
