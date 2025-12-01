-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3310
-- Tiempo de generación: 01-12-2025 a las 03:30:45
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

CREATE DATABASE IF NOT EXISTS mvp;
USE mvp;

--
-- Base de datos: `mvp`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comentarios`
--

CREATE TABLE `comentarios` (
  `id` int(11) NOT NULL,
  `comentario` varchar(500) NOT NULL,
  `estrellas` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `profesional_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `comentarios`
--

INSERT INTO `comentarios` (`id`, `comentario`, `estrellas`, `usuario_id`, `profesional_id`) VALUES
(1, 'capo', 5, 1, 1),
(2, 'capo', 5, 1, 2),
(3, 'capo total', 4, 3, 2),
(4, 'meh', 3, 4, 2),
(5, 'capo', 4, 1, 1),
(6, 'Medio pelo', 2, 9, 1),
(7, 'Muy bueno, recomendado', 5, 9, 6);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `oficios`
--

CREATE TABLE `oficios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `oficios`
--

INSERT INTO `oficios` (`id`, `nombre`) VALUES
(1, 'pintor'),
(2, 'gasista'),
(3, 'profesor'),
(4, 'electricista'),
(5, 'plomero'),
(6, 'carpintero'),
(7, 'Abogado'),
(8, 'Actuario'),
(9, 'Agricultor'),
(10, 'Albañil');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `oficios_prof`
--

CREATE TABLE `oficios_prof` (
  `profesional_id` int(11) NOT NULL,
  `oficio_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `oficios_prof`
--

INSERT INTO `oficios_prof` (`profesional_id`, `oficio_id`) VALUES
(4, 6),
(1, 1),
(1, 3),
(5, 6),
(3, 6),
(2, 6),
(6, 8),
(6, 9),
(6, 10);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `profesionales`
--

CREATE TABLE `profesionales` (
  `id` int(11) NOT NULL,
  `descripcion` text NOT NULL,
  `verificacion` tinyint(1) NOT NULL,
  `estado` tinyint(1) NOT NULL,
  `disponibilidad` varchar(100) NOT NULL,
  `promedio` decimal(5,1) NOT NULL,
  `usuario_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `profesionales`
--

INSERT INTO `profesionales` (`id`, `descripcion`, `verificacion`, `estado`, `disponibilidad`, `promedio`, `usuario_id`) VALUES
(1, 'Electricista certificado', 1, 1, 'sabados y domingos', 3.7, 2),
(2, 'gran laburante', 1, 1, 'sabados y domingos', 4.0, 5),
(3, 'gran laburante', 1, 1, 'sabados y domingos', 0.0, 6),
(4, '', 0, 0, '', 0.0, 7),
(5, 'gran laburante', 1, 1, 'sabados y domingos', 0.0, 8),
(6, 'Tengo mucha experiencia', 1, 1, 'Fines de semana', 5.0, 10);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id`, `nombre`) VALUES
(1, 'admin'),
(2, 'usuario'),
(3, 'profesional');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ubicaciones`
--

CREATE TABLE `ubicaciones` (
  `id` int(11) NOT NULL,
  `localidad` varchar(150) NOT NULL,
  `municipio` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ubicaciones`
--

INSERT INTO `ubicaciones` (`id`, `localidad`, `municipio`) VALUES
(1, 'San Isidro', 'San Isidro'),
(2, 'ramos mejia', 'la matanza'),
(3, 'city bell', 'la plata'),
(4, 'don torcuato', 'tigre'),
(5, 'burzaco', 'almirante brown'),
(6, 'alta gracia', 'alta gracia'),
(7, 'wilde', 'avellaneda'),
(8, 'funes', 'funes'),
(9, 'villa carlos paz', 'villa carlos paz'),
(10, 'temperley', 'lomas de zamora'),
(11, 'La Plata', 'La Plata'),
(12, 'Bahía Blanca', 'Cabildo'),
(13, 'Bahía Blanca', 'Ingeniero White'),
(14, 'Bahía Blanca', 'Bahía Blanca');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ubicaciones_prof`
--

CREATE TABLE `ubicaciones_prof` (
  `profesional_id` int(11) NOT NULL,
  `ubicacion_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ubicaciones_prof`
--

INSERT INTO `ubicaciones_prof` (`profesional_id`, `ubicacion_id`) VALUES
(1, 4),
(1, 5),
(5, 4),
(5, 5),
(3, 6),
(2, 6),
(6, 13),
(6, 14);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `ubicacion_id` int(11) NOT NULL,
  `email` varchar(254) NOT NULL,
  `password` varchar(100) NOT NULL,
  `condiciones` tinyint(1) NOT NULL,
  `rol_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `telefono`, `ubicacion_id`, `email`, `password`, `condiciones`, `rol_id`) VALUES
