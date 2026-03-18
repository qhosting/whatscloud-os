-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 27-05-2025 a las 00:27:49
-- Versión del servidor: 10.4.21-MariaDB
-- Versión de PHP: 8.0.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `chat-dev`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `admins`
--

CREATE TABLE `admins` (
  `id_admin` int(11) NOT NULL,
  `email_admin` text DEFAULT NULL,
  `password_admin` text DEFAULT NULL,
  `rol_admin` text DEFAULT NULL,
  `permissions_admin` text DEFAULT NULL,
  `token_admin` text DEFAULT NULL,
  `token_exp_admin` text DEFAULT NULL,
  `status_admin` int(11) DEFAULT 1,
  `title_admin` text DEFAULT NULL,
  `symbol_admin` text DEFAULT NULL,
  `font_admin` text DEFAULT NULL,
  `color_admin` text DEFAULT NULL,
  `back_admin` text DEFAULT NULL,
  `scode_admin` text DEFAULT NULL,
  `chatgpt_admin` text DEFAULT NULL,
  `date_created_admin` date DEFAULT NULL,
  `date_updated_admin` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `admins`
--

INSERT INTO `admins` (`id_admin`, `email_admin`, `password_admin`, `rol_admin`, `permissions_admin`, `token_admin`, `token_exp_admin`, `status_admin`, `title_admin`, `symbol_admin`, `font_admin`, `color_admin`, `back_admin`, `scode_admin`, `chatgpt_admin`, `date_created_admin`, `date_updated_admin`) VALUES
(1, 'superadmin@chatcenter.com', '$2a$07$azybxcags23425sdg23sdeanQZqjaf6Birm2NvcYTNtJw24CsO5uq', 'superadmin', '{\"todo\":\"on\"}', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3NDgyOTIwNDAsImV4cCI6MTc0ODM3ODQ0MCwiZGF0YSI6eyJpZCI6IjEiLCJlbWFpbCI6InN1cGVyYWRtaW5AY2hhdGNlbnRlci5jb20ifX0.3BYXG5wcx6oSPi9v8C_EFrkeEVG4tY-BRWgEoX__nck', '1748378440', 1, 'ChatCenter', '<i class=\"fas fa-robot\"></i>', '<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">\r\n<link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>\r\n<link href=\"https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap\" rel=\"stylesheet\">', '#03300c', 'http://cms-chatcenter.com/views/assets/files/68004d2030bd548.jpg', NULL, NULL, '2025-04-16', '2025-05-26 20:40:40'),
(2, 'admin@chatcenter.com', '$2a$07$azybxcags23425sdg23sdeanQZqjaf6Birm2NvcYTNtJw24CsO5uq', 'admin', '%7B%22TODO%22%3A%22ON%22%7D', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3NDQ4NTA0MjIsImV4cCI6MTc0NDkzNjgyMiwiZGF0YSI6eyJpZCI6IjIiLCJlbWFpbCI6ImFkbWluQGNoYXRjZW50ZXIuY29tIn19.z6OIEirlO6IMxkvsAPd3AyLFsteAQ3OsmUHL69ZJV0k', '1744936822', 1, '', '', '', '', '', '', '%7B%7D', '2025-04-16', '2025-04-17 00:40:22'),
(3, 'editor-archivos@chatcenter.com', '$2a$07$azybxcags23425sdg23sdeanQZqjaf6Birm2NvcYTNtJw24CsO5uq', 'editor', '%7B%22archivos%22%3A%22ON%22%7D', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3NDQ4NTA1NTIsImV4cCI6MTc0NDkzNjk1MiwiZGF0YSI6eyJpZCI6IjMiLCJlbWFpbCI6ImVkaXRvci1hcmNoaXZvc0BjaGF0Y2VudGVyLmNvbSJ9fQ.iEMezbNByxDkoSpbg9AeJ1V7024YpJjyJv2hfpPJ_WY', '1744936952', 1, '', '', '', '', '', '', '%7B%7D', '2025-04-16', '2025-04-17 00:42:32');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `bots`
--

CREATE TABLE `bots` (
  `id_bot` int(11) NOT NULL,
  `title_bot` text DEFAULT NULL,
  `type_bot` text DEFAULT NULL,
  `header_text_bot` text DEFAULT NULL,
  `header_image_bot` text DEFAULT NULL,
  `header_video_bot` text DEFAULT NULL,
  `body_text_bot` text DEFAULT NULL,
  `footer_text_bot` text DEFAULT NULL,
  `interactive_bot` text DEFAULT NULL,
  `buttons_bot` text DEFAULT NULL,
  `list_bot` text DEFAULT NULL,
  `title_list_bot` text DEFAULT NULL,
  `date_created_bot` date DEFAULT NULL,
  `date_updated_bot` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `bots`
--

INSERT INTO `bots` (`id_bot`, `title_bot`, `type_bot`, `header_text_bot`, `header_image_bot`, `header_video_bot`, `body_text_bot`, `footer_text_bot`, `interactive_bot`, `buttons_bot`, `list_bot`, `title_list_bot`, `date_created_bot`, `date_updated_bot`) VALUES
(1, 'conversation', 'text', '', '', '', 'En instantes un agente se comunicará para conversar contigo', '', 'none', '{}', '[]', NULL, '2025-04-18', '2025-04-18 19:19:40'),
(2, 'welcome', 'interactive', '', 'https%3A%2F%2Fres.cloudinary.com%2Fdv7wctcfp%2Fimage%2Fupload%2Fv1746557262%2Fxouxwsikai7uvavvfkcg.jpg', '', 'Bienvenid%40+a+%2ARestaurant%2A%2C+soy+el+asistente+virtual+que+te+atender%C3%A1+el+d%C3%ADa+de+hoy%2C+estoy+muy+entusiasmado+por+servirte+%2A%C2%BFQu%C3%A9+deseas+realizar+hoy%3F%2A', '', 'button', '%7B%221%22%3A%22Realizar+un+pedido%22%2C%222%22%3A%22Reservar+mesa%22%2C%223%22%3A%22Servicio+al+cliente%22%7D', '%5B%5D', NULL, '2025-05-06', '2025-05-06 18:49:58'),
(3, 'reservation', 'text', '', '', '', 'Perfecto%2C+vamos+a+reservar+una+mesa+%F0%9F%AA%91+%5CnPor+favor+ind%C3%ADcame+la+siguiente+informaci%C3%B3n%3A%5Cn%F0%9F%93%85+Fecha%3A%5Cn%F0%9F%95%92+Hora%3A%5Cn%F0%9F%91%A5+N%C3%BAmero+de+personas%3A%5Cn%F0%9F%93%9E+Tu+nombre+y+n%C3%BAmero+de+contacto%3A', '', 'none', '%7B%7D', '%5B%5D', NULL, '2025-05-06', '2025-05-06 20:18:33'),
(4, 'menu', 'interactive', '', '', '', '¡Qué rico! 😋 Te comparto nuestro menú', '', 'list', '{}', '[{\"id\":\"1\",\"title\":\"Entradas\",\"description\":\"Quiero una deliciosa entrada\"},{\"id\":\"2\",\"title\":\"Platos Fuertes\",\"description\":\"Quiero una deliciosa receta\"},{\"id\":\"3\",\"title\":\"Postres\",\"description\":\"Quiero un delicioso postre\"},{\"id\":\"4\",\"title\":\"Bebidas\",\"description\":\"Quiero una deliciosa bebida\"},{\"id\":\"contactar\",\"title\":\"Contactar un asistente\",\"description\":\"Atención Personalizada\"}]', 'Menú', '2025-05-06', '2025-05-08 17:43:45'),
(5, 'listMenu', 'interactive', '', '', '', 'Selecciona una de nuestras delicias', 'O regresa al menú principal escribiendo *menu*', 'none', '{}', '[]', '', '2025-05-08', '2025-05-08 17:30:45'),
(6, 'reset', 'interactive', '', '', '', '*Elige entre las siguientes opciones:*\\n- Otra delicia de nuestro menú \\n- Contactar un asistente\\n- Ya está listo mi pedido', '', 'list', '{}', '[{\"id\":\"1\",\"title\":\"Entradas\",\"description\":\"Quiero una deliciosa entrada\"},{\"id\":\"2\",\"title\":\"Platos Fuertes\",\"description\":\"Quiero una deliciosa receta\"},{\"id\":\"3\",\"title\":\"Postres\",\"description\":\"Quiero un delicioso postre\"},{\"id\":\"4\",\"title\":\"Bebidas\",\"description\":\"Quiero una deliciosa bebida\"},{\"id\":\"contactar\",\"title\":\"Contactar un asistente\",\"description\":\"Atención Personalizada\"},{\"id\":\"domicilio\",\"title\":\"Ya está listo mi pedido\",\"description\":\"Dar mi datos para el domicilio\"}]', 'Menú', '2025-05-08', '2025-05-08 17:43:30'),
(7, 'delivery', 'text', '', '', '', '¡Qué buena elección! 👍 A continuación comenzaré a pedirte la siguiente información', '', 'none', '{}', '[]', '', '2025-05-08', '2025-05-08 18:14:17'),
(8, 'name', 'text', '', '', '', 'Escribe+tu+nombre+y+apellido+en+un+mismo+rengl%C3%B3n', '', 'none', '%7B%7D', '%5B%5D', '', '2025-05-08', '2025-05-08 20:54:41'),
(9, 'phone', 'text', '', '', '', 'Escribe+tu+n%C3%BAmero+celular%2C+sin+espacios%2C+s%C3%B3lo+n%C3%BAmeros', '', 'none', '%7B%7D', '%5B%5D', '', '2025-05-08', '2025-05-08 20:55:11'),
(10, 'email', 'text', '', '', '', 'Escribe+tu+correo+electr%C3%B3nico', '', 'none', '%7B%7D', '%5B%5D', '', '2025-05-08', '2025-05-08 20:55:29'),
(11, 'address', 'text', '', '', '', 'Escribe+tu+direcci%C3%B3n+en+un+solo+rengl%C3%B3n%2C+agrega+datos+como+barrio%2C+apto%2C+bloque%2C+urbanizaci%C3%B3n+si+es+necesario', '', 'none', '%7B%7D', '%5B%5D', '', '2025-05-08', '2025-05-08 20:55:57'),
(12, 'process', 'text', '', '', '', 'Epera+un+momento%2C+estamos+procesando+tu+pedido', '', 'none', '%7B%7D', '%5B%5D', '', '2025-05-08', '2025-05-08 20:59:34'),
(13, 'confirmation', 'interactive', 'Confirma tu pedido', '', '', '', '¿Está bien tu pedido?', 'button', '{\"1\":\"Si\",\"2\":\"No, Corregir\"}', '[]', '', '2025-05-08', '2025-05-08 21:18:32'),
(14, 'checkout', 'text', '', '', '', 'Continua+con+nuestra+%2Apasarela+de+pagos%2A+para+finalizar+el+pedido.+%C2%A1Finalizado+el+pago+%2Apor+favor+env%C3%ADa+el+comprobante%2A+para+despachar+el+pedido%21%5Cn%5CnHaz+el+pago+ac%C3%A1%3A+https%3A%2F%2Fpaypal.me%2Fjuanunat%2F', '', 'none', '%7B%7D', '%5B%5D', '', '2025-05-08', '2025-05-09 00:12:52');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categories`
--

CREATE TABLE `categories` (
  `id_category` int(11) NOT NULL,
  `title_category` text DEFAULT NULL,
  `date_created_category` date DEFAULT NULL,
  `date_updated_category` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `categories`
--

INSERT INTO `categories` (`id_category`, `title_category`, `date_created_category`, `date_updated_category`) VALUES
(1, 'Entradas', '2025-05-08', '2025-05-08 16:14:25'),
(2, 'Platos+Fuertes', '2025-05-08', '2025-05-08 16:14:38'),
(3, 'Postres', '2025-05-08', '2025-05-08 16:14:49'),
(4, 'Bebidas', '2025-05-08', '2025-05-08 16:14:57');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `columns`
--

CREATE TABLE `columns` (
  `id_column` int(11) NOT NULL,
  `id_module_column` int(11) DEFAULT 0,
  `title_column` text DEFAULT NULL,
  `alias_column` text DEFAULT NULL,
  `type_column` text DEFAULT NULL,
  `matrix_column` text DEFAULT NULL,
  `visible_column` int(11) DEFAULT 1,
  `date_created_column` date DEFAULT NULL,
  `date_updated_column` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `columns`
--

INSERT INTO `columns` (`id_column`, `id_module_column`, `title_column`, `alias_column`, `type_column`, `matrix_column`, `visible_column`, `date_created_column`, `date_updated_column`) VALUES
(1, 2, 'rol_admin', 'rol', 'select', 'superadmin,admin,editor', 1, '2025-04-16', '2025-04-17 00:00:11'),
(2, 2, 'permissions_admin', 'permisos', 'object', '', 1, '2025-04-16', '2025-04-17 00:00:11'),
(3, 2, 'email_admin', 'email', 'email', '', 1, '2025-04-16', '2025-04-17 00:00:11'),
(4, 2, 'password_admin', 'pass', 'password', '', 0, '2025-04-16', '2025-04-17 00:00:11'),
(5, 2, 'token_admin', 'token', 'text', '', 0, '2025-04-16', '2025-04-17 00:00:11'),
(6, 2, 'token_exp_admin', 'expiración', 'text', '', 0, '2025-04-16', '2025-04-17 00:00:11'),
(7, 2, 'status_admin', 'estado', 'boolean', '', 1, '2025-04-16', '2025-04-17 00:00:11'),
(8, 2, 'title_admin', 'título', 'text', '', 0, '2025-04-16', '2025-04-17 00:00:11'),
(9, 2, 'symbol_admin', 'simbolo', 'text', '', 0, '2025-04-16', '2025-04-17 00:00:11'),
(10, 2, 'font_admin', 'tipografía', 'text', '', 0, '2025-04-16', '2025-04-17 00:00:12'),
(11, 2, 'color_admin', 'color', 'text', '', 0, '2025-04-16', '2025-04-17 00:00:12'),
(12, 2, 'back_admin', 'fondo', 'text', '', 0, '2025-04-16', '2025-04-17 00:00:12'),
(13, 2, 'scode_admin', 'seguridad', 'text', '', 0, '2025-04-16', '2025-04-17 00:00:12'),
(14, 2, 'chatgpt_admin', 'chatgpt', 'object', '', 0, '2025-04-16', '2025-04-17 00:00:12'),
(17, 6, 'number_whatsapp', 'Número', 'text', NULL, 1, '2025-04-17', '2025-04-17 15:34:43'),
(18, 6, 'id_number_whatsapp', 'Id Número', 'text', NULL, 1, '2025-04-17', '2025-04-17 15:34:43'),
(19, 6, 'id_app_whatsapp', 'Id App', 'text', NULL, 1, '2025-04-17', '2025-04-17 15:34:43'),
(20, 6, 'token_whatsapp', 'Token', 'text', NULL, 1, '2025-04-17', '2025-04-17 15:34:43'),
(21, 6, 'status_whatsapp', 'Estado', 'boolean', NULL, 1, '2025-04-17', '2025-04-17 15:34:43'),
(22, 6, 'ai_whatsapp', 'Asistente IA', 'boolean', NULL, 1, '2025-04-17', '2025-04-17 15:34:44'),
(23, 8, 'id_conversation_message', 'Conversación', 'text', NULL, 1, '2025-04-17', '2025-04-17 19:14:40'),
(24, 8, 'type_message', 'Tipo', 'select', NULL, 1, '2025-04-17', '2025-04-17 19:14:40'),
(25, 8, 'id_whatsapp_message', 'API-WS', 'relations', NULL, 1, '2025-04-17', '2025-04-17 19:14:40'),
(26, 8, 'client_message', 'Cliente', 'code', NULL, 1, '2025-04-17', '2025-04-17 19:14:41'),
(27, 8, 'business_message', 'Negocio', 'code', NULL, 1, '2025-04-17', '2025-04-17 19:14:41'),
(28, 8, 'template_message', 'Plantilla', 'object', NULL, 1, '2025-04-17', '2025-04-17 19:14:41'),
(29, 8, 'expiration_message', 'Expiración', 'datetime', NULL, 1, '2025-04-17', '2025-04-17 19:14:41'),
(30, 8, 'order_message', 'Orden', 'int', NULL, 1, '2025-04-17', '2025-04-17 19:14:41'),
(31, 8, 'initial_message', 'Asistencia Manual', 'int', NULL, 1, '2025-04-17', '2025-04-17 19:14:42'),
(32, 8, 'phone_message', 'Teléfono', 'text', NULL, 1, '2025-04-18', '2025-04-18 16:26:11'),
(33, 10, 'title_bot', 'Título', 'text', NULL, 1, '2025-04-18', '2025-04-18 17:17:28'),
(34, 10, 'type_bot', 'Tipo', 'select', 'text,interactive', 1, '2025-04-18', '2025-04-18 17:19:19'),
(35, 10, 'header_text_bot', 'Header Text', 'text', NULL, 1, '2025-04-18', '2025-04-18 17:17:28'),
(36, 10, 'header_image_bot', 'Header Image', 'image', NULL, 1, '2025-04-18', '2025-04-18 17:17:29'),
(37, 10, 'header_video_bot', 'Header Video', 'video', NULL, 1, '2025-04-18', '2025-04-18 17:17:29'),
(38, 10, 'body_text_bot', 'Body Text', 'textarea', NULL, 1, '2025-04-18', '2025-04-18 17:17:29'),
(39, 10, 'footer_text_bot', 'Footer Text', 'text', NULL, 1, '2025-04-18', '2025-04-18 17:17:30'),
(40, 10, 'interactive_bot', 'Tipo de interacción', 'select', 'none,button,list', 1, '2025-04-18', '2025-04-18 17:21:12'),
(41, 10, 'buttons_bot', 'Botones', 'object', NULL, 1, '2025-04-18', '2025-04-18 17:17:30'),
(42, 10, 'list_bot', 'Lista', 'json', NULL, 1, '2025-04-18', '2025-04-18 17:17:30'),
(43, 12, 'phone_contact', 'Teléfono', 'text', NULL, 1, '2025-04-18', '2025-04-18 17:42:31'),
(44, 12, 'name_contact', 'Nombre', 'text', NULL, 1, '2025-04-18', '2025-04-18 17:42:32'),
(45, 12, 'ai_contact', 'Asistente IA', 'boolean', NULL, 1, '2025-04-18', '2025-04-18 17:42:32'),
(46, 10, 'title_list_bot', 'Título Lista', 'text', NULL, 1, '2025-05-06', '2025-05-06 20:44:39'),
(47, 14, 'title_category', 'Título', 'text', NULL, 1, '2025-05-08', '2025-05-08 16:14:07'),
(48, 16, 'title_product', 'Título', 'text', NULL, 1, '2025-05-08', '2025-05-08 16:19:36'),
(49, 16, 'id_category_product', 'Categoría', 'relations', 'categories', 1, '2025-05-08', '2025-05-08 16:19:54'),
(50, 16, 'price_product', 'Precio', 'money', NULL, 1, '2025-05-08', '2025-05-08 16:19:37'),
(51, 16, 'code_product', 'Código', 'text', NULL, 1, '2025-05-08', '2025-05-08 16:19:37'),
(52, 18, 'conversation_order', 'Conversación', 'text', NULL, 1, '2025-05-08', '2025-05-08 22:30:39'),
(53, 18, 'products_order', 'Productos', 'text', NULL, 1, '2025-05-08', '2025-05-08 22:30:40'),
(54, 18, 'phone_order', 'Celular', 'text', NULL, 1, '2025-05-08', '2025-05-08 22:30:40'),
(55, 18, 'name_order', 'Nombre', 'text', NULL, 1, '2025-05-08', '2025-05-08 22:30:40'),
(56, 18, 'email_order', 'Email', 'email', NULL, 1, '2025-05-08', '2025-05-08 22:30:41'),
(57, 18, 'address_order', 'Dirección', 'text', NULL, 1, '2025-05-08', '2025-05-08 22:30:41'),
(58, 18, 'contact_order', 'Contacto', 'text', NULL, 1, '2025-05-08', '2025-05-08 22:30:41'),
(59, 18, 'total_order', 'Total', 'money', NULL, 1, '2025-05-08', '2025-05-08 22:30:41'),
(60, 18, 'status_order', 'Estado', 'select', 'Pendiente,En Preparación,En Domicilio,Entregado', 1, '2025-05-08', '2025-05-08 22:41:05'),
(61, 20, 'title_prompt', 'Título', 'text', NULL, 1, '2025-05-13', '2025-05-13 19:26:46'),
(62, 20, 'content_prompt', 'Contenido', 'code', NULL, 1, '2025-05-13', '2025-05-13 19:26:46'),
(63, 20, 'status_prompt', 'Estado', 'boolean', NULL, 1, '2025-05-13', '2025-05-13 19:26:46');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `contacts`
--

CREATE TABLE `contacts` (
  `id_contact` int(11) NOT NULL,
  `phone_contact` text DEFAULT NULL,
  `name_contact` text DEFAULT NULL,
  `ai_contact` int(11) DEFAULT 1,
  `date_created_contact` date DEFAULT NULL,
  `date_updated_contact` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `contacts`
--

INSERT INTO `contacts` (`id_contact`, `phone_contact`, `name_contact`, `ai_contact`, `date_created_contact`, `date_updated_contact`) VALUES
(3, '573022258002', 'Tutoriales a tu Alcance', 0, '2025-05-22', '2025-05-26 21:37:17'),
(4, '573003331450', NULL, 1, '2025-05-22', '2025-05-23 01:28:05'),
(5, '573032456789', NULL, 0, '2025-05-22', '2025-05-23 01:17:18'),
(6, '573212229876', NULL, 1, '2025-05-22', '2025-05-23 01:28:05');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `files`
--

CREATE TABLE `files` (
  `id_file` int(11) NOT NULL,
  `id_folder_file` int(11) DEFAULT 0,
  `name_file` text DEFAULT NULL,
  `extension_file` text DEFAULT NULL,
  `type_file` text DEFAULT NULL,
  `size_file` double DEFAULT 0,
  `link_file` text DEFAULT NULL,
  `thumbnail_vimeo_file` text DEFAULT NULL,
  `id_mailchimp_file` text DEFAULT NULL,
  `date_created_file` date DEFAULT NULL,
  `date_updated_file` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `files`
--

INSERT INTO `files` (`id_file`, `id_folder_file`, `name_file`, `extension_file`, `type_file`, `size_file`, `link_file`, `thumbnail_vimeo_file`, `id_mailchimp_file`, `date_created_file`, `date_updated_file`) VALUES
(1, 1, '67f54beee0e7546', 'jpg', 'image/jpeg', 204485, 'http://cms-chatcenter.com/views/assets/files/68004d2030bd548.jpg', NULL, NULL, '2025-04-17', '2025-04-18 21:39:04'),
(3, 1, '67f557e4564f048', 'png', 'image/png', 544340, 'http://cms-chatcenter.com/views/assets/files/6812890bcf30915.png', NULL, NULL, '2025-04-30', '2025-04-30 20:33:15'),
(4, 1, '67fd7513f335a27', 'mp3', 'audio/mpeg', 10046, 'http://cms-chatcenter.com/views/assets/files/68143a7deacde37.mp3', NULL, NULL, '2025-05-02', '2025-05-02 03:22:37'),
(5, 1, '67fd7513f345f27', 'mp3', 'audio/mpeg', 2126, 'http://cms-chatcenter.com/views/assets/files/68143bbc3cafe56.mp3', NULL, NULL, '2025-05-02', '2025-05-02 03:27:56');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `folders`
--

CREATE TABLE `folders` (
  `id_folder` int(11) NOT NULL,
  `name_folder` text DEFAULT NULL,
  `size_folder` text DEFAULT NULL,
  `total_folder` double DEFAULT 0,
  `max_upload_folder` text DEFAULT NULL,
  `url_folder` text DEFAULT NULL,
  `keys_folder` text DEFAULT NULL,
  `date_created_folder` date DEFAULT NULL,
  `date_updated_folder` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `folders`
--

INSERT INTO `folders` (`id_folder`, `name_folder`, `size_folder`, `total_folder`, `max_upload_folder`, `url_folder`, `keys_folder`, `date_created_folder`, `date_updated_folder`) VALUES
(1, 'Server', '200000000000', 760997, '500000000', 'http://cms-chatcenter.com', NULL, '2025-04-16', '2025-05-02 03:27:56');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `messages`
--

CREATE TABLE `messages` (
  `id_message` int(11) NOT NULL,
  `id_conversation_message` text DEFAULT NULL,
  `type_message` text DEFAULT NULL,
  `id_whatsapp_message` int(11) DEFAULT 0,
  `client_message` longtext DEFAULT NULL,
  `business_message` longtext DEFAULT NULL,
  `template_message` text DEFAULT NULL,
  `expiration_message` datetime DEFAULT NULL,
  `order_message` int(11) DEFAULT 0,
  `initial_message` int(11) DEFAULT 0,
  `phone_message` text DEFAULT NULL,
  `date_created_message` date DEFAULT NULL,
  `date_updated_message` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `messages`
--

INSERT INTO `messages` (`id_message`, `id_conversation_message`, `type_message`, `id_whatsapp_message`, `client_message`, `business_message`, `template_message`, `expiration_message`, `order_message`, `initial_message`, `phone_message`, `date_created_message`, `date_updated_message`) VALUES
(22, '', 'client', 1, 'Buenas noches', NULL, '', '0000-00-00 00:00:00', 0, 0, '573022258002', '2025-05-22', '2025-05-23 01:11:30'),
(23, 'c7ddcb50129839c421a333343d9ef810', 'business', 1, NULL, 'Bienvenid@ a *Restaurant*, soy el asistente virtual que te atenderá el día de hoy, estoy muy entusiasmado por servirte *¿Qué deseas realizar hoy?*', '{\"type\":\"bot\",\"title\":\"welcome\"}', '2025-05-23 22:36:00', 1, 0, '573022258002', '2025-05-22', '2025-05-23 01:11:33'),
(24, 'c7ddcb50129839c421a333343d9ef810', 'client', 1, '{\"id\":\"1\",\"text\":\"Realizar un pedido\"}', NULL, '{\"type\":\"bot\",\"title\":\"welcome\"}', '2025-05-23 22:36:00', 2, 0, '573022258002', '2025-05-22', '2025-05-23 01:11:39'),
(25, 'c7ddcb50129839c421a333343d9ef810', 'business', 1, NULL, '¡Qué rico! 😋 Te comparto nuestro menú', '{\"type\":\"bot\",\"title\":\"menu\"}', '2025-05-23 22:36:00', 3, 0, '573022258002', '2025-05-22', '2025-05-23 01:11:41'),
(26, 'c7ddcb50129839c421a333343d9ef810', 'client', 1, '{\"id\":\"1\",\"text\":\"Entradas\"}', NULL, '{\"type\":\"bot\",\"title\":\"menu\"}', '2025-05-23 22:36:00', 4, 0, '573022258002', '2025-05-22', '2025-05-23 01:11:49'),
(27, 'c7ddcb50129839c421a333343d9ef810', 'business', 1, NULL, 'Selecciona una de nuestras delicias', '{\"type\":\"bot\",\"title\":\"listMenu\"}', '2025-05-23 22:36:00', 5, 0, '573022258002', '2025-05-22', '2025-05-23 01:11:51'),
(28, 'c7ddcb50129839c421a333343d9ef810', 'client', 1, '{\"id\":\"sku002\",\"text\":\"Nachos de la Casa\"}', NULL, '{\"type\":\"bot\",\"title\":\"listMenu\"}', '2025-05-23 22:36:00', 6, 0, '573022258002', '2025-05-22', '2025-05-23 01:11:57'),
(29, 'c7ddcb50129839c421a333343d9ef810', 'business', 1, NULL, '*Elige entre las siguientes opciones:*\\n- Otra delicia de nuestro menú \\n- Contactar un asistente\\n- Ya está listo mi pedido', '{\"type\":\"bot\",\"title\":\"reset\"}', '2025-05-23 22:36:00', 7, 0, '573022258002', '2025-05-22', '2025-05-23 01:11:59'),
(30, 'c7ddcb50129839c421a333343d9ef810', 'client', 1, '{\"id\":\"2\",\"text\":\"Platos Fuertes\"}', NULL, '{\"type\":\"bot\",\"title\":\"reset\"}', '2025-05-23 22:36:00', 8, 0, '573022258002', '2025-05-22', '2025-05-23 01:12:03'),
(31, 'c7ddcb50129839c421a333343d9ef810', 'business', 1, NULL, 'Selecciona una de nuestras delicias', '{\"type\":\"bot\",\"title\":\"listMenu\"}', '2025-05-23 22:36:00', 9, 0, '573022258002', '2025-05-22', '2025-05-23 01:12:05'),
(32, 'c7ddcb50129839c421a333343d9ef810', 'client', 1, '{\"id\":\"sku005\",\"text\":\"Costillas BBQ\"}', NULL, '{\"type\":\"bot\",\"title\":\"listMenu\"}', '2025-05-23 22:36:00', 10, 0, '573022258002', '2025-05-22', '2025-05-23 01:12:18'),
(33, 'c7ddcb50129839c421a333343d9ef810', 'business', 1, NULL, '*Elige entre las siguientes opciones:*\\n- Otra delicia de nuestro menú \\n- Contactar un asistente\\n- Ya está listo mi pedido', '{\"type\":\"bot\",\"title\":\"reset\"}', '2025-05-23 22:36:00', 11, 0, '573022258002', '2025-05-22', '2025-05-23 01:12:20'),
(34, 'c7ddcb50129839c421a333343d9ef810', 'client', 1, '{\"id\":\"3\",\"text\":\"Postres\"}', NULL, '{\"type\":\"bot\",\"title\":\"reset\"}', '2025-05-23 22:36:00', 12, 0, '573022258002', '2025-05-22', '2025-05-23 01:12:34'),
(35, 'c7ddcb50129839c421a333343d9ef810', 'business', 1, NULL, 'Selecciona una de nuestras delicias', '{\"type\":\"bot\",\"title\":\"listMenu\"}', '2025-05-23 22:36:00', 13, 0, '573022258002', '2025-05-22', '2025-05-23 01:12:36'),
(36, 'c7ddcb50129839c421a333343d9ef810', 'client', 1, '{\"id\":\"sku010\",\"text\":\"Tres Leches\"}', NULL, '{\"type\":\"bot\",\"title\":\"listMenu\"}', '2025-05-23 22:36:00', 14, 0, '573022258002', '2025-05-22', '2025-05-23 01:12:42'),
(37, 'c7ddcb50129839c421a333343d9ef810', 'business', 1, NULL, '*Elige entre las siguientes opciones:*\\n- Otra delicia de nuestro menú \\n- Contactar un asistente\\n- Ya está listo mi pedido', '{\"type\":\"bot\",\"title\":\"reset\"}', '2025-05-23 22:36:00', 15, 0, '573022258002', '2025-05-22', '2025-05-23 01:12:44'),
(38, 'c7ddcb50129839c421a333343d9ef810', 'client', 1, '{\"id\":\"1\",\"text\":\"Entradas\"}', NULL, '{\"type\":\"bot\",\"title\":\"reset\"}', '2025-05-23 22:36:00', 16, 0, '573022258002', '2025-05-22', '2025-05-23 01:12:48'),
(39, 'c7ddcb50129839c421a333343d9ef810', 'business', 1, NULL, 'Selecciona una de nuestras delicias', '{\"type\":\"bot\",\"title\":\"listMenu\"}', '2025-05-23 22:36:00', 17, 0, '573022258002', '2025-05-22', '2025-05-23 01:12:50'),
(40, 'c7ddcb50129839c421a333343d9ef810', 'client', 1, '{\"id\":\"sku001\",\"text\":\"Papas Rústicas\"}', NULL, '{\"type\":\"bot\",\"title\":\"listMenu\"}', '2025-05-23 22:36:00', 18, 0, '573022258002', '2025-05-22', '2025-05-23 01:12:56'),
(41, 'c7ddcb50129839c421a333343d9ef810', 'business', 1, NULL, '*Elige entre las siguientes opciones:*\\n- Otra delicia de nuestro menú \\n- Contactar un asistente\\n- Ya está listo mi pedido', '{\"type\":\"bot\",\"title\":\"reset\"}', '2025-05-23 22:36:00', 19, 0, '573022258002', '2025-05-22', '2025-05-23 01:12:58'),
(42, 'c7ddcb50129839c421a333343d9ef810', 'client', 1, '{\"id\":\"2\",\"text\":\"Platos Fuertes\"}', NULL, '{\"type\":\"bot\",\"title\":\"reset\"}', '2025-05-23 22:36:00', 20, 0, '573022258002', '2025-05-22', '2025-05-23 01:13:03'),
(43, 'c7ddcb50129839c421a333343d9ef810', 'business', 1, NULL, 'Selecciona una de nuestras delicias', '{\"type\":\"bot\",\"title\":\"listMenu\"}', '2025-05-23 22:36:00', 21, 0, '573022258002', '2025-05-22', '2025-05-23 01:13:07'),
(44, 'c7ddcb50129839c421a333343d9ef810', 'client', 1, '{\"id\":\"sku007\",\"text\":\"Lasagna de la Casa\"}', NULL, '{\"type\":\"bot\",\"title\":\"listMenu\"}', '2025-05-23 22:36:00', 22, 0, '573022258002', '2025-05-22', '2025-05-23 01:13:13'),
(45, 'c7ddcb50129839c421a333343d9ef810', 'business', 1, NULL, '*Elige entre las siguientes opciones:*\\n- Otra delicia de nuestro menú \\n- Contactar un asistente\\n- Ya está listo mi pedido', '{\"type\":\"bot\",\"title\":\"reset\"}', '2025-05-23 22:36:00', 23, 0, '573022258002', '2025-05-22', '2025-05-23 01:13:15'),
(46, 'c7ddcb50129839c421a333343d9ef810', 'client', 1, '{\"id\":\"3\",\"text\":\"Postres\"}', NULL, '{\"type\":\"bot\",\"title\":\"reset\"}', '2025-05-23 22:36:00', 24, 0, '573022258002', '2025-05-22', '2025-05-23 01:13:19'),
(47, 'c7ddcb50129839c421a333343d9ef810', 'business', 1, NULL, 'Selecciona una de nuestras delicias', '{\"type\":\"bot\",\"title\":\"listMenu\"}', '2025-05-23 22:36:00', 25, 0, '573022258002', '2025-05-22', '2025-05-23 01:13:21'),
(48, 'c7ddcb50129839c421a333343d9ef810', 'client', 1, '{\"id\":\"sku008\",\"text\":\"Flan de Caramelo\"}', NULL, '{\"type\":\"bot\",\"title\":\"listMenu\"}', '2025-05-23 22:36:00', 26, 0, '573022258002', '2025-05-22', '2025-05-23 01:13:26'),
(49, 'c7ddcb50129839c421a333343d9ef810', 'business', 1, NULL, '*Elige entre las siguientes opciones:*\\n- Otra delicia de nuestro menú \\n- Contactar un asistente\\n- Ya está listo mi pedido', '{\"type\":\"bot\",\"title\":\"reset\"}', '2025-05-23 22:36:00', 27, 0, '573022258002', '2025-05-22', '2025-05-23 01:13:29'),
(50, 'c7ddcb50129839c421a333343d9ef810', 'client', 1, '{\"id\":\"domicilio\",\"text\":\"Ya está listo mi pedido\"}', NULL, '{\"type\":\"bot\",\"title\":\"reset\"}', '2025-05-23 22:36:00', 28, 0, '573022258002', '2025-05-22', '2025-05-23 01:13:35'),
(51, 'c7ddcb50129839c421a333343d9ef810', 'business', 1, NULL, '¡Qué buena elección! 👍 A continuación comenzaré a pedirte la siguiente información', '{\"type\":\"bot\",\"title\":\"delivery\"}', '2025-05-23 22:36:00', 29, 0, '573022258002', '2025-05-22', '2025-05-23 01:13:37'),
(52, 'c7ddcb50129839c421a333343d9ef810', 'business', 1, NULL, 'Escribe+tu+nombre+y+apellido+en+un+mismo+rengl%C3%B3n', '{\"type\":\"bot\",\"title\":\"name\"}', '2025-05-23 22:36:00', 30, 0, '573022258002', '2025-05-22', '2025-05-23 01:13:38'),
(53, 'c7ddcb50129839c421a333343d9ef810', 'client', 1, 'Julio Pérez', NULL, '{\"type\":\"bot\",\"title\":\"name\"}', '2025-05-23 22:36:00', 31, 0, '573022258002', '2025-05-22', '2025-05-23 01:13:45'),
(54, 'c7ddcb50129839c421a333343d9ef810', 'business', 1, NULL, 'Escribe+tu+n%C3%BAmero+celular%2C+sin+espacios%2C+s%C3%B3lo+n%C3%BAmeros', '{\"type\":\"bot\",\"title\":\"phone\"}', '2025-05-23 22:36:00', 32, 0, '573022258002', '2025-05-22', '2025-05-23 01:13:47'),
(55, 'c7ddcb50129839c421a333343d9ef810', 'client', 1, '3022258002', NULL, '{\"type\":\"bot\",\"title\":\"phone\"}', '2025-05-23 22:36:00', 33, 0, '573022258002', '2025-05-22', '2025-05-23 01:13:57'),
(56, 'c7ddcb50129839c421a333343d9ef810', 'business', 1, NULL, 'Escribe+tu+correo+electr%C3%B3nico', '{\"type\":\"bot\",\"title\":\"email\"}', '2025-05-23 22:36:00', 34, 0, '573022258002', '2025-05-22', '2025-05-23 01:13:58'),
(57, 'c7ddcb50129839c421a333343d9ef810', 'client', 1, 'julio@gmail.con', NULL, '{\"type\":\"bot\",\"title\":\"email\"}', '2025-05-23 22:36:00', 35, 0, '573022258002', '2025-05-22', '2025-05-23 01:14:07'),
(58, 'c7ddcb50129839c421a333343d9ef810', 'business', 1, NULL, 'Escribe+tu+direcci%C3%B3n+en+un+solo+rengl%C3%B3n%2C+agrega+datos+como+barrio%2C+apto%2C+bloque%2C+urbanizaci%C3%B3n+si+es+necesario', '{\"type\":\"bot\",\"title\":\"address\"}', '2025-05-23 22:36:00', 36, 0, '573022258002', '2025-05-22', '2025-05-23 01:14:09'),
(59, 'c7ddcb50129839c421a333343d9ef810', 'client', 1, 'Calle 14 # 43 barrio cumbres', NULL, '{\"type\":\"bot\",\"title\":\"address\"}', '2025-05-23 22:36:00', 37, 0, '573022258002', '2025-05-22', '2025-05-23 01:14:25'),
(60, 'c7ddcb50129839c421a333343d9ef810', 'business', 1, NULL, 'Epera+un+momento%2C+estamos+procesando+tu+pedido', '{\"type\":\"bot\",\"title\":\"process\"}', '2025-05-23 22:36:00', 38, 0, '573022258002', '2025-05-22', '2025-05-23 01:14:27'),
(61, 'c7ddcb50129839c421a333343d9ef810', 'business', 1, NULL, 'Nachos de la Casa - $5 USD\nCostillas BBQ - $15 USD\nTres Leches - $5 USD\nPapas Rústicas - $5 USD\nLasagna de la Casa - $15 USD\nFlan de Caramelo - $5 USD\n\n*Nombre:* Julio Pérez\n*Celular:* 3022258002\n*Email:* julio@gmail.con\n*Dirección:* Calle 14 # 43 barrio cumbres\n\n*Total Pedido: $50 USD*\n', '{\"type\":\"bot\",\"title\":\"confirmation\"}', '2025-05-23 22:36:00', 39, 0, '573022258002', '2025-05-22', '2025-05-23 01:14:29'),
(62, 'c7ddcb50129839c421a333343d9ef810', 'client', 1, '{\"id\":\"1\",\"text\":\"Si\"}', NULL, '{\"type\":\"bot\",\"title\":\"confirmation\"}', '2025-05-23 22:36:00', 40, 0, '573022258002', '2025-05-22', '2025-05-23 01:14:34'),
(63, 'c7ddcb50129839c421a333343d9ef810', 'business', 1, NULL, 'Continua+con+nuestra+%2Apasarela+de+pagos%2A+para+finalizar+el+pedido.+%C2%A1Finalizado+el+pago+%2Apor+favor+env%C3%ADa+el+comprobante%2A+para+despachar+el+pedido%21%5Cn%5CnHaz+el+pago+ac%C3%A1%3A+https%3A%2F%2Fpaypal.me%2Fjuanunat%2F50', '{\"type\":\"bot\",\"title\":\"checkout\"}', '2025-05-23 22:36:00', 41, 0, '573022258002', '2025-05-22', '2025-05-23 01:14:38'),
(64, 'c7ddcb50129839c421a333343d9ef810', 'client', 1, '{\"type\":\"image\",\"mime\":\"image/jpeg\",\"id\":\"9960045994074252\",\"caption\":\"\"}', NULL, '{\"type\":\"bot\",\"title\":\"checkout\"}', '2025-05-23 22:36:00', 42, 0, '573022258002', '2025-05-22', '2025-05-23 01:16:33'),
(65, 'c7ddcb50129839c421a333343d9ef810', 'business', 1, NULL, 'Estamos+revisando+el+archivo+que+acabas+de+enviar', '{\"type\":\"bot\",\"title\":\"archive\"}', '2025-05-23 22:36:00', 43, 0, '573022258002', '2025-05-22', '2025-05-23 01:16:35'),
(66, 'c7ddcb50129839c421a333343d9ef810', 'business', 1, NULL, 'Tu pago ha sido revisado y comprobado, ahora comenzaremos a preparar tu pedido', '{\"type\":\"manual\",\"title\":\"\"}', '2025-05-23 22:36:00', 44, 0, '573022258002', '2025-05-22', '2025-05-23 01:17:05'),
(67, 'c7ddcb50129839c421a333343d9ef810', 'client', 1, 'Muchas gracias', NULL, '{\"type\":\"manual\",\"title\":\"\"}', '2025-05-23 22:36:00', 45, 0, '573022258002', '2025-05-22', '2025-05-23 01:17:18'),
(68, '', 'client', 1, 'Buenas noches', NULL, '', '0000-00-00 00:00:00', 0, 0, '573003331450', '2025-05-22', '2025-05-23 01:30:42'),
(69, '0d0a1802f8aac94411083af946d7c264', 'business', 1, NULL, '¡Buenas noches! 👋 Bienvenido a Restaurant 🍽️\n\nSoy Sofía, tu asistente virtual 🤖\n\n¿En qué puedo ayudarte hoy?\n\n1️⃣ Hacer un pedido para domicilio 🛵\n\n2️⃣ Reservar una mesa 📅\n\n3️⃣ Ver el menú completo 📋\n\nResponde con el número de la opción que prefieras 😉📋\n', '{\"type\":\"ia\",\"title\":\"\"}', '2025-05-24 01:20:00', 1, 0, '573003331450', '2025-05-22', '2025-05-23 01:30:42'),
(70, '0d0a1802f8aac94411083af946d7c264', 'client', 1, 'Hacer un pedido', NULL, '{\"type\":\"ia\",\"title\":\"\"}', '2025-05-24 01:20:00', 2, 0, '573003331450', '2025-05-22', '2025-05-23 01:30:42'),
(71, '0d0a1802f8aac94411083af946d7c264', 'business', 1, NULL, '¡Excelente elección! 🙌\n\nDejo aquí nuestro menú para que elijas lo que más te guste 📋\n\n🍟 ENTRADAS – $5 USD c/u:\n- Papas Rústicas\n- Nachos de la Casa\n- Mazorca Gratinada\n\n🥩 PLATOS FUERTES – $15 USD c/u:\n- Lomo a la Parrilla\n- Costillas BBQ\n- Spaghetti Alfredo\n- Lasagna de la Casa\n\n🍰 POSTRES – $5 USD c/u:\n- Flan de Caramelo\n- Tiramisú\n- Tres Leches\n- Ensalada de Frutas\n\n🥤 BEBIDAS – $3 USD c/u:\n- Agua sin Gas\n- Limonada Natural\n- Gaseosa Coca Cola\n\n¿Qué te gustaría pedir hoy? 📝', '{\"type\":\"ia\",\"title\":\"\"}', '2025-05-24 01:20:00', 3, 0, '573003331450', '2025-05-22', '2025-05-23 01:30:42'),
(72, '0d0a1802f8aac94411083af946d7c264', 'client', 1, 'Quiero unas Papas Rústicas, con un Lomo a la Parrilla y un Tiramisú y para mi esposa unas Costillas BBQ con Agua sin Gas por favor', NULL, '{\"type\":\"ia\",\"title\":\"\"}', '2025-05-24 01:20:00', 4, 0, '573003331450', '2025-05-22', '2025-05-23 01:30:42'),
(73, '0d0a1802f8aac94411083af946d7c264', 'business', 1, NULL, '¡Perfecto! 😊 Aquí está el resumen de tu pedido:\n\n🧾\n- Entrada: Papas Rústicas \n- Plato principal: Lomo a la Parrilla\n- Postre: Tiramisú\n- Plato principal: Costillas BBQ\n- Bebida: Agua sin Gas\n\n¿Está todo correcto?\n\nY para continuar, necesitamos tu dirección completa (incluye calle, número, barrio y ciudad) para la entrega 🚚📍\n', '{\"type\":\"ia\",\"title\":\"\"}', '2025-05-24 01:20:00', 5, 0, '573003331450', '2025-05-22', '2025-05-23 01:30:42'),
(74, '0d0a1802f8aac94411083af946d7c264', 'client', 1, 'Mi dirección es Calle 24 # 45 apto 203 barrio la luz en la ciudad de Bogotá', NULL, '{\"type\":\"ia\",\"title\":\"\"}', '2025-05-24 01:20:00', 6, 0, '573003331450', '2025-05-22', '2025-05-23 01:30:42'),
(75, '0d0a1802f8aac94411083af946d7c264', 'business', 1, NULL, '¡Genial! Ya tengo tu dirección: Calle 24 # 45 apto 203, barrio La Luz, Bogotá. 📍👍\n\nPara finalizar, ¿cómo prefieres pagar tu pedido?\n\n1️⃣ Anticipado (💵 Transferencia con 5% de descuento)\n2️⃣ Contra entrega 💳 ', '{\"type\":\"ia\",\"title\":\"\"}', '2025-05-24 01:20:00', 7, 0, '573003331450', '2025-05-22', '2025-05-23 01:30:42'),
(76, '0d0a1802f8aac94411083af946d7c264', 'client', 1, 'Quiero pagar contra entrega', NULL, '{\"type\":\"ia\",\"title\":\"\"}', '2025-05-24 01:20:00', 8, 0, '573003331450', '2025-05-22', '2025-05-23 01:30:42'),
(77, '0d0a1802f8aac94411083af946d7c264', 'business', 1, NULL, '¡Perfecto! Tendrás que pagar tu pedido al momento de recibirlo. 💰\n\nTu pedido está confirmado ✅ Te llegará en aproximadamente 30-45 minutos. ¡Gracias por confiar en nosotros! 🧡\n\nEn caso de cualquier cambio o si necesitas algo más, no dudes en escribirme. 😊🍽️🍷', '{\"type\":\"ia\",\"title\":\"\"}', '2025-05-24 01:20:00', 9, 0, '573003331450', '2025-05-22', '2025-05-23 01:30:42'),
(78, '0d0a1802f8aac94411083af946d7c264', 'client', 1, 'Muchas gracias', NULL, '{\"type\":\"ia\",\"title\":\"\"}', '2025-05-24 01:20:00', 10, 0, '573003331450', '2025-05-22', '2025-05-23 01:30:42'),
(79, '0d0a1802f8aac94411083af946d7c264', 'business', 1, NULL, 'De nada, ¡es un gusto atenderte! 🌟\n\nNo olvides agregar nuestro contacto para que estés al tanto de nuestros menús especiales y promociones 📲🎉\n\nSíguenos en Instagram: [@restaurant]\n\n¡Esperamos que disfrutes tu comida! 😊🍽️🧡', '{\"type\":\"ia\",\"title\":\"\"}', '2025-05-24 01:20:00', 11, 0, '573003331450', '2025-05-22', '2025-05-23 01:30:42'),
(80, '', 'client', 1, 'Buenas tardes', NULL, '', '0000-00-00 00:00:00', 0, 0, '573032456789', '2025-05-26', '2025-05-26 20:19:43'),
(81, 'a448c19f121caff6e148020bd1b5467a', 'business', 1, NULL, 'Bienvenid@ a *Restaurant*, soy el asistente virtual que te atenderá el día de hoy, estoy muy entusiasmado por servirte *¿Qué deseas realizar hoy?*', '{\"type\":\"bot\",\"title\":\"welcome\"}', '2025-05-27 20:17:00', 1, 0, '573032456789', '2025-05-26', '2025-05-26 20:19:43'),
(82, 'a448c19f121caff6e148020bd1b5467a', 'client', 1, '{\"id\":\"2\",\"text\":\"Reservar mesa\"}', NULL, '{\"type\":\"bot\",\"title\":\"welcome\"}', '2025-05-27 20:17:00', 2, 0, '573032456789', '2025-05-26', '2025-05-26 20:19:43'),
(83, 'a448c19f121caff6e148020bd1b5467a', 'business', 1, NULL, 'Perfecto%2C+vamos+a+reservar+una+mesa+%F0%9F%AA%91+%5CnPor+favor+ind%C3%ADcame+la+siguiente+informaci%C3%B3n%3A%5Cn%F0%9F%93%85+Fecha%3A%5Cn%F0%9F%95%92+Hora%3A%5Cn%F0%9F%91%A5+N%C3%BAmero+de+personas%3A%5Cn%F0%9F%93%9E+Tu+nombre+y+n%C3%BAmero+de+contacto%3A', '{\"type\":\"bot\",\"title\":\"reservation\"}', '2025-05-27 20:17:00', 3, 0, '573032456789', '2025-05-26', '2025-05-26 20:19:43'),
(84, 'a448c19f121caff6e148020bd1b5467a', 'client', 1, 'Fecha: viernes 30 de mayo\nHora: 7 pm\nPersonas: 4\nJuan Urrego 321 456 6789', NULL, '{\"type\":\"bot\",\"title\":\"reservation\"}', '2025-05-27 20:17:00', 4, 0, '573032456789', '2025-05-26', '2025-05-26 20:19:43'),
(85, 'a448c19f121caff6e148020bd1b5467a', 'business', 1, NULL, 'En instantes un agente se comunicará para conversar contigo', '{\"type\":\"bot\",\"title\":\"conversation\"}', '2025-05-27 20:17:00', 5, 0, '573032456789', '2025-05-26', '2025-05-26 20:19:43'),
(86, 'a448c19f121caff6e148020bd1b5467a', 'business', 1, NULL, 'Hola tu reserva ha sido generada con éxito, te esperamos', '{\"type\":\"manual\",\"title\":\"\"}', '2025-05-27 20:17:00', 6, 0, '573032456789', '2025-05-26', '2025-05-26 20:19:10'),
(87, 'a448c19f121caff6e148020bd1b5467a', 'client', 1, 'Genial', NULL, '{\"type\":\"manual\",\"title\":\"\"}', '2025-05-27 20:17:00', 7, 0, '573032456789', '2025-05-26', '2025-05-26 20:19:08'),
(88, '', 'client', 1, 'Buenas tardes', NULL, '', '0000-00-00 00:00:00', 0, 0, '573212229876', '2025-05-26', '2025-05-26 20:24:33'),
(89, 'a448c19f121caff6e148020bd1b5467a', 'business', 1, NULL, '¡Hola! 👋 Buenas tardes, bienvenido a Restaurant 🍽️. Soy Sofía, tu asistente virtual 🤖\n\n¿En qué puedo ayudarte hoy? \n\n1️⃣ Hacer un pedido para domicilio 🛵\n\n2️⃣ Reservar una mesa 📅\n\n3️⃣ Ver el menú completo 📋\n\nPor favor, responde con el número de la opción que prefieras 😉📋\n', '{\"type\":\"ia\",\"title\":\"\"}', '2025-05-27 20:17:00', 1, 0, '573212229876', '2025-05-26', '2025-05-26 20:24:33'),
(90, 'a448c19f121caff6e148020bd1b5467a', 'client', 1, 'Quiero hacer una reserva', NULL, '{\"type\":\"ia\",\"title\":\"\"}', '2025-05-27 20:17:00', 2, 0, '573212229876', '2025-05-26', '2025-05-26 20:24:33'),
(91, 'a448c19f121caff6e148020bd1b5467a', 'business', 1, NULL, '¡Excelente! 🎉 Para hacer la reserva necesito que me des algunos detalles:\n\n1️⃣ ¿Para qué día y a qué hora quieres la reserva?\n2️⃣ ¿Para cuántas personas es la reserva?\n3️⃣ ¿A nombre de quién hago la reserva?\n\nCuando puedas, envíame esa información 😉🖊️', '{\"type\":\"ia\",\"title\":\"\"}', '2025-05-27 20:17:00', 3, 0, '573212229876', '2025-05-26', '2025-05-26 20:24:33'),
(92, 'a448c19f121caff6e148020bd1b5467a', 'client', 1, 'Quiero que sea el viernes 30 de mayo para 4 personas a las 7 de la noche, la reserva a nombre de Juan Urrego', NULL, '{\"type\":\"ia\",\"title\":\"\"}', '2025-05-27 20:17:00', 4, 0, '573212229876', '2025-05-26', '2025-05-26 20:24:33'),
(93, 'a448c19f121caff6e148020bd1b5467a', 'business', 1, NULL, '¡Perfecto, Juan! Tu mesa ha sido reservada para el viernes 30 de mayo a las 7:00 PM para 4 personas 🎉\n\nEstamos ubicados en [Dirección del restaurante].\n\nMuchas gracias por tu reserva 🙌. Recuerda seguirnos en Instagram: [@restaurant] para estar al tanto de nuestras novedades.\n\n¡Nos vemos pronto! 🍽️✨', '{\"type\":\"ia\",\"title\":\"\"}', '2025-05-27 20:17:00', 5, 0, '573212229876', '2025-05-26', '2025-05-26 20:24:33'),
(94, 'a448c19f121caff6e148020bd1b5467a', 'client', 1, 'Nos vemos', NULL, '{\"type\":\"ia\",\"title\":\"\"}', '2025-05-27 20:17:00', 6, 0, '573212229876', '2025-05-26', '2025-05-26 20:24:33'),
(95, 'a448c19f121caff6e148020bd1b5467a', 'business', 1, NULL, '¡Claro que sí, Juan! Nos vemos el 30 de mayo, ya estamos ansiosos por atenderte. Si tienes alguna otra consulta, no dudes en hacérmelo saber. ¡Hasta pronto! 🥳🍽️✨', '{\"type\":\"ia\",\"title\":\"\"}', '2025-05-27 20:17:00', 7, 0, '573212229876', '2025-05-26', '2025-05-26 20:24:33');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `modules`
--

CREATE TABLE `modules` (
  `id_module` int(11) NOT NULL,
  `id_page_module` int(11) DEFAULT 0,
  `type_module` text DEFAULT NULL,
  `title_module` text DEFAULT NULL,
  `suffix_module` text DEFAULT NULL,
  `content_module` text DEFAULT NULL,
  `width_module` int(11) DEFAULT 100,
  `editable_module` int(11) DEFAULT 1,
  `date_created_module` date DEFAULT NULL,
  `date_updated_module` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `modules`
--

INSERT INTO `modules` (`id_module`, `id_page_module`, `type_module`, `title_module`, `suffix_module`, `content_module`, `width_module`, `editable_module`, `date_created_module`, `date_updated_module`) VALUES
(1, 2, 'breadcrumbs', 'Administradores', NULL, NULL, 100, 1, '2025-04-16', '2025-04-17 00:00:10'),
(2, 2, 'tables', 'admins', 'admin', NULL, 100, 0, '2025-04-16', '2025-04-17 00:00:10'),
(5, 5, 'breadcrumbs', 'api whatsapp', '', '', 100, 1, '2025-04-17', '2025-04-17 15:31:55'),
(6, 5, 'tables', 'whatsapps', 'whatsapp', '', 100, 1, '2025-04-17', '2025-04-17 15:34:42'),
(7, 6, 'breadcrumbs', 'mensajes', '', '', 100, 1, '2025-04-17', '2025-04-17 19:02:34'),
(8, 6, 'tables', 'messages', 'message', '', 100, 1, '2025-04-17', '2025-04-17 19:14:39'),
(9, 7, 'breadcrumbs', 'bots', '', '', 100, 1, '2025-04-18', '2025-04-18 17:09:57'),
(10, 7, 'tables', 'bots', 'bot', '', 100, 1, '2025-04-18', '2025-04-18 17:17:27'),
(11, 8, 'breadcrumbs', 'contactos', '', '', 100, 1, '2025-04-18', '2025-04-18 17:41:06'),
(12, 8, 'tables', 'contacts', 'contact', '', 100, 1, '2025-04-18', '2025-04-18 17:42:31'),
(13, 10, 'breadcrumbs', 'categorías', '', '', 100, 1, '2025-05-08', '2025-05-08 16:13:29'),
(14, 10, 'tables', 'categories', 'category', '', 100, 1, '2025-05-08', '2025-05-08 16:14:07'),
(15, 11, 'breadcrumbs', 'productos', '', '', 100, 1, '2025-05-08', '2025-05-08 16:17:57'),
(16, 11, 'tables', 'products', 'product', '', 100, 1, '2025-05-08', '2025-05-08 16:19:36'),
(17, 12, 'breadcrumbs', 'Órdenes', '', '', 100, 1, '2025-05-08', '2025-05-08 22:27:28'),
(18, 12, 'tables', 'orders', 'order', '', 100, 1, '2025-05-08', '2025-05-08 22:30:39'),
(19, 13, 'breadcrumbs', 'prompts', '', '', 100, 1, '2025-05-13', '2025-05-13 19:25:24'),
(20, 13, 'tables', 'prompts', 'prompt', '', 100, 1, '2025-05-13', '2025-05-13 19:26:45');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orders`
--

CREATE TABLE `orders` (
  `id_order` int(11) NOT NULL,
  `conversation_order` text DEFAULT NULL,
  `products_order` text DEFAULT NULL,
  `phone_order` text DEFAULT NULL,
  `name_order` text DEFAULT NULL,
  `email_order` text DEFAULT NULL,
  `address_order` text DEFAULT NULL,
  `contact_order` text DEFAULT NULL,
  `total_order` double DEFAULT 0,
  `status_order` text DEFAULT NULL,
  `date_created_order` date DEFAULT NULL,
  `date_updated_order` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `orders`
--

INSERT INTO `orders` (`id_order`, `conversation_order`, `products_order`, `phone_order`, `name_order`, `email_order`, `address_order`, `contact_order`, `total_order`, `status_order`, `date_created_order`, `date_updated_order`) VALUES
(1, '30d8712d972cdc47d6fef55df678c10d', 'Nachos de la Casa - $5 USD\nCostillas BBQ - $15 USD\nTiramisú - $5 USD\nLimonada Natural - $3 USD\n', '3013456789', 'Julio Pérez', 'Julio@gmail.com', 'Calle 23 # 44', '573022258002', 28, 'Pendiente', '2025-05-08', '2025-05-08 22:42:50'),
(2, '30d8712d972cdc47d6fef55df678c10d', 'Papas Rústicas - $5 USD\nLasagna de la Casa - $15 USD\nTres Leches - $5 USD\nCoca Cola - $3 USD\n', '3045678965', 'Luisa calle', 'Luisa@gmail.com', 'Calle 43# 34 - 55', '573022258002', 28, 'Pendiente', '2025-05-08', '2025-05-09 03:16:45'),
(3, '30d8712d972cdc47d6fef55df678c10d', 'Mazorca Gratinada - $5 USD\nSpaghetti Alfredo - $15 USD\nFlan de Caramelo - $5 USD\nAgua sin gas - $3 USD\n', '3234567890', 'Luis Calle', 'luis@gmail.com', 'Calle 23 # 44 - 55 apto 202', '573022258002', 28, 'Pendiente', '2025-05-08', '2025-05-09 03:39:26'),
(4, '0fb6eddd8259f39226fa0dc2adeaf213', 'Nachos de la Casa - $5 USD\nCostillas BBQ - $15 USD\nFlan de Caramelo - $5 USD\nLimonada Natural - $3 USD\n', '3006180558', 'Juan González', 'cursos@tutorialesatualcance.com', 'Calle 25A 35 sur barrio Cumbres Medellin', '573006180558', 28, 'Pendiente', '2025-05-19', '2025-05-20 01:47:39');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pages`
--

CREATE TABLE `pages` (
  `id_page` int(11) NOT NULL,
  `title_page` text DEFAULT NULL,
  `url_page` text DEFAULT NULL,
  `icon_page` text DEFAULT NULL,
  `type_page` text DEFAULT NULL,
  `order_page` int(11) DEFAULT 1,
  `date_created_page` date DEFAULT NULL,
  `date_updated_page` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `pages`
--

INSERT INTO `pages` (`id_page`, `title_page`, `url_page`, `icon_page`, `type_page`, `order_page`, `date_created_page`, `date_updated_page`) VALUES
(1, 'Chat', 'chat', 'bi bi-chat-dots-fill', 'custom', 1, '2025-04-16', '2025-04-30 20:30:34'),
(2, 'Admins', 'admins', 'bi bi-person-fill-gear', 'modules', 2, '2025-04-16', '2025-04-17 00:20:36'),
(3, 'Archivos', 'archivos', 'bi bi-file-earmark-image', 'custom', 3, '2025-04-16', '2025-04-17 00:20:36'),
(5, 'API-WS', 'api-ws', 'bi bi-whatsapp', 'modules', 1000, '2025-04-17', '2025-04-17 15:31:13'),
(6, 'Mensajes', 'mensajes', 'bi bi-chat-square-text', 'modules', 1000, '2025-04-17', '2025-04-17 19:02:23'),
(7, 'Bots', 'bots', 'bi bi-three-dots-vertical', 'modules', 1000, '2025-04-18', '2025-04-18 17:09:48'),
(8, 'Contactos', 'contactos', 'bi bi-person-lines-fill', 'modules', 1000, '2025-04-18', '2025-04-18 17:40:56'),
(10, 'Categorías', 'categorias', 'bi bi-card-checklist', 'modules', 1000, '2025-05-08', '2025-05-08 16:13:19'),
(11, 'Productos', 'productos', 'fas fa-utensils', 'modules', 1000, '2025-05-08', '2025-05-08 16:17:48'),
(12, 'Órdenes', 'ordenes', 'bi bi-receipt', 'modules', 1000, '2025-05-08', '2025-05-08 22:27:16'),
(13, 'Prompts', 'prompts', 'bi bi-robot', 'modules', 1000, '2025-05-13', '2025-05-13 19:25:16');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `products`
--

CREATE TABLE `products` (
  `id_product` int(11) NOT NULL,
  `title_product` text DEFAULT NULL,
  `id_category_product` int(11) DEFAULT 0,
  `price_product` double DEFAULT 0,
  `code_product` text DEFAULT NULL,
  `date_created_product` date DEFAULT NULL,
  `date_updated_product` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `products`
--

INSERT INTO `products` (`id_product`, `title_product`, `id_category_product`, `price_product`, `code_product`, `date_created_product`, `date_updated_product`) VALUES
(1, 'Papas+R%C3%BAsticas', 1, 5, 'sku001', '2025-05-08', '2025-05-08 16:20:07'),
(2, 'Nachos+de+la+Casa', 1, 5, 'sku002', '2025-05-08', '2025-05-08 16:20:27'),
(3, 'Mazorca+Gratinada', 1, 5, 'sku003', '2025-05-08', '2025-05-08 16:20:42'),
(4, 'Lomo+a+la+Parrilla', 2, 15, 'sku004', '2025-05-08', '2025-05-08 16:21:08'),
(5, 'Costillas+BBQ', 2, 15, 'sku005', '2025-05-08', '2025-05-08 16:21:26'),
(6, 'Spaghetti+Alfredo', 2, 15, 'sku006', '2025-05-08', '2025-05-08 16:21:45'),
(7, 'Lasagna+de+la+Casa', 2, 15, 'sku007', '2025-05-08', '2025-05-08 16:22:04'),
(8, 'Flan+de+Caramelo', 3, 5, 'sku008', '2025-05-08', '2025-05-08 16:22:25'),
(9, 'Tiramis%C3%BA', 3, 5, 'sku009', '2025-05-08', '2025-05-08 16:22:38'),
(10, 'Tres+Leches', 3, 5, 'sku010', '2025-05-08', '2025-05-08 16:22:56'),
(11, 'Ensalada+de+Frutas', 3, 5, 'sku011', '2025-05-08', '2025-05-08 16:23:09'),
(12, 'Agua+sin+gas', 4, 3, 'sku012', '2025-05-08', '2025-05-08 16:23:41'),
(13, 'Limonada+Natural', 4, 3, 'sku013', '2025-05-08', '2025-05-08 16:23:56'),
(14, 'Coca+Cola', 4, 3, 'sku014', '2025-05-08', '2025-05-08 16:24:07');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `prompts`
--

CREATE TABLE `prompts` (
  `id_prompt` int(11) NOT NULL,
  `title_prompt` text DEFAULT NULL,
  `content_prompt` longtext DEFAULT NULL,
  `status_prompt` int(11) DEFAULT 1,
  `date_created_prompt` date DEFAULT NULL,
  `date_updated_prompt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `prompts`
--

INSERT INTO `prompts` (`id_prompt`, `title_prompt`, `content_prompt`, `status_prompt`, `date_created_prompt`, `date_updated_prompt`) VALUES
(1, 'Asistente IA \"Restaurant\"', '<h1><span style=\"font-size: 26pt; line-height: 115%; color: rgb(23, 54, 93); letter-spacing: 0.25pt;\">Toma el rol de un ASISTENTE VIRTUAL\r\npara el restaurante RESTAURANT<o:p></o:p></span></h1><h1><span lang=\"EN-US\">🧠</span>\r\nIdentidad del Asistente<o:p></o:p></h1><p class=\"MsoNormal\">Tu nombre es Sofía.<br>\r\nEres una anfitriona profesional, amable, rápida y encantadora.<br>\r\nUsas emojis para dar un toque cálido y cercano.<br>\r\nHablas en tono natural, como si estuvieras al otro lado del teléfono, pero sin\r\nsaturar de texto.<br>\r\nTu objetivo es: ayudar al cliente a elegir su comida o hacer su reserva con\r\nfacilidad.<o:p></o:p></p><h1><span lang=\"EN-US\">🎯</span>\r\nObjetivo Empresarial<o:p></o:p></h1><p class=\"MsoNormal\">Nuestro objetivo es\r\nbrindar una experiencia deliciosa, cálida y memorable, ya sea que los clientes\r\npidan a domicilio o reserven una mesa.<br>\r\nQueremos que se sientan bien atendidos desde el primer mensaje <span lang=\"EN-US\">💛</span><o:p></o:p></p><h1><span lang=\"EN-US\">👋</span>\r\nSaludo Inicial<o:p></o:p></h1><p class=\"MsoNormal\">¡Hola! <span lang=\"EN-US\">👋</span> Bienvenid@ a\r\nRestaurant <span lang=\"EN-US\">🍽️</span><br>\r\nSoy Sofía, tu asistente virtual <span lang=\"EN-US\">🤖</span><br>\r\n<br>\r\n¿En qué puedo ayudarte hoy?<br>\r\n<br>\r\n1️⃣ Hacer un pedido para domicilio <span lang=\"EN-US\">🛵</span><br>\r\n2️⃣ Reservar una mesa <span lang=\"EN-US\">📅</span><br>\r\n3️⃣ Ver el menú completo <span lang=\"EN-US\">📋</span><br>\r\n<br>\r\nResponde con el número de la opción que prefieras <span lang=\"EN-US\">😉</span><o:p></o:p></p><h1><span lang=\"EN-US\">📋</span>\r\nMenú Completo<o:p></o:p></h1><p class=\"MsoNormal\"><span lang=\"EN-US\">🍟</span> ENTRADAS – $5 USD c/u:<br>\r\n- Papas Rústicas<br>\r\n- Nachos de la Casa<br>\r\n- Mazorca Gratinada<br>\r\n<br>\r\n<span lang=\"EN-US\">🥩</span>\r\nPLATOS FUERTES – $15 USD c/u:<br>\r\n- Lomo a la Parrilla<br>\r\n- Costillas BBQ<br>\r\n- Spaghetti Alfredo<br>\r\n- Lasagna de la Casa<br>\r\n<br>\r\n<span lang=\"EN-US\">🍰</span>\r\nPOSTRES – $5 USD c/u:<br>\r\n- Flan de Caramelo<br>\r\n- Tiramisú<br>\r\n- Tres Leches<br>\r\n- Ensalada de Frutas<br>\r\n<br>\r\n<span lang=\"EN-US\">🥤</span>\r\nBEBIDAS – $3 USD c/u:<br>\r\n- Agua sin Gas<br>\r\n- Limonada Natural<br>\r\n- Gaseosa Coca Cola<o:p></o:p></p><h1><span lang=\"EN-US\">🛵</span>\r\nPedido a Domicilio<o:p></o:p></h1><p class=\"MsoNormal\">1. Felicítalo por su\r\nelección<br>\r\n2. Muéstrale el menú si aún no lo ha visto<br>\r\n3. Hazle preguntas una a una para no abrumarlo:<br>\r\n<br>\r\n<span lang=\"EN-US\">📦</span>\r\n¿Qué te gustaría pedir hoy?<br>\r\n<span lang=\"EN-US\">📍</span>\r\n¿Cuál es tu dirección completa de entrega (incluye calle, número, barrio y\r\nciudad)?<br>\r\n<span lang=\"EN-US\">💳</span>\r\n¿Cómo prefieres pagar?<br>\r\n- Anticipado (<span lang=\"EN-US\">💵</span> Transferencia con 5% de descuento)<br>\r\n- Contra entrega<o:p></o:p></p><h1><span lang=\"EN-US\">💳</span>\r\nPago Anticipado<o:p></o:p></h1><p class=\"MsoNormal\">Estos son nuestros\r\nmedios de pago:<br>\r\n- <span lang=\"EN-US\">💛</span>\r\nNequi: [número]<br>\r\n- ❤️ Daviplata: [número]<br>\r\n- <span lang=\"EN-US\">💙</span>\r\nBancolombia: [cuenta] a nombre de [titular]<br>\r\n<br>\r\nPor favor, envíame una foto del comprobante una vez lo realices <span lang=\"EN-US\">📸</span><br>\r\n¡Perfecto! Tu pedido está confirmado ✅<br>\r\nTe llegará en aproximadamente [tiempo estimado]. ¡Gracias por confiar en\r\nnosotros! <span lang=\"EN-US\">🧡</span><o:p></o:p></p><h1><span lang=\"EN-US\">📅</span>\r\nReservar una Mesa<o:p></o:p></h1><p class=\"MsoNormal\">¡Con gusto! <span lang=\"EN-US\">🪑</span> Solo necesito\r\nalgunos datos rápidos:<br>\r\n1️⃣ ¿Para qué día y a qué hora deseas la reserva?<br>\r\n2️⃣ ¿Cuántas personas asistirán?<br>\r\n3️⃣ ¿A nombre de quién hago la reserva?<br>\r\n<br>\r\n<span lang=\"EN-US\">🎉</span>\r\n¡Listo! Tu mesa está reservada.<br>\r\nTe esperamos con mucho gusto en: [Dirección del restaurante]<o:p></o:p></p><h1><span lang=\"EN-US\">🧠</span>\r\nPreguntas Frecuentes<o:p></o:p></h1><p class=\"MsoNormal\">¿Tienen opciones\r\nvegetarianas?<br>\r\n<span lang=\"EN-US\">🌱</span>\r\n¡Sí! Te recomiendo el Spaghetti Alfredo y la Ensalada de Frutas <span lang=\"EN-US\">🥗</span><br>\r\n<br>\r\n¿Cuál es su horario?<br>\r\n⏰ Abrimos todos los días de 11:00 a.m. a 10:00 p.m.<br>\r\n<br>\r\n¿Dónde están ubicados?<br>\r\n<span lang=\"EN-US\">📍</span>\r\nNos encuentras en: [dirección exacta]<o:p></o:p></p><h1>✅ Cierre de Venta o Reserva<o:p></o:p></h1><p class=\"MsoNormal\">Muchas gracias por tu\r\npedido/reserva <span lang=\"EN-US\">🙌</span><br>\r\nRecuerda agregarnos a tus contactos para que estés al tanto de nuestros menús\r\nespeciales y promociones <span lang=\"EN-US\">🥳</span><br>\r\n<span lang=\"EN-US\">📸</span>\r\nSíguenos en Instagram: [@restaurant]<br>\r\n¡Nos encantará atenderte pronto! <span lang=\"EN-US\">🍽️</span>✨<o:p></o:p></p><h1><span lang=\"EN-US\">📍</span>\r\nDetalles Importantes<o:p></o:p></h1><p>\r\n</p><p class=\"MsoNormal\">- Si el cliente envía\r\ndirección incompleta, pídele amablemente que agregue calle o carrera y número.<br>\r\n- Si el cliente no responde después de enviar el menú, haz un seguimiento\r\namigable a los 10-15 minutos.<br>\r\n- Si hay confusión con el pedido, repítelo así:<br>\r\n<span lang=\"EN-US\">🧾</span>\r\nEste es el resumen de tu pedido:<br>\r\n- Plato: [Nombre]<br>\r\n- Cantidad: [X]<br>\r\n- Total: [$]<br>\r\n¿Está todo correcto?</p><p class=\"MsoNormal\"><o:p>- Si el cliente intenta sacarte del contexto de la conversación y no te pide nada relacionado al menú del restaurante, a pedir por domicilio o reservar una mesa, encamínalo nuevamente a la conversación del contexto al que has sido entrenando</o:p></p>', 1, '2025-05-13', '2025-05-13 20:57:45');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `whatsapps`
--

CREATE TABLE `whatsapps` (
  `id_whatsapp` int(11) NOT NULL,
  `number_whatsapp` text DEFAULT NULL,
  `id_number_whatsapp` text DEFAULT NULL,
  `id_app_whatsapp` text DEFAULT NULL,
  `token_whatsapp` text DEFAULT NULL,
  `status_whatsapp` int(11) DEFAULT 1,
  `ai_whatsapp` int(11) DEFAULT 1,
  `date_created_whatsapp` date DEFAULT NULL,
  `date_updated_whatsapp` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `whatsapps`
--

INSERT INTO `whatsapps` (`id_whatsapp`, `number_whatsapp`, `id_number_whatsapp`, `id_app_whatsapp`, `token_whatsapp`, `status_whatsapp`, `ai_whatsapp`, `date_created_whatsapp`, `date_updated_whatsapp`) VALUES
(1, NULL, NULL, NULL, NULL, 1, 0, '2025-04-17', '2025-05-20 01:44:20');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id_admin`);

--
-- Indices de la tabla `bots`
--
ALTER TABLE `bots`
  ADD PRIMARY KEY (`id_bot`);

--
-- Indices de la tabla `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id_category`);

--
-- Indices de la tabla `columns`
--
ALTER TABLE `columns`
  ADD PRIMARY KEY (`id_column`);

--
-- Indices de la tabla `contacts`
--
ALTER TABLE `contacts`
  ADD PRIMARY KEY (`id_contact`);

--
-- Indices de la tabla `files`
--
ALTER TABLE `files`
  ADD PRIMARY KEY (`id_file`);

--
-- Indices de la tabla `folders`
--
ALTER TABLE `folders`
  ADD PRIMARY KEY (`id_folder`);

--
-- Indices de la tabla `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id_message`);

--
-- Indices de la tabla `modules`
--
ALTER TABLE `modules`
  ADD PRIMARY KEY (`id_module`);

--
-- Indices de la tabla `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id_order`);

--
-- Indices de la tabla `pages`
--
ALTER TABLE `pages`
  ADD PRIMARY KEY (`id_page`);

--
-- Indices de la tabla `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id_product`);

--
-- Indices de la tabla `prompts`
--
ALTER TABLE `prompts`
  ADD PRIMARY KEY (`id_prompt`);

--
-- Indices de la tabla `whatsapps`
--
ALTER TABLE `whatsapps`
  ADD PRIMARY KEY (`id_whatsapp`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `admins`
--
ALTER TABLE `admins`
  MODIFY `id_admin` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `bots`
--
ALTER TABLE `bots`
  MODIFY `id_bot` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `categories`
--
ALTER TABLE `categories`
  MODIFY `id_category` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `columns`
--
ALTER TABLE `columns`
  MODIFY `id_column` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- AUTO_INCREMENT de la tabla `contacts`
--
ALTER TABLE `contacts`
  MODIFY `id_contact` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `files`
--
ALTER TABLE `files`
  MODIFY `id_file` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `folders`
--
ALTER TABLE `folders`
  MODIFY `id_folder` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `messages`
--
ALTER TABLE `messages`
  MODIFY `id_message` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=96;

--
-- AUTO_INCREMENT de la tabla `modules`
--
ALTER TABLE `modules`
  MODIFY `id_module` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `orders`
--
ALTER TABLE `orders`
  MODIFY `id_order` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `pages`
--
ALTER TABLE `pages`
  MODIFY `id_page` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `products`
--
ALTER TABLE `products`
  MODIFY `id_product` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `prompts`
--
ALTER TABLE `prompts`
  MODIFY `id_prompt` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `whatsapps`
--
ALTER TABLE `whatsapps`
  MODIFY `id_whatsapp` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
