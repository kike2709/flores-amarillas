/**
 * Genera un único archivo HTML con todo dentro (CSS, JS e icono).
 * Sirve para enviarlo por WhatsApp o guardarlo como recuerdo.
 *
 *   npm run build:unico   →   dist/flores-amarillas-para-ti.html
 */

const fs = require('fs');
const path = require('path');

const RAIZ = __dirname;
const PUBLICO = path.join(RAIZ, 'public');
const DESTINO = path.join(RAIZ, 'dist');

const leer = rel => fs.readFileSync(path.join(PUBLICO, rel), 'utf8');

let html = leer('index.html');

// CSS en línea
html = html.replace(
  /<link rel="stylesheet" href="css\/styles\.css">/,
  `<style>\n${leer('css/styles.css')}\n</style>`
);

// JS en línea, respetando el orden de carga
const scripts = ['js/config.js', 'js/flores.js', 'js/particulas.js', 'js/audio.js', 'js/main.js'];
scripts.forEach(rel => {
  const etiqueta = new RegExp(`<script src="${rel.replace('/', '\\/')}" defer></script>`);
  html = html.replace(etiqueta, `<script>\n${leer(rel)}\n</script>`);
});

// Icono como data URI
const icono = Buffer.from(leer('favicon.svg')).toString('base64');
html = html.replace(
  /<link rel="icon" href="favicon\.svg" type="image\/svg\+xml">/,
  `<link rel="icon" href="data:image/svg+xml;base64,${icono}" type="image/svg+xml">`
);

fs.mkdirSync(DESTINO, { recursive: true });
const salida = path.join(DESTINO, 'flores-amarillas-para-ti.html');
fs.writeFileSync(salida, html, 'utf8');

const kb = (fs.statSync(salida).size / 1024).toFixed(1);
console.log(`🌻 Listo: dist/flores-amarillas-para-ti.html (${kb} KB)`);
