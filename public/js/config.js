/* ============================================================
   CONFIGURACIÓN — cambia sólo este archivo para personalizar.
   También puedes personalizar sin tocar código usando la URL:
   ?para=Ana&de=Luis&fecha=21%20de%20septiembre
   ============================================================ */

const CONFIG = {
  // A quién va dirigido y quién lo envía.
  para: 'Tatiana<3',
  de: 'Alguien que te piensa',
  fecha: '21 de septiembre',

  // Mensajes que flotan junto a las flores.
  // x / y van en porcentaje de la pantalla, z es la profundidad (0.45 = lejos, 1 = cerca).
  // movil: true → también se muestra en pantallas pequeñas.
  mensajes: [
    { texto: 'Te amo',           x: 14, y: 26, z: 0.95, movil: true,  tipo: 'girasol' },
    { texto: 'Eres preciosa',    x: 85, y: 31, z: 0.85, movil: true,  tipo: 'margarita' },
    { texto: 'Mi amor',          x: 19, y: 62, z: 0.80, movil: true,  tipo: 'margarita' },
    { texto: 'Me encantas',      x: 82, y: 66, z: 0.92, movil: true,  tipo: 'girasol' },
    { texto: 'Eres mi todo',     x: 13, y: 86, z: 0.62, movil: true,  tipo: 'girasol' },
    { texto: 'Siempre juntos',   x: 40, y: 14, z: 0.55, movil: true,  tipo: 'margarita' },
    { texto: 'Amor de mi vida',  x: 90, y: 88, z: 0.58, movil: false, tipo: 'girasol' },
    { texto: 'Eres mi sol',      x: 7,  y: 45, z: 0.60, movil: false, tipo: 'margarita' },
    { texto: 'Mi lugar favorito',x: 70, y: 17, z: 0.48, movil: false, tipo: 'girasol' },
    { texto: 'Gracias por tanto',x: 27, y: 82, z: 0.50, movil: false, tipo: 'margarita' }
  ],

  // Figuras que dibujan las partículas en el centro, en orden.
  // Opciones: 'corazon', 'flor', o un texto entre comillas, p. ej. { texto: 'Te amo' }
  figuras: [
    { forma: 'corazon' },
    { forma: 'flor' },
    { forma: 'texto', texto: 'Te amo' }
  ],
  segundosPorFigura: 7,

  // La carta que se abre con el botón.
  carta: {
    titulo: 'Lo que quería decirte',
    parrafos: [
      'Hoy empieza la primavera y toca regalar flores amarillas, así que te mandé las mías. Estas no se marchitan: van a seguir aquí mañana, y el mes que viene, y cuando quieras volver a verlas.',
      'Me gusta lo fácil que es todo contigo. Los días normales, los planes que salen mal, el silencio cuando no hay nada que decir. Nada de eso pesa cuando estás.',
      'No hace falta una ocasión especial para decírtelo, pero ya que existe una: te quiero, y me alegra muchísimo que estés en mi vida.'
    ],
    firma: 'El amor de tu vida '
  },

  // Música ambiental generada en el navegador (sin archivos externos).
  musica: {
    activaAlAbrir: true,
    volumen: 0.16
  }
};

/* Lee los parámetros de la URL y sobreescribe lo que corresponda. */
(function aplicarParametros() {
  const p = new URLSearchParams(location.search);
  const limpiar = (v, max) => v.replace(/[<>]/g, '').trim().slice(0, max);

  if (p.get('para'))   CONFIG.para = limpiar(p.get('para'), 24);
  if (p.get('de'))     CONFIG.de = limpiar(p.get('de'), 32);
  if (p.get('fecha'))  CONFIG.fecha = limpiar(p.get('fecha'), 32);
  if (p.get('firma'))  CONFIG.carta.firma = limpiar(p.get('firma'), 40);

  // ?mensaje=Te+amo|Eres+mi+sol|Mi+vida  → reemplaza los textos flotantes
  if (p.get('mensaje')) {
    const textos = p.get('mensaje').split('|').map(t => limpiar(t, 22)).filter(Boolean);
    if (textos.length) {
      CONFIG.mensajes = CONFIG.mensajes.map((m, i) => ({ ...m, texto: textos[i % textos.length] }));
    }
  }

  // ?carta=Primer+párrafo||Segundo+párrafo
  if (p.get('carta')) {
    const parrafos = p.get('carta').split('||').map(t => limpiar(t, 600)).filter(Boolean);
    if (parrafos.length) CONFIG.carta.parrafos = parrafos;
  }

  if (p.get('musica') === 'no') CONFIG.musica.activaAlAbrir = false;
})();
