/* ============================================================
   PARTÍCULAS — polen dorado de fondo y un enjambre que se
   reagrupa formando un corazón, una flor y un texto.
   ============================================================ */

const Particulas = (function () {
  'use strict';

  let lienzo, ctx, ancho = 0, alto = 0, dpr = 1;
  let polen = [], enjambre = [], sprite = null;
  let figuras = [], figuraActual = 0, puntos = [];
  let reloj = 0, ultimo = 0, cambio = 0, animando = false, cuadro = null;
  let tipoActual = 'corazon';
  let radio = 200, movimientoReducido = false;
  let opciones = { segundosPorFigura: 7 };

  /* ---------- utilidades ---------- */

  const azar = (a, b) => a + Math.random() * (b - a);

  function crearSprite() {
    const s = document.createElement('canvas');
    const tam = 64;
    s.width = s.height = tam;
    const c = s.getContext('2d');
    const g = c.createRadialGradient(tam / 2, tam / 2, 0, tam / 2, tam / 2, tam / 2);
    g.addColorStop(0.00, 'rgba(255,255,240,1)');
    g.addColorStop(0.22, 'rgba(255,224,130,0.85)');
    g.addColorStop(0.55, 'rgba(255,170,30,0.28)');
    g.addColorStop(1.00, 'rgba(255,150,0,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, tam, tam);
    return s;
  }

  /* ---------- figuras: devuelven puntos normalizados en [-1, 1] ---------- */

  // Ecuación implícita del corazón: (x² + y² − 1)³ − x²y³ ≤ 0
  const dentroCorazon = (x, y) => {
    const a = x * x + y * y - 1;
    return a * a * a - x * x * y * y * y <= 0;
  };

  // Distancia del centro al borde en una dirección dada (búsqueda binaria)
  function bordeCorazon(cos, sin) {
    let bajo = 0, alto = 1.7;
    for (let i = 0; i < 20; i++) {
      const medio = (bajo + alto) / 2;
      if (dentroCorazon(cos * medio, -0.05 + sin * medio)) bajo = medio;
      else alto = medio;
    }
    return bajo;
  }

  function puntosCorazon(n) {
    const lista = [];
    const contorno = Math.round(n * 0.38);

    // Contorno: marca la silueta para que el corazón se lea nítido
    for (let i = 0; i < contorno; i++) {
      const t = Math.random() * Math.PI * 2;
      const cos = Math.cos(t), sin = Math.sin(t);
      const r = bordeCorazon(cos, sin) * azar(0.93, 1.0);
      lista.push({ x: cos * r / 1.22, y: -(-0.05 + sin * r + 0.1) / 1.22 });
    }

    // Relleno interior uniforme
    let intentos = 0;
    while (lista.length < n && intentos < n * 80) {
      intentos++;
      const x = azar(-1.2, 1.2);
      const y = azar(-1.3, 1.1);
      if (dentroCorazon(x, y)) lista.push({ x: x / 1.22, y: -(y + 0.1) / 1.22 });
    }
    while (lista.length < n) lista.push({ x: azar(-0.05, 0.05), y: azar(-0.05, 0.05) });
    return lista;
  }

  function puntosFlor(n) {
    const lista = [];
    const petalos = 5;
    const borde = t => 0.22 + 0.78 * Math.abs(Math.sin(petalos / 2 * t));

    const contorno = Math.round(n * 0.34);
    const centro = Math.round(n * 0.14);

    for (let i = 0; i < contorno; i++) {        // silueta de los pétalos
      const t = Math.random() * Math.PI * 2;
      const r = borde(t) * azar(0.94, 1);
      lista.push({ x: Math.cos(t) * r, y: Math.sin(t) * r });
    }
    for (let i = 0; i < centro; i++) {          // corazón de la flor
      const t = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 0.19;
      lista.push({ x: Math.cos(t) * r, y: Math.sin(t) * r });
    }
    while (lista.length < n) {                  // relleno de los pétalos
      const t = Math.random() * Math.PI * 2;
      const r = borde(t) * Math.sqrt(Math.random());
      lista.push({ x: Math.cos(t) * r, y: Math.sin(t) * r });
    }
    return lista;
  }

  function puntosTexto(texto, n) {
    const off = document.createElement('canvas');
    const w = 600, h = 260;
    off.width = w; off.height = h;
    const c = off.getContext('2d');
    c.fillStyle = '#fff';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    let tam = 160;
    c.font = `italic 600 ${tam}px "Cormorant Garamond", Georgia, serif`;
    while (c.measureText(texto).width > w * 0.9 && tam > 30) {
      tam -= 8;
      c.font = `italic 600 ${tam}px "Cormorant Garamond", Georgia, serif`;
    }
    c.fillText(texto, w / 2, h / 2);

    const datos = c.getImageData(0, 0, w, h).data;
    const candidatos = [];
    for (let y = 0; y < h; y += 2) {
      for (let x = 0; x < w; x += 2) {
        if (datos[(y * w + x) * 4 + 3] > 130) {
          candidatos.push({ x: (x - w / 2) / (w / 2), y: (y - h / 2) / (w / 2) });
        }
      }
    }
    if (!candidatos.length) return puntosCorazon(n);

    // Reparto regular sobre la tinta: así las letras quedan parejas y legibles
    const lista = [];
    for (let i = 0; i < n; i++) {
      const p = candidatos[Math.floor(i * candidatos.length / n) % candidatos.length];
      lista.push({ x: p.x + azar(-0.002, 0.002), y: p.y + azar(-0.002, 0.002) });
    }
    return lista;
  }

  function generarFigura(def, n) {
    tipoActual = def.forma || 'corazon';
    if (def.forma === 'flor') return puntosFlor(n);
    if (def.forma === 'texto') return puntosTexto(def.texto || 'Te amo', n);
    return puntosCorazon(n);
  }

  // El texto necesita más ancho y partículas más pequeñas para poder leerse.
  const radioFigura = () =>
    tipoActual === 'texto' ? Math.min(ancho * 0.30, alto * 0.45) : radio;

  /* ---------- tamaño del lienzo ---------- */

  function medir() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    ancho = window.innerWidth;
    alto = window.innerHeight;
    lienzo.width = Math.round(ancho * dpr);
    lienzo.height = Math.round(alto * dpr);
    lienzo.style.width = ancho + 'px';
    lienzo.style.height = alto + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    radio = Math.min(ancho, alto) * (ancho < 620 ? 0.27 : 0.23);
  }

  function cantidadEnjambre() {
    const area = ancho * alto;
    return Math.round(Math.max(260, Math.min(900, area / 1700)));
  }

  function cantidadPolen() {
    const area = ancho * alto;
    return Math.round(Math.max(60, Math.min(220, area / 7000)));
  }

  /* ---------- poblaciones ---------- */

  function crearPolen() {
    polen = [];
    const n = cantidadPolen();
    for (let i = 0; i < n; i++) {
      polen.push({
        x: Math.random() * ancho,
        y: Math.random() * alto,
        r: azar(1.1, 3.4),
        vx: azar(-0.14, 0.14),
        vy: azar(-0.32, -0.05),
        a: azar(0.25, 0.8),
        f: azar(0.4, 1.4),
        fase: Math.random() * Math.PI * 2
      });
    }
  }

  function crearEnjambre() {
    const n = cantidadEnjambre();
    enjambre = [];
    for (let i = 0; i < n; i++) {
      enjambre.push({
        x: ancho / 2 + azar(-ancho, ancho) * 0.5,
        y: alto / 2 + azar(-alto, alto) * 0.5,
        vx: 0, vy: 0, tx: ancho / 2, ty: alto / 2,
        s: azar(2.4, 7.2),
        a: azar(0.45, 1),
        f: azar(0.6, 1.8),
        fase: Math.random() * Math.PI * 2,
        blanco: Math.random() < 0.12
      });
    }
  }

  function asignarObjetivos(conImpulso) {
    if (!puntos.length) return;
    const cx = ancho / 2;
    const cy = alto / 2;
    const r = radioFigura();
    enjambre.forEach((p, i) => {
      const q = puntos[i % puntos.length];
      p.tx = cx + q.x * r;
      p.ty = cy + q.y * r;
      if (conImpulso) {
        const a = Math.random() * Math.PI * 2;
        const fuerza = azar(1.5, 5.5);
        p.vx += Math.cos(a) * fuerza;
        p.vy += Math.sin(a) * fuerza;
      }
    });
  }

  function siguienteFigura(conImpulso) {
    if (!figuras.length) return;
    puntos = generarFigura(figuras[figuraActual], enjambre.length);
    asignarObjetivos(conImpulso);
    figuraActual = (figuraActual + 1) % figuras.length;
  }

  /* ---------- dibujo ---------- */

  function halo() {
    const cx = ancho / 2, cy = alto / 2;
    const pulso = 0.82 + Math.sin(reloj * 0.9) * 0.18;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radio * 2.5 * pulso);
    g.addColorStop(0, 'rgba(255, 210, 90, 0.16)');
    g.addColorStop(0.45, 'rgba(210, 170, 40, 0.06)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, ancho, alto);
  }

  function dibujar(dt) {
    ctx.clearRect(0, 0, ancho, alto);
    ctx.globalCompositeOperation = 'lighter';

    halo();

    // polen de fondo
    for (const p of polen) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.y < -20) { p.y = alto + 20; p.x = Math.random() * ancho; }
      if (p.x < -20) p.x = ancho + 20;
      if (p.x > ancho + 20) p.x = -20;
      const brillo = p.a * (0.55 + 0.45 * Math.sin(reloj * p.f + p.fase));
      const t = p.r * 7;
      ctx.globalAlpha = Math.max(0, brillo) * 0.7;
      ctx.drawImage(sprite, p.x - t / 2, p.y - t / 2, t, t);
    }

    // enjambre que forma la figura
    const esTexto = tipoActual === 'texto';
    const k = 0.055, freno = 0.88;
    for (const p of enjambre) {
      p.vx += (p.tx - p.x) * k;
      p.vy += (p.ty - p.y) * k;
      p.vx *= freno;
      p.vy *= freno;
      p.x += p.vx * dt + Math.sin(reloj * p.f + p.fase) * 0.22 * dt;
      p.y += p.vy * dt + Math.cos(reloj * p.f * 0.8 + p.fase) * 0.22 * dt;

      const brillo = p.a * (0.6 + 0.4 * Math.sin(reloj * 1.6 + p.fase));
      const t = esTexto
        ? (p.blanco ? 9 : 7.5) * (0.85 + p.a * 0.3)
        : p.s * (p.blanco ? 5.4 : 4.4);
      const fuerza = (p.blanco ? 0.95 : 0.72) * (esTexto ? 1.45 : 1);
      ctx.globalAlpha = Math.min(1, Math.max(0, brillo) * fuerza);
      ctx.drawImage(sprite, p.x - t / 2, p.y - t / 2, t, t);
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  /* ---------- bucle ---------- */

  function ciclo(ahora) {
    if (!animando) return;
    const bruto = (ahora - ultimo) / 16.6667;
    const dt = Math.min(bruto || 1, 3);
    ultimo = ahora;
    reloj += dt * 0.016;

    cambio += dt * 0.016;
    if (cambio >= opciones.segundosPorFigura) {
      cambio = 0;
      siguienteFigura(true);
    }

    dibujar(dt);
    cuadro = requestAnimationFrame(ciclo);
  }

  function arrancar() {
    if (animando) return;
    animando = true;
    ultimo = performance.now();
    cuadro = requestAnimationFrame(ciclo);
  }

  function detener() {
    animando = false;
    if (cuadro) cancelAnimationFrame(cuadro);
  }

  /* ---------- API ---------- */

  function iniciar(elemento, config) {
    lienzo = elemento;
    ctx = lienzo.getContext('2d', { alpha: true });
    sprite = crearSprite();
    figuras = config.figuras && config.figuras.length ? config.figuras : [{ forma: 'corazon' }];
    opciones.segundosPorFigura = config.segundosPorFigura || 7;
    movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    medir();
    crearPolen();
    crearEnjambre();
    siguienteFigura(false);

    let temporizador;
    window.addEventListener('resize', () => {
      clearTimeout(temporizador);
      temporizador = setTimeout(() => {
        medir();
        crearPolen();
        crearEnjambre();
        puntos = generarFigura(figuras[(figuraActual - 1 + figuras.length) % figuras.length], enjambre.length);
        asignarObjetivos(false);
        if (!animando) dibujar(1);
      }, 180);
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) detener();
      else if (!movimientoReducido) arrancar();
    });

    if (movimientoReducido) {
      // Sin animación: coloca las partículas en su sitio y dibuja una sola vez.
      for (let i = 0; i < 60; i++) {
        enjambre.forEach(p => { p.x += (p.tx - p.x) * 0.25; p.y += (p.ty - p.y) * 0.25; });
      }
      dibujar(1);
    } else {
      arrancar();
    }
  }

  return { iniciar, arrancar, detener };
})();
