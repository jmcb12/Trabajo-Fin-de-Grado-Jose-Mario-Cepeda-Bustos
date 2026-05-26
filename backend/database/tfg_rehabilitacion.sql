-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 16-05-2026 a las 02:33:37
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `tfg_rehabilitacion`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ejercicios`
--

CREATE TABLE `ejercicios` (
  `id_ejercicio` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `tipo_ejercicio` enum('repeticion_palabra','repeticion_frase','denominacion','lectura','completar_frase') NOT NULL,
  `nivel_dificultad` enum('bajo','medio','alto') NOT NULL DEFAULT 'bajo',
  `texto_estimulo` varchar(255) NOT NULL,
  `respuesta_esperada` varchar(255) DEFAULT NULL,
  `instruccion` text DEFAULT NULL,
  `duracion_maxima_seg` int(11) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `imagen_denominacion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `ejercicios`
--

INSERT INTO `ejercicios` (`id_ejercicio`, `nombre`, `descripcion`, `tipo_ejercicio`, `nivel_dificultad`, `texto_estimulo`, `respuesta_esperada`, `instruccion`, `duracion_maxima_seg`, `activo`, `imagen_denominacion`) VALUES
(1, 'Repetición de palabra: casa', 'El paciente debe repetir una palabra simple.', 'repeticion_palabra', 'bajo', 'casa', 'casa', 'Escucha la palabra y repítela', 10, 1, NULL),
(2, 'Repetición de frase: buenos días', 'El paciente debe repetir una frase corta.', 'repeticion_frase', 'bajo', 'buenos días', 'buenos días', 'Escucha la frase y repítela', 12, 1, NULL),
(3, 'Denominación de objeto', 'El paciente debe nombrar el objeto mostrado.', 'denominacion', 'medio', 'silla', 'silla', 'Observa la imagen y di su nombre.', 15, 1, '/media/imagenesDenominacion/silla.jpg'),
(4, 'Lectura guiada 1', 'Lectura de frase sencilla.', 'lectura', 'medio', 'El perro corre.', 'El perro corre.', 'Lee en voz alta la frase mostrada.', 15, 1, NULL),
(5, 'Completar frase', 'Ejercicio que ayuda al lexico', 'completar_frase', 'bajo', 'El gato hace ____', 'miau', 'Completa la frase con la palabra que falta', 10, 1, NULL),
(6, 'denominacion globo', 'Di el objeto que ves', 'denominacion', 'medio', 'globo', 'globo', 'Observa la imagen y di su nombre', 3, 1, '/media/imagenesDenominacion/denominacion_1778538390384.png'),
(7, 'Completar frase astilla', 'Se busca que el paciente intente recordar refranes típicos de la lengua española', 'completar_frase', 'medio', 'De tal palo tal ___', 'astilla', 'Completa la frase con la palabra que falta', 10, 1, NULL),
(8, 'Repetición palabra cuchara', 'Repetir la palabra cuchara para trabajar los fonemas \"ch\"', 'repeticion_palabra', 'medio', 'cuchara', 'cuchara', 'Escucha la palabra y repítela', 10, 1, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pacientes`
--

CREATE TABLE `pacientes` (
  `id_paciente` int(11) NOT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `id_profesional_referencia` int(11) NOT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `sexo` enum('M','F','Otro') DEFAULT NULL,
  `diagnostico_principal` text DEFAULT NULL,
  `nivel_afasia` varchar(50) DEFAULT NULL,
  `fecha_inicio_tratamiento` date DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `pacientes`
--

INSERT INTO `pacientes` (`id_paciente`, `id_usuario`, `id_profesional_referencia`, `fecha_nacimiento`, `sexo`, `diagnostico_principal`, `nivel_afasia`, `fecha_inicio_tratamiento`, `observaciones`, `activo`) VALUES
(1, 3, 1, '1968-05-14', 'M', 'Afasia post-ictus', 'moderada', '2026-03-01', 'Presenta dificultades en repetición y denominación.', 1),
(2, 4, 2, '1972-10-21', 'F', 'Afasia motora', 'leve', '2026-03-10', 'Buena comprensión, alteración en fluidez.', 1),
(6, 9, 1, '2004-02-08', 'M', 'pkiDetZNDV6zj3jW:0TqSPbRexYSzdQ6CVU2F7w==:0lUETNruRxo8hIMMqH6L1Aw=', 'leve', '2006-05-08', 'mZtYD+PitoGxswJI:bMT/L0JNeB4m++GCNYufSw==:K6WKdBV9dg==', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `profesionales`
--

CREATE TABLE `profesionales` (
  `id_profesional` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `centro_trabajo` varchar(150) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `foto_perfil` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `profesionales`
--

INSERT INTO `profesionales` (`id_profesional`, `id_usuario`, `centro_trabajo`, `telefono`, `foto_perfil`) VALUES
(1, 1, 'Hospital General', '600111222', '/media/fotosPerfil/profesional_1_1778065312331.png'),
(2, 2, 'Clínica Rehabilita', '600333444', '/media/fotosPerfil/profesional_2_1778434925056.png');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `resultados_ejercicio`
--

CREATE TABLE `resultados_ejercicio` (
  `id_resultado` int(11) NOT NULL,
  `id_sesion_ejercicio` int(11) NOT NULL,
  `numero_intento` int(11) NOT NULL,
  `respuesta_esperada` varchar(255) NOT NULL,
  `respuesta_obtenida` varchar(255) DEFAULT NULL,
  `precision_porcentaje` decimal(5,2) DEFAULT NULL,
  `wer` decimal(6,3) DEFAULT NULL,
  `tiempo_respuesta_ms` int(11) DEFAULT NULL,
  `duracion_habla_ms` int(11) DEFAULT NULL,
  `exito` tinyint(1) DEFAULT NULL,
  `fecha_registro` datetime NOT NULL DEFAULT current_timestamp(),
  `ruta_audio` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `resultados_ejercicio`
--

INSERT INTO `resultados_ejercicio` (`id_resultado`, `id_sesion_ejercicio`, `numero_intento`, `respuesta_esperada`, `respuesta_obtenida`, `precision_porcentaje`, `wer`, `tiempo_respuesta_ms`, `duracion_habla_ms`, `exito`, `fecha_registro`, `ruta_audio`) VALUES
(1, 1, 1, 'casa', 'casa', 100.00, 0.000, 2200, 1200, 1, '2026-04-03 13:11:28', NULL),
(2, 2, 1, 'buenos días', 'buenos dia', 50.00, 0.500, 3400, 1800, 1, '2026-04-03 13:11:28', NULL),
(3, 3, 1, 'mesa', 'misa', 75.00, 1.000, 4100, 1600, 0, '2026-04-03 13:11:28', NULL),
(4, 3, 2, 'mesa', 'mesa', 100.00, 0.000, 3000, 1500, 1, '2026-04-03 13:11:28', NULL),
(5, 4, 1, 'buenos días', 'buenos días', 100.00, 0.000, 2800, 1700, 1, '2026-04-03 13:11:28', NULL),
(7, 22, 1, 'casa', 'casa', 60.00, 0.400, 2200, 1800, 1, '2026-05-04 10:05:00', NULL),
(8, 23, 1, 'buenos días', 'buenos dia', 58.00, 0.420, 2400, 1900, 1, '2026-05-04 10:10:00', NULL),
(9, 24, 1, 'objeto', 'objeto', 62.00, 0.380, 2100, 1700, 1, '2026-05-04 10:15:00', NULL),
(10, 25, 1, 'casa', 'casa', 66.00, 0.340, 2050, 1680, 1, '2026-05-06 10:05:00', NULL),
(11, 26, 1, 'lectura', 'lectura', 68.00, 0.320, 2000, 1650, 1, '2026-05-06 10:10:00', NULL),
(12, 27, 1, 'sílabas', 'sílabas', 65.00, 0.350, 2100, 1700, 1, '2026-05-06 10:15:00', NULL),
(13, 28, 1, 'buenos días', 'buenos días', 72.00, 0.280, 1900, 1550, 1, '2026-05-08 10:05:00', NULL),
(14, 29, 1, 'objeto', 'objeto', 70.00, 0.300, 1950, 1600, 1, '2026-05-08 10:10:00', NULL),
(15, 30, 1, 'lectura', 'lectura', 71.00, 0.290, 1880, 1540, 1, '2026-05-08 10:15:00', NULL),
(16, 31, 1, 'casa', 'casa', 77.00, 0.230, 1750, 1450, 1, '2026-05-10 10:05:00', NULL),
(17, 32, 1, 'objeto', 'objeto', 76.00, 0.240, 1780, 1470, 1, '2026-05-10 10:10:00', NULL),
(18, 33, 1, 'sílabas', 'sílabas', 75.00, 0.250, 1800, 1500, 1, '2026-05-10 10:15:00', NULL),
(19, 34, 1, 'buenos días', 'buenos días', 84.00, 0.160, 1600, 1350, 1, '2026-05-12 10:05:00', NULL),
(20, 35, 1, 'lectura', 'lectura', 83.00, 0.170, 1620, 1360, 1, '2026-05-12 10:10:00', NULL),
(21, 36, 1, 'sílabas', 'sílabas', 82.00, 0.180, 1650, 1380, 1, '2026-05-12 10:15:00', NULL),
(22, 37, 1, 'casa', 'casa', 100.00, 0.000, 15288, 6480, 1, '2026-05-10 23:49:25', NULL),
(23, 38, 2, 'El perro corre.', 'el perro corre', 100.00, 0.000, 19920, 17929, 1, '2026-05-10 23:50:07', NULL),
(24, 39, 1, 'pa-ta-ka', 'pataca', 0.00, 1.000, 16064, 9376, 0, '2026-05-10 23:50:25', NULL),
(25, 40, 1, 'silla', 'silla', 100.00, 0.000, 7176, 4368, 1, '2026-05-10 23:50:33', NULL),
(26, 41, 1, 'buenos días', 'buenos días', 100.00, 0.000, 10800, 4282, 1, '2026-05-10 23:50:45', NULL),
(27, 45, 1, 'silla', 'silla', 100.00, 0.000, 16889, 5064, 1, '2026-05-12 00:32:19', NULL),
(28, 46, 2, 'globo', 'globo', 100.00, 0.000, 5954, 4362, 1, '2026-05-12 00:32:42', NULL),
(29, 47, 1, 'casa', 'casa', 100.00, 0.000, 34090, 12409, 1, '2026-05-12 01:24:43', '/media/audiosPacientes/audio_1778541883095.webm'),
(30, 48, 1, 'silla', 'silla', 100.00, 0.000, 7281, 4017, 1, '2026-05-12 01:24:53', '/media/audiosPacientes/audio_1778541893816.webm'),
(31, 49, 1, 'astilla', 'astilla', 100.00, 0.000, 16232, 5760, 1, '2026-05-12 18:37:18', '/media/audiosPacientes/audio_1778603838682.webm'),
(32, 50, 1, 'El perro corre.', 'el perro corre', 100.00, 0.000, 19104, 11919, 1, '2026-05-13 00:27:30', '/media/audiosPacientes/audio_1778624850195.webm'),
(33, 51, 1, 'silla', 'el flujo silla', 100.00, 2.000, 72310, 4593, 1, '2026-05-13 00:28:44', '/media/audiosPacientes/audio_1778624924382.webm'),
(34, 52, 1, 'buenos días', 'buenos días', 100.00, 0.000, 12924, 2884, 1, '2026-05-13 00:28:58', '/media/audiosPacientes/audio_1778624938410.webm'),
(35, 53, 1, 'globo', '', 0.00, 1.000, 23382, 17392, 0, '2026-05-13 00:29:22', '/media/audiosPacientes/audio_1778624962853.webm'),
(36, 57, 1, 'casa', 'casa', 100.00, 0.000, 5521, 3249, 1, '2026-05-13 11:32:01', '/media/audiosPacientes/audio_1778664721311.webm'),
(37, 58, 1, 'El perro corre.', 'el perro corre', 100.00, 0.000, 8840, 8016, 1, '2026-05-13 11:32:16', '/media/audiosPacientes/audio_1778664736350.webm'),
(41, 64, 1, 'silla', 'silla', 100.00, 0.000, 5112, 3096, 1, '2026-05-13 12:49:12', '/media/audiosPacientes/audio_1778669352938.webm'),
(42, 65, 1, 'miau', 'miau', 100.00, 0.000, 6800, 5632, 1, '2026-05-13 12:49:20', '/media/audiosPacientes/audio_1778669360551.webm'),
(43, 66, 1, 'astilla', 'astilla', 100.00, 0.000, 5040, 3088, 1, '2026-05-13 12:49:28', '/media/audiosPacientes/audio_1778669368617.webm'),
(44, 67, 1, 'casa', 'casa', 100.00, 0.000, 59297, 37433, 1, '2026-05-13 13:16:46', '/media/audiosPacientes/audio_1778671006463.webm'),
(45, 68, 1, 'buenos días', 'buenos días', 100.00, 0.000, 42304, 4624, 1, '2026-05-13 13:17:38', '/media/audiosPacientes/audio_1778671058259.webm'),
(46, 69, 1, 'silla', 'silla', 100.00, 0.000, 110970, 3322, 1, '2026-05-13 13:19:31', '/media/audiosPacientes/audio_1778671171630.webm'),
(47, 70, 1, 'El perro corre.', 'el perro corre', 100.00, 0.000, 10880, 3464, 1, '2026-05-13 13:19:44', '/media/audiosPacientes/audio_1778671184415.webm'),
(48, 71, 1, 'astilla', 'pastilla', 0.00, 1.000, 19544, 11529, 0, '2026-05-13 13:20:05', '/media/audiosPacientes/audio_1778671205548.webm'),
(49, 73, 1, 'silla', 'silla', 100.00, 0.000, 10551, 7024, 1, '2026-05-14 00:00:42', '/media/audiosPacientes/audio_1778709642947.webm'),
(50, 74, 1, 'buenos días', 'buenos días', 100.00, 0.000, 15088, 3497, 1, '2026-05-14 01:34:21', '/media/audiosPacientes/audio_1778715261095.webm'),
(51, 75, 1, 'globo', 'glovo', 0.00, 1.000, 10696, 5801, 0, '2026-05-14 01:34:33', '/media/audiosPacientes/audio_1778715273131.webm'),
(52, 76, 1, 'astilla', 'astilla', 100.00, 0.000, 14912, 4408, 1, '2026-05-14 01:34:49', '/media/audiosPacientes/audio_1778715289286.webm'),
(53, 83, 1, 'El perro corre.', 'el perro corre', 100.00, 0.000, 14904, 5423, 1, '2026-05-14 02:00:25', '/media/audiosPacientes/audio_1778716825701.webm'),
(54, 84, 1, 'buenos días', '', 0.00, 1.000, 9137, 3465, 0, '2026-05-14 02:00:35', '/media/audiosPacientes/audio_1778716835640.webm'),
(55, 85, 1, 'casa', 'casa', 100.00, 0.000, 8857, 2977, 1, '2026-05-14 02:00:46', '/media/audiosPacientes/audio_1778716846176.webm'),
(56, 86, 1, 'miau', 'miau', 100.00, 0.000, 8047, 3608, 1, '2026-05-14 02:00:54', '/media/audiosPacientes/audio_1778716854941.webm'),
(57, 87, 1, 'astilla', 'astilla', 100.00, 0.000, 8304, 3464, 1, '2026-05-14 02:01:05', '/media/audiosPacientes/audio_1778716865326.webm'),
(58, 88, 1, 'casa', 'casa', 100.00, 0.000, 146009, 7985, 1, '2026-05-14 12:26:09', '/media/audiosPacientes/audio_1778754368992.webm'),
(59, 89, 1, 'silla', '', 0.00, 1.000, 43847, 27504, 0, '2026-05-14 12:27:01', '/media/audiosPacientes/audio_1778754421850.webm'),
(60, 90, 1, 'astilla', 'pastilla', 0.00, 1.000, 17440, 6544, 0, '2026-05-14 12:27:20', '/media/audiosPacientes/audio_1778754440534.webm'),
(61, 92, 2, 'cuchara', 'cuchara', 100.00, 0.000, 12776, 11273, 1, '2026-05-15 18:00:23', '/media/audiosPacientes/audio_1778860823603.webm'),
(62, 93, 1, 'cuchara', 'cuchara', 100.00, 0.000, 8106, 5778, 1, '2026-05-15 18:01:08', '/media/audiosPacientes/audio_1778860868247.webm'),
(63, 94, 1, 'El perro corre.', 'el perro corre', 100.00, 0.000, 4568, 3233, 1, '2026-05-15 18:10:13', '/media/audiosPacientes/audio_1778861413828.webm'),
(64, 95, 1, 'casa', 'casa', 100.00, 0.000, 6032, 2937, 1, '2026-05-16 02:10:08', '/media/audiosPacientes/audio_1778890208819.webm'),
(65, 96, 1, 'buenos días', 'buenos días', 100.00, 0.000, 3912, 2841, 1, '2026-05-16 02:10:13', '/media/audiosPacientes/audio_1778890213431.webm'),
(66, 97, 1, 'El perro corre.', 'el perro corre', 100.00, 0.000, 4480, 3711, 1, '2026-05-16 02:10:19', '/media/audiosPacientes/audio_1778890219262.webm');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sesiones`
--

CREATE TABLE `sesiones` (
  `id_sesion` int(11) NOT NULL,
  `id_paciente` int(11) NOT NULL,
  `id_profesional` int(11) DEFAULT NULL,
  `fecha_hora_inicio` datetime NOT NULL,
  `fecha_hora_fin` datetime DEFAULT NULL,
  `estado` enum('pendiente','realizada','revisada','cancelada') NOT NULL DEFAULT 'pendiente',
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `sesiones`
--

INSERT INTO `sesiones` (`id_sesion`, `id_paciente`, `id_profesional`, `fecha_hora_inicio`, `fecha_hora_fin`, `estado`, `observaciones`) VALUES
(1, 1, 1, '2026-04-01 10:00:00', '2026-04-01 10:20:00', 'revisada', 'Sesión inicial de evaluación.'),
(2, 2, 2, '2026-04-02 11:00:00', NULL, 'pendiente', 'Sesión centrada en repetición y lectura.'),
(3, 1, 1, '2026-05-02 19:03:10', NULL, 'cancelada', 'Muy buena sesión para realizar'),
(4, 1, 1, '2026-05-04 10:00:00', '2026-05-04 10:20:00', 'revisada', 'Sesión de prueba 4'),
(5, 1, 1, '2026-05-06 10:00:00', '2026-05-06 10:18:00', 'revisada', 'Sesión de prueba 5'),
(6, 1, 1, '2026-05-08 10:00:00', '2026-05-08 10:22:00', 'realizada', 'Sesión de prueba 6'),
(7, 1, 1, '2026-05-10 10:00:00', '2026-05-10 10:19:00', 'revisada', 'Sesión de prueba 7'),
(8, 1, 1, '2026-05-12 10:00:00', '2026-05-12 10:21:00', 'revisada', 'Sesión de prueba 8'),
(9, 1, 1, '2026-05-10 19:30:38', '2026-05-10 23:50:46', 'revisada', 'Sesión para probar'),
(10, 1, 1, '2026-05-11 17:25:18', '2026-05-12 00:32:44', 'realizada', 'Prueba para denominación imágenes'),
(11, 1, 1, '2026-05-11 23:23:19', '2026-05-12 01:24:54', 'revisada', NULL),
(12, 1, 1, '2026-05-12 16:36:54', '2026-05-12 18:37:23', 'revisada', 'prueba de completar frase'),
(13, 1, 1, '2026-05-12 22:23:29', '2026-05-13 00:29:23', 'revisada', 'GG'),
(14, 1, 1, '2026-05-12 21:54:39', NULL, 'cancelada', NULL),
(15, 1, 1, '2026-05-13 07:31:31', NULL, 'cancelada', NULL),
(16, 1, 1, '2026-05-13 10:36:05', '2026-05-13 12:49:29', 'revisada', NULL),
(17, 1, 1, '2026-05-13 10:49:58', '2026-05-13 13:20:09', 'revisada', NULL),
(18, 1, 1, '2026-05-13 20:00:12', '2026-05-14 00:00:44', 'realizada', NULL),
(19, 1, 1, '2026-05-13 23:33:48', '2026-05-14 01:34:50', 'revisada', NULL),
(20, 1, 1, '2026-05-13 19:54:31', '2026-05-14 02:01:10', 'revisada', NULL),
(21, 1, 1, '2026-05-14 10:18:57', '2026-05-14 12:27:21', 'revisada', NULL),
(22, 1, 1, '2026-05-15 13:53:37', '2026-05-15 18:00:29', 'revisada', NULL),
(23, 1, 1, '2026-05-15 16:00:52', '2026-05-15 18:01:10', 'revisada', NULL),
(24, 1, 1, '2026-05-15 16:10:02', '2026-05-15 18:10:14', 'revisada', NULL),
(25, 6, 1, '2026-05-16 00:08:52', '2026-05-16 02:10:20', 'revisada', 'JD1+KtKVOZKVb4aG:DIyHpgJ1EZdOCe/olXT6yw==:LKELhvMbP8aoEQU=');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sesion_ejercicios`
--

CREATE TABLE `sesion_ejercicios` (
  `id_sesion_ejercicio` int(11) NOT NULL,
  `id_sesion` int(11) NOT NULL,
  `id_ejercicio` int(11) NOT NULL,
  `orden` int(11) NOT NULL,
  `max_intentos` int(11) NOT NULL DEFAULT 1,
  `completado` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `sesion_ejercicios`
--

INSERT INTO `sesion_ejercicios` (`id_sesion_ejercicio`, `id_sesion`, `id_ejercicio`, `orden`, `max_intentos`, `completado`) VALUES
(1, 1, 1, 1, 1, 1),
(2, 1, 2, 2, 1, 1),
(3, 1, 3, 3, 1, 1),
(4, 2, 2, 1, 1, 1),
(5, 2, 4, 2, 1, 0),
(18, 3, 2, 1, 3, 0),
(19, 3, 3, 2, 1, 0),
(20, 3, 5, 3, 5, 0),
(21, 3, 1, 4, 1, 0),
(22, 4, 1, 1, 3, 1),
(23, 4, 2, 2, 3, 1),
(24, 4, 3, 3, 3, 1),
(25, 5, 1, 1, 3, 1),
(26, 5, 4, 2, 3, 1),
(27, 5, 5, 3, 3, 1),
(28, 6, 2, 1, 3, 1),
(29, 6, 3, 2, 3, 1),
(30, 6, 4, 3, 3, 1),
(31, 7, 1, 1, 3, 1),
(32, 7, 3, 2, 3, 1),
(33, 7, 5, 3, 3, 1),
(34, 8, 2, 1, 3, 1),
(35, 8, 4, 2, 3, 1),
(36, 8, 5, 3, 3, 1),
(37, 9, 1, 1, 1, 1),
(38, 9, 4, 2, 2, 1),
(39, 9, 5, 3, 3, 1),
(40, 9, 3, 4, 1, 1),
(41, 9, 2, 5, 2, 1),
(45, 10, 3, 1, 3, 1),
(46, 10, 6, 2, 2, 1),
(47, 11, 1, 1, 1, 1),
(48, 11, 3, 2, 1, 1),
(49, 12, 7, 1, 1, 1),
(50, 13, 4, 1, 1, 1),
(51, 13, 3, 2, 2, 1),
(52, 13, 2, 3, 1, 1),
(53, 13, 6, 4, 1, 1),
(57, 14, 1, 1, 1, 1),
(58, 14, 4, 2, 1, 1),
(59, 14, 3, 3, 1, 0),
(61, 15, 3, 1, 1, 0),
(62, 15, 4, 2, 1, 0),
(63, 15, 7, 3, 1, 0),
(64, 16, 3, 1, 1, 1),
(65, 16, 5, 2, 1, 1),
(66, 16, 7, 3, 1, 1),
(67, 17, 1, 1, 1, 1),
(68, 17, 2, 2, 1, 1),
(69, 17, 3, 3, 1, 1),
(70, 17, 4, 4, 1, 1),
(71, 17, 7, 5, 1, 1),
(73, 18, 3, 1, 2, 1),
(74, 19, 2, 1, 1, 1),
(75, 19, 6, 2, 1, 1),
(76, 19, 7, 3, 1, 1),
(83, 20, 4, 1, 3, 1),
(84, 20, 2, 2, 1, 1),
(85, 20, 1, 3, 1, 1),
(86, 20, 5, 4, 1, 1),
(87, 20, 7, 5, 1, 1),
(88, 21, 1, 1, 1, 1),
(89, 21, 3, 2, 1, 1),
(90, 21, 7, 3, 1, 1),
(92, 22, 8, 1, 3, 1),
(93, 23, 8, 1, 1, 1),
(94, 24, 4, 1, 1, 1),
(95, 25, 1, 1, 1, 1),
(96, 25, 2, 2, 1, 1),
(97, 25, 4, 3, 1, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellidos` varchar(150) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `rol` enum('profesional','paciente') NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `ultima_conexion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `nombre`, `apellidos`, `username`, `password_hash`, `rol`, `activo`, `fecha_creacion`, `ultima_conexion`) VALUES
(1, 'Ana', 'García López', 'user1', 'pbkdf2_sha256$120000$890201dc6add062f8939696fd3567180$469e29f814405a8c72c96c3a80a75b1b94996e1eb0cb6e26873ded9623ac6330', 'profesional', 1, '2026-04-03 13:11:28', '2026-05-16 02:08:39'),
(2, 'Carlos', 'Martínez Ruiz', 'user2', 'pbkdf2_sha256$120000$22d9010845d6acf0a3a5d0e4f1fd3b5c$52ebe9adfe6b9a64e2ea6943f8c9c4254c33fa60a1a0b858b06cae1a4dfb7436', 'profesional', 1, '2026-04-03 13:11:28', '2026-05-13 23:20:28'),
(3, 'Diego', 'López Pérez', 'user3', 'pbkdf2_sha256$120000$4240673b2b1630693ee12178c9a44ce6$b5eb7d9252de72f0a1c006defd9942da25a84f2fe403e8f48c74d6052a831e4d', 'paciente', 1, '2026-04-03 13:11:28', '2026-05-15 17:51:31'),
(4, 'María', 'Sánchez Torres', 'user4', 'pbkdf2_sha256$120000$1141668e922621f4833ddc0a43ea5994$308f783e941392d60871b48620aea376007cd1108f303e6672c6eb9c633be774', 'paciente', 1, '2026-04-03 13:11:28', '2026-05-13 23:21:36'),
(9, 'Jose Mario', 'Cepeda Bustos', 'mcb12', 'pbkdf2_sha256$120000$c372d837d4439016f9dfbb968bc68e9f$68e99d7122537a3016d3804a75702c243e05005f7e3324f8b298042c8f837675', 'paciente', 1, '2026-05-16 01:41:38', '2026-05-16 02:10:00');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `ejercicios`
--
ALTER TABLE `ejercicios`
  ADD PRIMARY KEY (`id_ejercicio`);

--
-- Indices de la tabla `pacientes`
--
ALTER TABLE `pacientes`
  ADD PRIMARY KEY (`id_paciente`),
  ADD UNIQUE KEY `id_usuario` (`id_usuario`),
  ADD KEY `idx_pacientes_profesional` (`id_profesional_referencia`);

--
-- Indices de la tabla `profesionales`
--
ALTER TABLE `profesionales`
  ADD PRIMARY KEY (`id_profesional`),
  ADD UNIQUE KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `resultados_ejercicio`
--
ALTER TABLE `resultados_ejercicio`
  ADD PRIMARY KEY (`id_resultado`),
  ADD UNIQUE KEY `uq_intento_por_sesion_ejercicio` (`id_sesion_ejercicio`,`numero_intento`),
  ADD KEY `idx_resultados_sesion_ejercicio` (`id_sesion_ejercicio`);

--
-- Indices de la tabla `sesiones`
--
ALTER TABLE `sesiones`
  ADD PRIMARY KEY (`id_sesion`),
  ADD KEY `idx_sesiones_paciente` (`id_paciente`),
  ADD KEY `idx_sesiones_profesional` (`id_profesional`);

--
-- Indices de la tabla `sesion_ejercicios`
--
ALTER TABLE `sesion_ejercicios`
  ADD PRIMARY KEY (`id_sesion_ejercicio`),
  ADD UNIQUE KEY `uq_sesion_orden` (`id_sesion`,`orden`),
  ADD KEY `idx_sesion_ejercicios_sesion` (`id_sesion`),
  ADD KEY `idx_sesion_ejercicios_ejercicio` (`id_ejercicio`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `ejercicios`
--
ALTER TABLE `ejercicios`
  MODIFY `id_ejercicio` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `pacientes`
--
ALTER TABLE `pacientes`
  MODIFY `id_paciente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `profesionales`
--
ALTER TABLE `profesionales`
  MODIFY `id_profesional` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `resultados_ejercicio`
--
ALTER TABLE `resultados_ejercicio`
  MODIFY `id_resultado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

--
-- AUTO_INCREMENT de la tabla `sesiones`
--
ALTER TABLE `sesiones`
  MODIFY `id_sesion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT de la tabla `sesion_ejercicios`
--
ALTER TABLE `sesion_ejercicios`
  MODIFY `id_sesion_ejercicio` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=98;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `pacientes`
--
ALTER TABLE `pacientes`
  ADD CONSTRAINT `pacientes_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `pacientes_ibfk_2` FOREIGN KEY (`id_profesional_referencia`) REFERENCES `profesionales` (`id_profesional`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `profesionales`
--
ALTER TABLE `profesionales`
  ADD CONSTRAINT `profesionales_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `resultados_ejercicio`
--
ALTER TABLE `resultados_ejercicio`
  ADD CONSTRAINT `resultados_ejercicio_ibfk_1` FOREIGN KEY (`id_sesion_ejercicio`) REFERENCES `sesion_ejercicios` (`id_sesion_ejercicio`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `sesiones`
--
ALTER TABLE `sesiones`
  ADD CONSTRAINT `sesiones_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `sesiones_ibfk_2` FOREIGN KEY (`id_profesional`) REFERENCES `profesionales` (`id_profesional`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `sesion_ejercicios`
--
ALTER TABLE `sesion_ejercicios`
  ADD CONSTRAINT `sesion_ejercicios_ibfk_1` FOREIGN KEY (`id_sesion`) REFERENCES `sesiones` (`id_sesion`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `sesion_ejercicios_ibfk_2` FOREIGN KEY (`id_ejercicio`) REFERENCES `ejercicios` (`id_ejercicio`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
