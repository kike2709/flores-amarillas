/* ============================================================
   PRINCIPAL — arma la página y conecta todas las piezas.
   ============================================================ */

(function () {
  'use strict';

  const $ = id => document.getElementById(id);

  const cuerpo = document.body;
  const portada = $('portada');
  const botonAbrir = $('abrir');
  const botonCarta = $('verCarta');
  const botonMusica = $('musica');
  const botonCerrar = $('cerrarCarta');
  const carta = $('carta');

  let abierto = false;

  /* ---------- contenido personalizado ---------- */

  function escribirTextos() {
    document.title = `Flores amarillas para ${CONFIG.para}`;
    $('nombre').textContent = CONFIG.para;
    $('fecha').textContent = CONFIG.fecha;

    $('cartaTitulo').textContent = CONFIG.carta.titulo;
    $('cartaCuerpo').innerHTML = '';
    CONFIG.carta.parrafos.forEach(t => {
      const p = document.createElement('p');
      p.textContent = t;
      $('cartaCuerpo').appendChild(p);
    });
    $('cartaFirma').textContent = `${CONFIG.carta.firma}, ${CONFIG.de}`;

    // La figura de texto usa el nombre si no se indicó otra cosa.
    CONFIG.figuras = CONFIG.figuras.map(f =>
      f.forma === 'texto' && !f.texto ? { forma: 'texto', texto: CONFIG.para } : f
    );
  }

  /* ---------- abrir el regalo ---------- */

  function abrirRamo() {
    if (abierto) return;
    abierto = true;

    cuerpo.classList.remove('cerrado');
    cuerpo.classList.add('abierto');
    $('escena').setAttribute('aria-hidden', 'false');
    $('barra').setAttribute('aria-hidden', 'false');
    portada.setAttribute('aria-hidden', 'true');

    Jardin.activarParallax();

    if (CONFIG.musica.activaAlAbrir) {
      // El clic del usuario es lo que permite reproducir audio en el navegador.
      const ok = Musica.encender(CONFIG.musica.volumen);
      actualizarBotonMusica(ok);
    }

    setTimeout(() => botonCarta.focus(), 1400);
  }

  /* ---------- carta ---------- */

  function abrirCarta() {
    carta.hidden = false;
    requestAnimationFrame(() => carta.classList.add('visible'));
    botonCerrar.focus();
  }

  function cerrarCarta() {
    carta.classList.remove('visible');
    setTimeout(() => { carta.hidden = true; botonCarta.focus(); }, 420);
  }

  /* ---------- música ---------- */

  function actualizarBotonMusica(activa) {
    botonMusica.setAttribute('aria-pressed', activa ? 'true' : 'false');
    botonMusica.setAttribute('aria-label', activa ? 'Quitar música' : 'Poner música');
  }

  /* ---------- arranque ---------- */

  escribirTextos();
  Jardin.decorarPortada(document.querySelector('.brote__petalos'));
  Jardin.sembrar($('jardin'), CONFIG.mensajes);
  Particulas.iniciar($('lienzo'), {
    figuras: CONFIG.figuras,
    segundosPorFigura: CONFIG.segundosPorFigura
  });

  botonAbrir.addEventListener('click', abrirRamo);
  botonCarta.addEventListener('click', abrirCarta);
  botonCerrar.addEventListener('click', cerrarCarta);
  botonMusica.addEventListener('click', () => {
    actualizarBotonMusica(Musica.alternar(CONFIG.musica.volumen));
  });

  carta.addEventListener('click', e => { if (e.target === carta) cerrarCarta(); });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !carta.hidden) cerrarCarta();
    if ((e.key === 'Enter' || e.key === ' ') && !abierto && document.activeElement === cuerpo) {
      e.preventDefault();
      abrirRamo();
    }
  });

  // Vuelve a repartir las flores si cambia mucho el tamaño (girar el móvil).
  let anchoPrevio = window.innerWidth;
  let temporizador;
  window.addEventListener('resize', () => {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => {
      if (Math.abs(window.innerWidth - anchoPrevio) < 80) return;
      anchoPrevio = window.innerWidth;
      Jardin.sembrar($('jardin'), CONFIG.mensajes);
    }, 260);
  }, { passive: true });
})();
