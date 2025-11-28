const express = require("express");
const cors = require("cors");
const config = require("./config");
const app = express();
const morgan = require("morgan");
const error = require("./red/errors");
const usuarios = require("./modulos/usuarios/rutas");
const comentarios = require("./modulos/comentarios/rutas");
const roles = require("./modulos/roles/rutas");
const oficios = require("./modulos/oficios/rutas");
const ubicaciones = require("./modulos/ubicaciones/rutas");

//middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//middlewares

//configuracion
app.set("port", config.app.port);

const allowed = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowed.length === 0 || allowed.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origen no permitido por CORS: " + origin));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 600,
  })
);

//rutas
app.use("/api/usuarios", usuarios);
app.use("/api/comentarios", comentarios);
app.use("/api/roles", roles);
app.use("/api/oficios", oficios);
app.use("/api/ubicaciones", ubicaciones);

app.use(error);

module.exports = app;