(1, 'Juan Pérez', '1145678901', 1, 'juan.perez@gmail.com', '$2b$10$LOoFz0.PV.XVEtup0R8dWuoBgPlvC2.iiCiNQaAxs3ugPjjcRi6Ja', 1, 2),
(2, 'Esteban Rodriguez', '1134567890', 3, 'esteban.rodriguez@gmail.com', '$2b$10$IL7i6BPbvkikfJ1stsmcguUlxUQ8CO7bjpuqu/JN.T4k1bckH3Hra', 1, 3),
(3, 'alberto lopez', '1145678901', 6, 'alberto.lopez@gmail.com', '$2b$10$6ANVRxtyOEmf2aQbm1YjFOyky0O3K1wVc81qrnPH1Y6e7L.Gyr9uy', 1, 2),
(4, 'javier funes', '1145678901', 7, 'javi.funes@gmail.com', '$2b$10$2kTH6qOD2KyCeH1PdfZPluFUxYjnb1bywhwHQCneZVNzin/R8lDku', 1, 2),
(5, 'elian Rodriguez', '1134567890', 3, 'elian.rodriguez@gmail.com', '$2b$10$kfogUtGI06I1/Exnt9tPl.ncC6qxWELtcAmgw7xm6mv5cjx3e6Xru', 1, 3),
(6, 'tobias muñoz', '1134567890', 3, 'tobias.muñoz@gmail.com', '$2b$10$8VMTeR5frf2MJeGEESa7/ufNwmJs4lpjfLS23NT92fnptxced/Zge', 1, 3),
(7, 'geremias gonzalez', '1234567890', 10, 'gere.gonz@gmail.com', '$2b$10$.8qH3/pUAW/opD46YqT1UuMmYCmPVn8UlqGkSd3xDt1rb/3.XUQWG', 1, 3),
(8, 'simon gonzalez', '1134567890', 3, 'simon.gonz@gmail.com', '$2b$10$60AQVtwKGbBkLXRhN8cR4uYQ6M987vTajar5WQt9VfYXQfBLnxUxe', 1, 3),
(9, 'fede lope', '+73264872368', 11, 'federico@gmail.com', '$2b$10$pS08g/fsQQRZr4uRvgLKqu5Eg7JbsGjclMTuB5fSdwjINQWVRF0u.', 1, 2),
(10, 'Ignacio Lopez', '+9234892374', 13, 'ignacio@gmail.com', '$2b$10$MK8kqyOciDWJbXuu3hgzL.IaycHOM5HDktBLdol3nr1t4PMtTLXgC', 1, 3);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `comentarios`
--
ALTER TABLE `comentarios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `profesional_id` (`profesional_id`);

--
-- Indices de la tabla `oficios`
--
ALTER TABLE `oficios`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `oficios_prof`
--
ALTER TABLE `oficios_prof`
  ADD KEY `profesional_id` (`profesional_id`),
  ADD KEY `oficio_id` (`oficio_id`);

--
-- Indices de la tabla `profesionales`
--
ALTER TABLE `profesionales`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `ubicaciones`
--
ALTER TABLE `ubicaciones`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `ubicaciones_prof`
--
ALTER TABLE `ubicaciones_prof`
  ADD KEY `profesional_id` (`profesional_id`),
  ADD KEY `ubicacion_id` (`ubicacion_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rol_id` (`rol_id`),
  ADD KEY `ubicacion_id` (`ubicacion_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `comentarios`
--
ALTER TABLE `comentarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `oficios`
--
ALTER TABLE `oficios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `profesionales`
--
ALTER TABLE `profesionales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `ubicaciones`
--
ALTER TABLE `ubicaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `comentarios`
--
ALTER TABLE `comentarios`
  ADD CONSTRAINT `comentarios_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `comentarios_ibfk_2` FOREIGN KEY (`profesional_id`) REFERENCES `profesionales` (`id`);

--
-- Filtros para la tabla `oficios_prof`
--
ALTER TABLE `oficios_prof`
  ADD CONSTRAINT `oficios_prof_ibfk_1` FOREIGN KEY (`profesional_id`) REFERENCES `profesionales` (`id`),
  ADD CONSTRAINT `oficios_prof_ibfk_2` FOREIGN KEY (`oficio_id`) REFERENCES `oficios` (`id`);

--
-- Filtros para la tabla `profesionales`
--
ALTER TABLE `profesionales`
  ADD CONSTRAINT `profesionales_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `ubicaciones_prof`
--
ALTER TABLE `ubicaciones_prof`
  ADD CONSTRAINT `ubicaciones_prof_ibfk_1` FOREIGN KEY (`profesional_id`) REFERENCES `profesionales` (`id`),
  ADD CONSTRAINT `ubicaciones_prof_ibfk_2` FOREIGN KEY (`ubicacion_id`) REFERENCES `ubicaciones` (`id`);

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`),
  ADD CONSTRAINT `usuarios_ibfk_2` FOREIGN KEY (`ubicacion_id`) REFERENCES `ubicaciones` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
