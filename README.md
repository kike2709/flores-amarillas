# 🌻 Flores amarillas

Una página-regalo: se abre un ramo de flores amarillas sobre un cielo de polen
dorado, los mensajes flotan alrededor y en el centro las partículas se reagrupan
formando un corazón, una flor y el nombre de quien lo recibe.

Todo está hecho con HTML, CSS y JavaScript puro. No usa librerías de frontend,
ni imágenes, ni archivos de audio: las flores son SVG, las partículas se dibujan
en un `<canvas>` y la música se genera en el navegador con Web Audio API.

---

## Cómo verlo en tu computadora

```bash
npm install
npm start
```

Luego abre <http://localhost:3000>.

> También puedes abrir `public/index.html` directamente con doble clic: funciona
> igual, sin servidor.

---

## Cómo personalizarlo

### Opción 1 — editando el archivo de configuración

Todo lo editable está en **`public/js/config.js`**: el nombre, la fecha, los
mensajes que flotan, las posiciones de las flores, las figuras del centro y el
texto de la carta. No hace falta tocar nada más.

```js
para: 'Ana',
de: 'Luis',
mensajes: [
  { texto: 'Te amo', x: 14, y: 26, z: 0.95, movil: true, tipo: 'girasol' },
  ...
]
```

- `x` y `y` son porcentajes de la pantalla.
- `z` es la profundidad: 0.45 se ve lejos y pequeño, 1 se ve cerca y grande.
- `movil: true` significa que esa flor también aparece en pantallas pequeñas.
- `tipo` puede ser `girasol` o `margarita`.

Las figuras del centro se configuran en `figuras`:

```js
figuras: [
  { forma: 'corazon' },
  { forma: 'flor' },
  { forma: 'texto', texto: 'Te amo' }   // sin "texto" usa el nombre de "para"
]
```

### Opción 2 — desde la URL, sin tocar código

```
?para=Ana
?para=Ana&de=Luis&fecha=21%20de%20septiembre
?mensaje=Te+amo|Eres+mi+sol|Mi+vida
?carta=Primer+párrafo||Segundo+párrafo
?musica=no
```

Ejemplo completo:

```
https://tu-proyecto.onrender.com/?para=Ana&de=Luis&mensaje=Te+amo|Eres+mi+todo
```

---

## Cómo subirlo a Render

### 1. Sube el proyecto a GitHub

```bash
git init
git add .
git commit -m "Flores amarillas"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/flores-amarillas.git
git push -u origin main
```

### 2. Crea el servicio en Render

1. Entra a <https://render.com> e inicia sesión con GitHub.
2. **New +** → **Web Service** → elige el repositorio `flores-amarillas`.
3. Completa así:

   | Campo | Valor |
   |---|---|
   | Language / Runtime | `Node` |
   | Build Command | `npm install` |
   | Start Command | `npm start` |
   | Instance Type | `Free` |
   | Health Check Path | `/health` |

4. **Create Web Service**. En un par de minutos tendrás la URL
   `https://flores-amarillas.onrender.com`.

También puedes usar **New + → Blueprint**: el archivo `render.yaml` de este
repositorio ya trae toda esa configuración y Render la aplica sola.

> Con el plan gratuito, el servicio se duerme tras un rato sin visitas y la
> primera carga después puede tardar unos 30 segundos. Si prefieres evitarlo, en
> Render puedes crear un **Static Site** apuntando a la carpeta `public`
> (Build Command vacío, Publish Directory `public`): sirve los mismos archivos
> sin servidor y no se duerme.

---

## Un solo archivo para mandar por WhatsApp

```bash
npm run build:unico
```

Genera `dist/flores-amarillas-para-ti.html` con el CSS, el JavaScript y el icono
incrustados: un único archivo que se puede enviar por WhatsApp, Telegram o correo
y que funciona al abrirlo, sin internet de por medio.

---

## Estructura

```
flores-amarillas/
├── public/
│   ├── index.html
│   ├── favicon.svg
│   ├── css/styles.css
│   └── js/
│       ├── config.js       ← lo que vas a querer cambiar
│       ├── flores.js       ← girasoles y margaritas en SVG + paralaje
│       ├── particulas.js   ← motor de partículas del canvas
│       ├── audio.js        ← melodía generada en el navegador
│       └── main.js         ← conecta todas las piezas
├── server.js               ← servidor Express para Render
├── render.yaml             ← configuración lista para Render
├── build-unico.js          ← genera el HTML de un solo archivo
└── package.json
```

---

## Detalles técnicos

- **Responsive**: el canvas se redimensiona con `devicePixelRatio` (tope 2), la
  cantidad de partículas se calcula según el área de la pantalla, las tipografías
  usan `clamp()` y en pantallas pequeñas se muestran menos flores. Probado en
  1440×900, 820×1180, 390×844, 320×568 y en horizontal.
- **Accesibilidad**: respeta `prefers-reduced-motion` (dibuja la figura quieta,
  sin animación), tiene foco visible en los botones, la carta se cierra con
  `Esc` y las capas decorativas están marcadas con `aria-hidden`.
- **Rendimiento**: las partículas se dibujan con un sprite pre-renderizado en
  lugar de `shadowBlur`, y la animación se detiene cuando la pestaña pasa a
  segundo plano.
- **Móvil**: soporta el paralaje por inclinación del dispositivo y respeta las
  zonas seguras (`env(safe-area-inset-*)`) de los teléfonos con notch.

## Licencia

MIT. Úsalo y regálalo.
