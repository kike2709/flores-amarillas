/**
 * Servidor mínimo para publicar el proyecto en Render.
 * Render asigna el puerto por la variable de entorno PORT.
 */

const path = require('path');
const express = require('express');

const app = express();
const PUERTO = process.env.PORT || 3000;
const PUBLICO = path.join(__dirname, 'public');

app.disable('x-powered-by');

// Archivos estáticos (HTML, CSS, JS, imágenes)
app.use(express.static(PUBLICO, {
  maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0,
  extensions: ['html']
}));

// Render usa esta ruta para comprobar que el servicio está vivo
app.get('/health', (_req, res) => res.json({ ok: true, servicio: 'flores-amarillas' }));

// Cualquier otra ruta devuelve la página principal
app.use((_req, res) => res.sendFile(path.join(PUBLICO, 'index.html')));

app.listen(PUERTO, '0.0.0.0', () => {
  console.log(`🌻 Flores amarillas escuchando en http://localhost:${PUERTO}`);
});
