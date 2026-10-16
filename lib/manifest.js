/* =============================================================
   Avril · Datos de la marca (un solo lugar para editar)
   - PRECIOS: precios de ejemplo, reemplazar por los reales.
   - CAJAS_LISTAS: plantillas que aparecen en Inicio, Inspírate y el armador.
   ============================================================= */
(function () {
  "use strict";

  // Precios de ejemplo, reemplazar por los reales [PRECIO]
  var PRECIOS = {
    trufa: 3.50,
    alfajor: 4.00,
    chocoteja: 3.00,
    brownie: 5.00,
    caja: { 4: 6, 6: 8, 9: 10, 12: 12, 24: 18 }, // incluye caja y lazo
    extras: { qr: 5, fotoComestible: 6 },
    // Cotizador para empresas (también de ejemplo)
    empresas: {
      cajita: 4.00,          // cajita corporativa con sticker de logo
      piezaPromedio: 3.30,   // precio promedio por pieza
      descuentos: { 100: 0.05, 200: 0.10 } // desde N cajitas
    }
  };

  var PIEZAS = {
    trufa:     { nombre: "Trufa",     detalle: "Bañada a mano" },
    alfajor:   { nombre: "Alfajor",   detalle: "Manjar blanco" },
    chocoteja: { nombre: "Chocoteja", detalle: "Rellena y envuelta" },
    brownie:   { nombre: "Brownie",   detalle: "Intenso, individual" }
  };

  var BANADOS = {
    rosado: { nombre: "Rosado", color: "#F4A9A4" },
    bitter: { nombre: "Bitter", color: "#3A1A12" },
    blanco: { nombre: "Blanco", color: "#F3E9DC" }
  };

  // Estado inicial de la demo del armador
  var DEMO = {
    size: 9,
    coating: "rosado",
    topping: "ninguno",
    message: "Feliz aniversario, amor",
    pieces: ["trufa", "alfajor", "chocoteja", "chocoteja", "trufa", "brownie", "alfajor", "trufa", null],
    extras: { qr: false, fotoComestible: false, lazo: true }
  };

  var CAJAS_LISTAS = [
    { id: "amiga", nombre: "Cumple de mejor amiga", ocasion: "cumpleanos", img: "assets/img/caja-amiga.webp",
      size: 9, coating: "rosado", topping: "sprinkles", message: "Feliz cumple, amiga",
      pieces: ["trufa", "alfajor", "trufa", "chocoteja", "brownie", "chocoteja", "trufa", "alfajor", "trufa"] },
    { id: "perdon", nombre: "Perdón 🥺", ocasion: "disculpa", img: "assets/img/caja-perdon.webp",
      size: 6, coating: "rosado", topping: "oro", message: "¿Me perdonas?",
      pieces: ["trufa", "trufa", "alfajor", "alfajor", "trufa", "trufa"] },
    { id: "chamba", nombre: "Felicitaciones por tu chamba nueva", ocasion: "amistad", img: "assets/img/caja-chamba.webp",
      size: 6, coating: "bitter", topping: "frutos", message: "¡Lo lograste!",
      pieces: ["brownie", "chocoteja", "trufa", "trufa", "chocoteja", "brownie"] },
    { id: "aniversario", nombre: "Aniversario", ocasion: "aniversario", img: "assets/img/caja-aniversario.webp",
      size: 12, coating: "rosado", topping: "oro", message: "Feliz aniversario, amor",
      pieces: ["trufa", "alfajor", "trufa", "chocoteja", "alfajor", "trufa", "trufa", "chocoteja", "trufa", "alfajor", "trufa", "brownie"] },
    { id: "oficina", nombre: "Cumple en la oficina", ocasion: "corporativo", img: "assets/img/caja-corporativa.webp",
      size: 24, coating: "bitter", topping: "ninguno", message: "Feliz cumple, equipo",
      pieces: ["trufa","alfajor","chocoteja","brownie","trufa","alfajor","chocoteja","brownie","trufa","alfajor","chocoteja","brownie","trufa","alfajor","chocoteja","brownie","trufa","alfajor","chocoteja","brownie","trufa","alfajor","chocoteja","brownie"] },
    { id: "amigas", nombre: "Amigas desde siempre", ocasion: "amistad", img: "assets/img/testimonio-1.webp",
      size: 4, coating: "blanco", topping: "frutos", message: "Gracias por tanto",
      pieces: ["trufa", "alfajor", "chocoteja", "trufa"] },
    { id: "primer-mes", nombre: "Primer mes juntos", ocasion: "aniversario", img: "assets/img/trufas-rosadas.webp",
      size: 6, coating: "rosado", topping: "oro", message: "Nuestro primer mes",
      pieces: ["trufa", "trufa", "trufa", "trufa", "trufa", "trufa"] },
    { id: "sorpresa", nombre: "Sorpresa de cumple", ocasion: "cumpleanos", img: "assets/img/brownies.webp",
      size: 9, coating: "bitter", topping: "sprinkles", message: "¡Sorpresa!",
      pieces: ["brownie", "trufa", "brownie", "alfajor", "chocoteja", "alfajor", "brownie", "trufa", "brownie"] }
  ];

  window.__BRAND__ = {
    nombre: "Avril · Artesanía hecha dulce",
    whatsapp: "51944999854",
    instagram: "[URL INSTAGRAM]",
    tiktok: "[URL TIKTOK]",
    PRECIOS: PRECIOS,
    PIEZAS: PIEZAS,
    BANADOS: BANADOS,
    DEMO: DEMO,
    CAJAS_LISTAS: CAJAS_LISTAS
  };
})();
