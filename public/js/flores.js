/* ============================================================
   JARDÍN — dibuja las flores en SVG y las hace flotar.
   ============================================================ */

const Jardin = (function () {
  'use strict';

  let contenedor = null;
  let nodos = [];
  let parallaxActivo = false;

  /* --- Pétalo con forma de gota, apuntando hacia arriba desde el centro --- */
  function petalo(angulo, largo, ancho, relleno) {
    const c = 60;
    const y = c - largo;
    const d = `M${c},${c} C${c + ancho},${c - largo * 0.55} ${c + ancho * 0.6},${y + largo * 0.1} ${c},${y} ` +
              `C${c - ancho * 0.6},${y + largo * 0.1} ${c - ancho},${c - largo * 0.55} ${c},${c}Z`;
    return `<path d="${d}" fill="${relleno}" transform="rotate(${angulo} ${c} ${c})"/>`;
  }

  /* --- Semillas del corazón de la flor --- */
  function semillas(cantidad, radio) {
    let salida = '';
    const phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < cantidad; i++) {
      const r = radio * Math.sqrt(i / cantidad);
      const a = i * phi;
      const x = 60 + r * Math.cos(a);
      const y = 60 + r * Math.sin(a);
      salida += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="0.9" fill="#7A4E1E" opacity=".55"/>`;
    }
    return salida;
  }

  /* --- Un girasol: dos coronas de pétalos y centro con semillas --- */
  function girasol() {
    let p = '';
    for (let i = 0; i < 14; i++) p += petalo(i * (360 / 14), 46, 11, 'url(#g-petalo)');
    for (let i = 0; i < 12; i++) p += petalo(i * 30 + 13, 33, 9, 'url(#g-petalo-int)');
    return `<svg viewBox="0 0 120 120" role="img">
      <g>${p}</g>
      <circle cx="60" cy="60" r="17" fill="url(#g-centro)"/>
      ${semillas(46, 15)}
      <circle cx="60" cy="60" r="17" fill="none" stroke="#FFD87A" stroke-width=".8" opacity=".5"/>
    </svg>`;
  }

  /* --- Una margarita amarilla: menos pétalos, más abiertos --- */
  function margarita() {
    let p = '';
    for (let i = 0; i < 8; i++) p += petalo(i * 45, 50, 16, 'url(#g-petalo)');
    return `<svg viewBox="0 0 120 120" role="img">
      <g>${p}</g>
      <circle cx="60" cy="60" r="12" fill="url(#g-centro)"/>
      ${semillas(22, 10)}
    </svg>`;
  }

  const formas = { girasol, margarita };

  /* --- Construye el jardín a partir de la lista de mensajes --- */
  function sembrar(elemento, mensajes) {
    contenedor = elemento;
    contenedor.innerHTML = '';
    nodos = [];

    const pantallaPequena = Math.min(window.innerWidth, window.innerHeight) < 620;
    const lista = mensajes.filter(m => (pantallaPequena ? m.movil : true));

    lista.forEach((m, i) => {
      const flor = document.createElement('div');
      flor.className = 'flor';
      flor.style.setProperty('--x', m.x + '%');
      flor.style.setProperty('--y', m.y + '%');
      flor.style.setProperty('--z', m.z);
      flor.style.setProperty('--retraso', (0.5 + i * 0.28) + 's');
      flor.style.setProperty('--ritmo', (5.5 + (i % 5) * 1.1).toFixed(2) + 's');
      flor.style.setProperty('--desfase', (i * 0.43).toFixed(2) + 's');

      const cuerpo = document.createElement('div');
      cuerpo.className = 'flor__cuerpo';
      cuerpo.innerHTML = (formas[m.tipo] || girasol)();

      const texto = document.createElement('span');
      texto.className = 'flor__mensaje';
      texto.textContent = m.texto;

      cuerpo.appendChild(texto);
      flor.appendChild(cuerpo);
      contenedor.appendChild(flor);
      nodos.push(flor);
    });
  }

  /* --- Paralaje suave siguiendo el puntero o la inclinación del móvil --- */
  function moverCon(x, y) {
    if (!contenedor) return;
    contenedor.style.setProperty('--px', x.toFixed(3));
    contenedor.style.setProperty('--py', y.toFixed(3));
    nodos.forEach(n => {
      n.style.setProperty('--px', x.toFixed(3));
      n.style.setProperty('--py', y.toFixed(3));
    });
  }

  function activarParallax() {
    if (parallaxActivo) return;
    parallaxActivo = true;

    window.addEventListener('pointermove', e => {
      moverCon((e.clientX / window.innerWidth - 0.5) * 2, (e.clientY / window.innerHeight - 0.5) * 2);
    }, { passive: true });

    if (window.DeviceOrientationEvent && 'ontouchstart' in window) {
      window.addEventListener('deviceorientation', e => {
        if (e.gamma == null || e.beta == null) return;
        moverCon(Math.max(-1, Math.min(1, e.gamma / 35)), Math.max(-1, Math.min(1, (e.beta - 45) / 35)));
      }, { passive: true });
    }
  }

  /* --- Botón pequeño de la portada --- */
  function decorarPortada(grupo) {
    if (!grupo) return;
    let p = '';
    for (let i = 0; i < 10; i++) {
      const a = i * 36;
      const rad = (a - 90) * Math.PI / 180;
      p += `<ellipse cx="${(60 + Math.cos(rad) * 17).toFixed(1)}" cy="${(52 + Math.sin(rad) * 17).toFixed(1)}"
             rx="5" ry="10" fill="url(#g-petalo)" transform="rotate(${a} ${(60 + Math.cos(rad) * 17).toFixed(1)} ${(52 + Math.sin(rad) * 17).toFixed(1)})"/>`;
    }
    grupo.innerHTML = p;
  }

  return { sembrar, activarParallax, decorarPortada };
})();
