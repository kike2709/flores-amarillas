/* ============================================================
   MÚSICA — melodía suave generada con Web Audio API.
   No usa archivos de audio, así que no pesa ni depende de nada.
   ============================================================ */

const Musica = (function () {
  'use strict';

  let ctx = null, master = null, eco = null, temporizador = null;
  let sonando = false, paso = 0;

  // Escala pentatónica en Re mayor: suena dulce sin disonancias.
  const notas = [293.66, 329.63, 369.99, 440.00, 493.88, 587.33, 659.25, 739.99];
  const patron = [0, 2, 4, 3, 5, 4, 2, 1, 0, 3, 5, 6, 4, 2, 3, 1];

  function preparar(volumen) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();

    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    const filtro = ctx.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.frequency.value = 2400;
    filtro.connect(master);

    eco = ctx.createDelay(1.2);
    eco.delayTime.value = 0.38;
    const realim = ctx.createGain();
    realim.gain.value = 0.32;
    eco.connect(realim);
    realim.connect(eco);
    eco.connect(filtro);

    master.destino = filtro;
    master.volumenObjetivo = volumen;
    return true;
  }

  function nota(frecuencia, tiempo, duracion, ganancia) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = frecuencia;

    g.gain.setValueAtTime(0.0001, tiempo);
    g.gain.exponentialRampToValueAtTime(ganancia, tiempo + 0.06);
    g.gain.exponentialRampToValueAtTime(0.0001, tiempo + duracion);

    osc.connect(g);
    g.connect(master.destino);
    g.connect(eco);
    osc.start(tiempo);
    osc.stop(tiempo + duracion + 0.1);
  }

  function colchon(frecuencia, tiempo, duracion) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = frecuencia;
    g.gain.setValueAtTime(0.0001, tiempo);
    g.gain.exponentialRampToValueAtTime(0.09, tiempo + 1.2);
    g.gain.exponentialRampToValueAtTime(0.0001, tiempo + duracion);
    osc.connect(g);
    g.connect(master.destino);
    osc.start(tiempo);
    osc.stop(tiempo + duracion + 0.1);
  }

  function frase() {
    if (!sonando) return;
    const t0 = ctx.currentTime + 0.05;

    if (paso % 8 === 0) colchon(146.83, t0, 7.5);          // Re grave de fondo
    if (paso % 8 === 4) colchon(196.00, t0, 7.5);          // Sol grave

    for (let i = 0; i < 4; i++) {
      const idx = patron[(paso * 4 + i) % patron.length];
      nota(notas[idx], t0 + i * 0.44, 1.6, 0.12);
      if (i % 2 === 0) nota(notas[idx] * 2, t0 + i * 0.44 + 0.22, 0.9, 0.04);
    }

    paso++;
    temporizador = setTimeout(frase, 1760);
  }

  function encender(volumen) {
    if (sonando) return true;
    if (!ctx && !preparar(volumen)) return false;
    if (ctx.state === 'suspended') ctx.resume();
    sonando = true;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(volumen, ctx.currentTime + 2.5);
    frase();
    return true;
  }

  function apagar() {
    if (!sonando || !ctx) return;
    sonando = false;
    clearTimeout(temporizador);
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
  }

  return {
    alternar(volumen) { return sonando ? (apagar(), false) : encender(volumen); },
    encender,
    apagar,
    get activa() { return sonando; }
  };
})();
