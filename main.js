/* =============================================================
   Avril · Artesanía hecha dulce — lógica de la web
   Patrón IIFE (sin módulos) para que funcione en cualquier hosting
   y abriendo el archivo directamente. Sin backend: todo se simula.
   ============================================================= */
(function () {
  "use strict";

  var B = window.__BRAND__ || {};
  var P = B.PRECIOS || {};
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var WA = "https://wa.me/" + (B.whatsapp || "51944999854");

  /* ---------- Ayudantes ---------- */
  function $(sel, scope) { return (scope || document).querySelector(sel); }
  function $$(sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function safe(fn, name) { try { fn(); } catch (e) { console.warn("[" + name + "]", e); } }
  function money(n) { return "S/ " + (Math.round(n * 100) / 100).toFixed(2); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  // localStorage siempre envuelto en try/catch: la web funciona aunque falle
  var store = {
    get: function (k, def) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    sget: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    sset: function (k, v) { try { sessionStorage.setItem(k, v); return true; } catch (e) { return false; } },
    sdel: function (k) { try { sessionStorage.removeItem(k); } catch (e) {} }
  };

  var toastTimer;
  function toast(msg) {
    var t = $(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); t.setAttribute("aria-live", "polite"); document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("is-on"); }, 3200);
  }

  /* =============================================================
     Caja: precio y dibujo (se usa en el armador, resumen,
     confirmación, Mi Avril y Mis diseños)
     ============================================================= */
  var COLS = { 4: 2, 6: 3, 9: 3, 12: 4, 24: 6 };
  var SIZES = [4, 6, 9, 12, 24];

  function normalize(s) {
    var d = clone(B.DEMO || {});
    s = s || {};
    var st = {
      size: SIZES.indexOf(+s.size) > -1 ? +s.size : d.size,
      coating: (B.BANADOS && B.BANADOS[s.coating]) ? s.coating : d.coating,
      topping: ["oro", "sprinkles", "frutos", "ninguno"].indexOf(s.topping) > -1 ? s.topping : "ninguno",
      message: typeof s.message === "string" ? s.message.slice(0, 28) : d.message,
      pieces: Array.isArray(s.pieces) ? s.pieces.slice() : d.pieces.slice(),
      extras: { qr: !!(s.extras && s.extras.qr), fotoComestible: !!(s.extras && s.extras.fotoComestible), lazo: s.extras ? s.extras.lazo !== false : true }
    };
    st.pieces = st.pieces.map(function (p) { return P[p] != null && typeof P[p] === "number" ? p : null; });
    while (st.pieces.length < st.size) st.pieces.push(null);
    st.pieces.length = st.size;
    return st;
  }

  function priceOf(s) {
    var t = 0;
    s.pieces.forEach(function (p) { if (p) t += P[p] || 0; });
    t += (P.caja && P.caja[s.size]) || 0;
    if (s.extras.qr) t += P.extras.qr;
    if (s.extras.fotoComestible) t += P.extras.fotoComestible;
    return t;
  }

  function countOf(s, type) { return s.pieces.filter(function (p) { return p === type; }).length; }

  function boxHTML(s, opts) {
    opts = opts || {};
    var color = (B.BANADOS[s.coating] || {}).color || "#F4A9A4";
    var slots = s.pieces.map(function (p, i) {
      if (!p) return '<div class="slot is-empty" aria-label="Espacio vacío"></div>';
      var name = B.PIEZAS[p].nombre + (p === "trufa" ? " " + B.BANADOS[s.coating].nombre.toLowerCase() : "");
      var piece = '<span class="piece ' + p + (opts.newIndex === i ? " is-new" : "") + '" aria-hidden="true"></span>';
      if (opts.interactive) return '<div class="slot"><button type="button" data-remove="' + i + '" aria-label="Quitar ' + esc(name) + '">' + piece + "</button></div>";
      return '<div class="slot" role="img" aria-label="' + esc(name) + '">' + piece + "</div>";
    }).join("");
    return '<div class="box-stage top-' + s.topping + '" style="--trufa:' + color + '">' +
      '<div class="box-lid' + (s.extras.lazo ? " has-lazo" : "") + '"><span class="ribbon" aria-hidden="true"></span>' +
      "<small>AVRIL · ARTESANÍA HECHA DULCE</small>" +
      '<span class="lid-msg">' + esc(s.message || " ") + "</span></div>" +
      '<div class="box-base"><div class="box-grid" style="--cols:' + COLS[s.size] + '">' + slots + "</div></div></div>";
  }

  function renderBox(el, s, opts) { if (el) el.innerHTML = boxHTML(s, opts); }

  function piecesSummary(s) {
    var parts = [];
    ["trufa", "alfajor", "chocoteja", "brownie"].forEach(function (t) {
      var n = countOf(s, t);
      if (n) parts.push(n + " " + B.PIEZAS[t].nombre.toLowerCase() + (n > 1 ? "s" : ""));
    });
    return parts.join(" · ") || "Caja vacía";
  }

  // Codificar el diseño en un enlace para compartir
  function encodeState(s) {
    try { return btoa(unescape(encodeURIComponent(JSON.stringify(s)))).replace(/=+$/, ""); } catch (e) { return ""; }
  }
  function decodeState(str) {
    try { return JSON.parse(decodeURIComponent(escape(atob(str)))); } catch (e) { return null; }
  }

  // Animación del número del precio
  function tweenMoney(el, to) {
    if (!el) return;
    var from = parseFloat(el.dataset.value || "0");
    el.dataset.value = to;
    if (reduced || Math.abs(to - from) < 0.01) { el.textContent = money(to); return; }
    var t0 = performance.now(), dur = 420;
    (function step(t) {
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = money(from + (to - from) * e);
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* =============================================================
     Comunes a todas las páginas
     ============================================================= */
  function initHeader() {
    var h = $(".site-header");
    if (!h) return;
    var on = function () { h.classList.toggle("is-scrolled", scrollY > 8); };
    on();
    addEventListener("scroll", on, { passive: true });
  }

  function initDrawer() {
    var d = $("#drawer"), openB = $("[data-open-drawer]");
    if (!d || !openB) return;
    function set(open) {
      d.classList.toggle("is-open", open);
      openB.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
      if (open) { var f = $("a, button", d); if (f) f.focus(); } else openB.focus();
    }
    openB.addEventListener("click", function () { set(true); });
    $$("[data-close-drawer]", d).forEach(function (b) { b.addEventListener("click", function () { set(false); }); });
    $$("nav a", d).forEach(function (a) { a.addEventListener("click", function () { d.classList.remove("is-open"); document.body.style.overflow = ""; }); });
    addEventListener("keydown", function (e) { if (e.key === "Escape" && d.classList.contains("is-open")) set(false); });
  }

  function initReveals() {
    var els = $$(".reveal");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("is-visible"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); } });
    }, { threshold: 0.01, rootMargin: "0px 0px -4% 0px" });
    els.forEach(function (e) { io.observe(e); });
    // Red de seguridad: a los 6 s se muestra todo lo que quede oculto
    setTimeout(function () { $$(".reveal:not(.is-visible)").forEach(function (e) { e.classList.add("is-visible"); }); }, 6000);
  }

  // Comparador antes / después (arrastrable, accesible con teclado)
  function initBeforeAfter(root) {
    $$(".ba", root).forEach(function (ba) {
      if (ba.dataset.bound) return;
      ba.dataset.bound = "1";
      var r = $("input[type=range]", ba);
      if (!r) return;
      var set = function () { ba.style.setProperty("--pos", r.value + "%"); };
      r.addEventListener("input", set);
      set();
    });
  }

  // Precios de cajas listas calculados desde la configuración
  function initReadyPrices() {
    $$("[data-price-of]").forEach(function (el) {
      var c = (B.CAJAS_LISTAS || []).filter(function (x) { return x.id === el.dataset.priceOf; })[0];
      if (c) el.textContent = money(priceOf(normalize(c)));
    });
    $$("[data-demo-price]").forEach(function (el) { el.textContent = money(priceOf(normalize(B.DEMO))); });
  }

  function initParallax() {
    if (reduced || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    $$("[data-parallax]").forEach(function (img) {
      gsap.fromTo(img, { yPercent: -4 }, { yPercent: 4, ease: "none", scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: 0.6 } });
    });
  }

  // Leer imagen subida en el navegador (no se sube a ningún servidor)
  function readImage(file, cb) {
    if (!file || !/^image\//.test(file.type)) { toast("Esa imagen no se pudo leer. Prueba con otra o pega el link."); return; }
    var fr = new FileReader();
    fr.onload = function () {
      // Reducimos la imagen para guardarla en la sesión sin problemas de espacio
      var img = new Image();
      img.onload = function () {
        try {
          var max = 900, k = Math.min(1, max / Math.max(img.width, img.height));
          var c = document.createElement("canvas");
          c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
          c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
          cb(c.toDataURL("image/jpeg", 0.85));
        } catch (e) { cb(fr.result); }
      };
      img.onerror = function () { toast("Esa imagen no se pudo leer. Prueba con otra o pega el link."); };
      img.src = fr.result;
    };
    fr.onerror = function () { toast("Esa imagen no se pudo leer. Prueba con otra o pega el link."); };
    fr.readAsDataURL(file);
  }

  function bindDropzone(zone, onImage) {
    if (!zone || zone.dataset.bound) return;
    zone.dataset.bound = "1";
    var input = $("input[type=file]", zone);
    ["dragenter", "dragover"].forEach(function (ev) { zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.add("is-over"); }); });
    ["dragleave", "drop"].forEach(function (ev) { zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.remove("is-over"); }); });
    zone.addEventListener("drop", function (e) { var f = e.dataTransfer && e.dataTransfer.files[0]; if (f) readImage(f, onImage); });
    if (input) input.addEventListener("change", function () { if (input.files[0]) readImage(input.files[0], onImage); });
  }

  /* ---------- Inicio ---------- */
  function initHomeUpload() {
    var zone = $("[data-home-drop]");
    if (!zone) return;
    bindDropzone(zone, function (data) {
      store.sset("avril.ref", data);
      store.sdel("avril.refLink");
      location.href = "disena.html?ref=1";
    });
    var form = $("[data-home-link]");
    if (form) form.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = $("input", form).value.trim();
      if (!v) { toast("Pega el link de Pinterest, TikTok o Instagram."); return; }
      store.sset("avril.refLink", v);
      store.sdel("avril.ref");
      location.href = "disena.html?ref=1";
    });
  }

  function initResume() {
    var el = $("[data-resume]");
    if (!el) return;
    var draft = store.get("avril.borrador", null);
    if (draft && draft.touched && draft.state && draft.state.pieces && draft.state.pieces.some(Boolean)) el.hidden = false;
  }

  /* ---------- Inspírate: filtro de cajas listas ---------- */
  function initFilters() {
    var wrap = $("[data-filters]");
    if (!wrap) return;
    var cards = $$("[data-occasion]");
    wrap.addEventListener("change", function (e) {
      var v = e.target.value;
      cards.forEach(function (c) { c.hidden = !(v === "todas" || c.dataset.occasion === v); });
    });
  }

  /* =============================================================
     Diseña con IA — la herramienta
     ============================================================= */
  function initTool() {
    var root = $("[data-tool]");
    if (!root) return;
    document.body.classList.add("is-tool");

    var screens = $$("[data-screen]", root);
    var stepMap = { ref: 1, analisis: 2, semaforo: 2, armar: 3, entrega: 4, listo: 5 };
    var state = normalize(B.DEMO);
    var ref = { img: null, link: "", text: "" };
    var verdict = "amarillo";
    var touched = false;

    /* --- navegación entre pantallas --- */
    function show(name, noScroll) {
      screens.forEach(function (s) { s.hidden = s.dataset.screen !== name; });
      var n = stepMap[name] || 1;
      $$(".stepper li", root).forEach(function (li, i) {
        li.classList.toggle("is-current", i + 1 === n);
        li.classList.toggle("is-done", i + 1 < n);
        if (i + 1 === n) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
      });
      var cur = $(".stepper li.is-current", root);
      if (cur) cur.parentElement.scrollLeft = Math.max(0, cur.offsetLeft - 16);
      if (name === "armar") drawBuilder();
      if (name === "entrega") drawCheckout();
      if (!noScroll) window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      var h = $("[data-screen='" + name + "'] h1, [data-screen='" + name + "'] h2", root);
      if (h && !noScroll) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
    }
    root.addEventListener("click", function (e) {
      var go = e.target.closest("[data-go]");
      if (go) { e.preventDefault(); show(go.dataset.go); }
    });

    /* --- Paso 1: referencia --- */
    var zone = $("[data-tool-drop]", root);
    var zoneIdle = $("[data-drop-idle]", root);
    var thumb = $("[data-drop-thumb]", root);
    function setRefImage(data) {
      ref.img = data;
      if (thumb) { thumb.src = data; thumb.hidden = false; }
      if (zoneIdle) zoneIdle.hidden = true;
      store.sset("avril.ref", data);
    }
    bindDropzone(zone, setRefImage);
    var linkIn = $("#ref-link", root), descIn = $("#ref-desc", root);

    var preImg = store.sget("avril.ref"), preLink = store.sget("avril.refLink");
    if (preImg) setRefImage(preImg);
    if (preLink && linkIn) { linkIn.value = preLink; ref.link = preLink; }

    $$("[data-toggle]", root).forEach(function (b) {
      b.addEventListener("click", function () {
        var t = $(b.dataset.toggle, root);
        if (!t) return;
        t.hidden = !t.hidden;
        b.setAttribute("aria-expanded", t.hidden ? "false" : "true");
        if (!t.hidden) { var f = $("textarea, button", t); if (f) f.focus(); }
      });
    });

    // Elegir una caja lista desde el paso 1
    root.addEventListener("click", function (e) {
      var b = e.target.closest("[data-load-ready]");
      if (!b) return;
      loadReady(b.dataset.loadReady);
    });

    function loadReady(id) {
      var c = (B.CAJAS_LISTAS || []).filter(function (x) { return x.id === id; })[0];
      if (!c) return;
      state = normalize(c);
      touched = true;
      saveDraft();
      show("armar");
      toast("Partimos de «" + c.nombre.replace(/ 🥺/, "") + "». Cámbiala a tu gusto.");
    }

    var analyzeBtn = $("[data-analyze]", root);
    if (analyzeBtn) analyzeBtn.addEventListener("click", function () {
      ref.link = linkIn ? linkIn.value.trim() : "";
      ref.text = descIn ? descIn.value.trim() : "";
      if (!ref.img && !ref.link && !ref.text) {
        toast("Sube una imagen, pega un link o descríbela con palabras.");
        return;
      }
      runAnalysis();
    });

    /* --- Paso 2: análisis simulado --- */
    function refVisual(target) {
      if (!target) return;
      if (ref.img) target.innerHTML = '<img src="' + ref.img + '" alt="Tu imagen de referencia">';
      else if (ref.text) target.innerHTML = "<p>«" + esc(ref.text.slice(0, 120)) + "»</p>";
      else target.innerHTML = "<p>Tu link de referencia<br><small>" + esc(ref.link.replace(/^https?:\/\//, "").slice(0, 40)) + "</small></p>";
    }

    var analysisTimer = [];
    function runAnalysis() {
      show("analisis");
      analysisTimer.forEach(clearTimeout);
      analysisTimer = [];
      var scan = $("[data-scan]", root);
      if (scan) {
        if (ref.img) scan.innerHTML = '<img src="' + ref.img + '" alt="Tu referencia mientras la analizamos">';
        else scan.innerHTML = '<div class="scan-text">' + (ref.text ? "«" + esc(ref.text.slice(0, 80)) + "»" : "Leyendo tu link…") + "</div>";
      }
      var msgs = ["Detectando colores…", "Contando piezas…", "Revisando el empaque…", "Comparando con lo que hacemos a mano…"];
      var msgEl = $("[data-scan-msg]", root), dots = $$(".scan-dots i", root);
      var det = $("[data-detected]", root), done = $("[data-analysis-done]", root);
      if (det) det.hidden = true;
      if (done) done.hidden = true;
      msgs.forEach(function (m, i) {
        analysisTimer.push(setTimeout(function () {
          if (msgEl) msgEl.textContent = m;
          dots.forEach(function (d, k) { d.classList.toggle("on", k <= i); });
        }, i * 1000));
      });
      analysisTimer.push(setTimeout(function () {
        if (msgEl) msgEl.textContent = "¡Listo! Esto es lo que vimos:";
        if (det) det.hidden = false;
        if (done) done.hidden = false;
        var b = $("[data-analysis-done] .btn", root);
        if (b) b.focus({ preventScroll: true });
      }, 4200));
    }

    /* --- Paso 3: semáforo --- */
    var avrilImgs = { verde: "assets/img/despues-1.webp", amarillo: "assets/img/trufas-rosadas.webp", rojo: "assets/img/caja-cofre.webp" };
    function setVerdict(v) {
      verdict = v;
      var light = $("[data-light]", root);
      if (light) light.dataset.state = v;
      $$("[data-verdict]", root).forEach(function (el) { el.hidden = el.dataset.verdict !== v; });
      $$("[data-demo-verdict]", root).forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.demoVerdict === v ? "true" : "false"); });
      var im = $("[data-avril-img]", root);
      if (im) im.src = avrilImgs[v];
    }
    $$("[data-demo-verdict]", root).forEach(function (b) { b.addEventListener("click", function () { setVerdict(b.dataset.demoVerdict); }); });
    var toSem = $("[data-to-semaforo]", root);
    if (toSem) toSem.addEventListener("click", function () {
      refVisual($("[data-ref-visual]", root));
      setVerdict(verdict);
      show("semaforo");
    });
    var toBuild = $("[data-to-builder]", root);
    if (toBuild) toBuild.addEventListener("click", function () {
      // Cada resultado del semáforo propone un punto de partida
      if (verdict === "verde") state = normalize({ size: 6, coating: "rosado", topping: "oro", message: state.message, pieces: ["trufa", "trufa", "trufa", "trufa", "trufa", "trufa"] });
      else if (verdict === "rojo") { state = normalize({ size: 12, coating: "rosado", topping: "oro", message: state.message, pieces: [] }); fillMix(); }
      else state = normalize(B.DEMO);
      touched = true;
      saveDraft();
      show("armar");
    });

    /* --- Paso 4: armador --- */
    var preview = $("[data-builder-box]", root);
    var totalEl = $("[data-total]", root);
    var newIdx = null;

    function fillMix() {
      var mix = ["trufa", "alfajor", "chocoteja", "trufa", "brownie", "alfajor", "chocoteja", "trufa"];
      for (var i = 0; i < state.size; i++) state.pieces[i] = mix[i % mix.length];
    }

    function saveDraft() { store.set("avril.borrador", { touched: touched, state: state, t: Date.now() }); }

    function drawBuilder() {
      renderBox(preview, state, { interactive: true, newIndex: newIdx });
      newIdx = null;
      var filled = state.pieces.filter(Boolean).length;
      var cnt = $("[data-fill-count]", root);
      if (cnt) cnt.textContent = filled ? filled + " de " + state.size + " espacios llenos" : "Tu caja está esperando sus primeras piezas.";
      $$("[data-count]", root).forEach(function (el) { el.textContent = "en caja: " + countOf(state, el.dataset.count); });
      var full = $("[data-full-msg]", root);
      if (full && filled < state.size) full.hidden = true;
      // sincronizar controles
      $$("input[name=size]", root).forEach(function (r) { r.checked = +r.value === state.size; });
      $$("input[name=coating]", root).forEach(function (r) { r.checked = r.value === state.coating; });
      $$("input[name=topping]", root).forEach(function (r) { r.checked = r.value === state.topping; });
      var msg = $("#lid-msg", root);
      if (msg && document.activeElement !== msg) msg.value = state.message;
      var mc = $("[data-msg-count]", root);
      if (mc) mc.textContent = state.message.length + "/28";
      ["qr", "fotoComestible", "lazo"].forEach(function (k) { var c = $("input[name=" + k + "]", root); if (c) c.checked = !!state.extras[k]; });
      tweenMoney(totalEl, priceOf(state));
      var stage = $(".box-stage", preview);
      if (stage && preview.dataset.closed === "1") preview.classList.add("box-closed");
    }

    function changed() { touched = true; saveDraft(); drawBuilder(); }

    if (preview) preview.addEventListener("click", function (e) {
      var b = e.target.closest("[data-remove]");
      if (!b) return;
      state.pieces[+b.dataset.remove] = null;
      changed();
    });

    $$("[data-add]", root).forEach(function (b) {
      b.addEventListener("click", function () {
        var i = state.pieces.indexOf(null);
        var full = $("[data-full-msg]", root);
        if (i === -1) { if (full) full.hidden = false; toast("Tu caja está llena. Quita una pieza o elige una caja más grande."); return; }
        state.pieces[i] = b.dataset.add;
        newIdx = i;
        changed();
      });
    });

    root.addEventListener("change", function (e) {
      var t = e.target;
      if (t.name === "size") {
        var keep = state.pieces.filter(Boolean);
        state.size = +t.value;
        state.pieces = keep.slice(0, state.size);
        while (state.pieces.length < state.size) state.pieces.push(null);
        if (keep.length > state.size) toast("Guardamos las piezas que entran en tu nueva caja.");
        changed();
      } else if (t.name === "coating") { state.coating = t.value; changed(); }
      else if (t.name === "topping") { state.topping = t.value; changed(); }
      else if (t.name === "qr" || t.name === "fotoComestible" || t.name === "lazo") { state.extras[t.name] = t.checked; changed(); }
    });

    var msgIn = $("#lid-msg", root);
    if (msgIn) msgIn.addEventListener("input", function () {
      state.message = msgIn.value.slice(0, 28);
      var lid = $(".lid-msg", preview);
      if (lid) lid.textContent = state.message || " ";
      var mc = $("[data-msg-count]", root);
      if (mc) mc.textContent = state.message.length + "/28";
      touched = true; saveDraft();
    });

    root.addEventListener("click", function (e) {
      var a = e.target.closest("[data-action]");
      if (!a) return;
      var act = a.dataset.action;
      if (act === "surtido") { fillMix(); changed(); toast("Armamos un surtido equilibrado para ti."); }
      if (act === "vaciar") { state.pieces = state.pieces.map(function () { return null; }); changed(); }
      if (act === "lid") {
        var closed = preview.classList.toggle("box-closed");
        preview.dataset.closed = closed ? "1" : "";
        a.textContent = closed ? "Abrir la caja" : "Cerrar la tapa";
        a.setAttribute("aria-pressed", closed ? "true" : "false");
      }
      if (act === "save") { saveDesign(); toast("Guardamos tu diseño en Mis diseños."); }
      if (act === "share") shareDesign();
    });

    function saveDesign() {
      var list = store.get("avril.disenos", []);
      var key = JSON.stringify(state);
      list = list.filter(function (d) { return JSON.stringify(d.state) !== key; });
      list.unshift({ id: "d" + Date.now().toString(36), fecha: new Date().toISOString(), state: clone(state), total: priceOf(state) });
      store.set("avril.disenos", list.slice(0, 12));
    }

    function shareDesign() {
      var url = location.href.split("?")[0].split("#")[0] + "?d=" + encodeState(state);
      var done = function () { toast("Enlace copiado. Compártelo para que voten o hagan la vaca 🎁"); };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(url).then(done, function () { prompt("Copia este enlace:", url); });
      else { try { prompt("Copia este enlace:", url); } catch (e) {} }
    }

    var toCheckout = $("[data-to-checkout]", root);
    if (toCheckout) toCheckout.addEventListener("click", function () {
      if (!state.pieces.some(Boolean)) { toast("Tu caja está esperando sus primeras piezas."); return; }
      saveDesign();
      show("entrega");
    });

    /* --- Paso 5: entrega y pago --- */
    var form = $("[data-checkout-form]", root);
    function drawCheckout() {
      renderBox($("[data-summary-box]", root), state);
      var dl = $("[data-summary-list]", root);
      if (dl) {
        var rows = [["Caja de " + state.size, money(P.caja[state.size]) ]];
        ["trufa", "alfajor", "chocoteja", "brownie"].forEach(function (t) {
          var n = countOf(state, t);
          if (n) rows.push([n + " × " + B.PIEZAS[t].nombre, money(n * P[t])]);
        });
        if (state.extras.qr) rows.push(["Tarjeta con QR", money(P.extras.qr)]);
        if (state.extras.fotoComestible) rows.push(["Foto comestible", money(P.extras.fotoComestible)]);
        dl.innerHTML = rows.map(function (r) { return "<dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd>"; }).join("") +
          '<dt class="sum-total">Total</dt><dd class="sum-total">' + money(priceOf(state)) + "</dd>";
      }
      // Fecha mínima: mañana (o 48 h si lleva foto comestible)
      var date = $("#f-fecha", root);
      if (date) {
        var d = new Date();
        d.setDate(d.getDate() + (state.extras.fotoComestible ? 2 : 1));
        var iso = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
        date.min = iso;
        if (!date.value || date.value < iso) date.value = iso;
      }
    }
    if (form) form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var dlg = $("#demo-dialog");
      var finish = function () { confirmOrder(); };
      if (dlg && dlg.showModal) {
        dlg.showModal();
        dlg.addEventListener("close", finish, { once: true });
      } else { alert("Esta es una demostración: no se realizó ningún cobro."); finish(); }
    });

    /* --- Paso 6: confirmación --- */
    function confirmOrder() {
      var id = "AV-" + String(Math.floor(1000 + Math.random() * 9000));
      var fd = new FormData(form);
      // Solo guardamos en este navegador datos del pedido (no nombre ni teléfono)
      var order = {
        id: id, state: clone(state), total: priceOf(state), creado: new Date().toISOString(),
        fecha: fd.get("fecha"), franja: fd.get("franja"), distrito: fd.get("distrito"),
        sorpresa: !!fd.get("sorpresa"), tarjeta: (fd.get("tarjeta") || "").toString().slice(0, 200), pago: fd.get("pago")
      };
      store.set("avril.pedido", order);
      var oid = $("[data-order-id]", root);
      if (oid) oid.textContent = id;
      renderBox($("[data-final-box]", root), state);
      var wa = $("[data-order-wa]", root);
      if (wa) wa.href = WA + "?text=" + encodeURIComponent("Hola Avril, tengo una consulta sobre mi pedido " + id + " 💜");
      show("listo");
    }
    var remind = $("[data-remind-order]", root);
    if (remind) remind.addEventListener("change", function () {
      var order = store.get("avril.pedido", null);
      if (!order) return;
      var list = store.get("avril.fechas", []).filter(function (f) { return f.from !== order.id; });
      if (remind.checked) list.push({ id: "f" + Date.now().toString(36), nombre: "Pedido " + order.id, fecha: order.fecha, ocasion: "Mi caja Avril", from: order.id });
      store.set("avril.fechas", list);
      toast(remind.checked ? "Listo, te recordamos esta fecha el próximo año." : "Quitamos el recordatorio.");
    });

    /* --- Arranque según la URL --- */
    var q = new URLSearchParams(location.search);
    var start = "ref";
    if (q.get("caja")) { loadReady(q.get("caja")); return; }
    if (q.get("d")) { var sh = decodeState(q.get("d")); if (sh) { state = normalize(sh); touched = true; start = "armar"; toast("Este es el diseño que te compartieron."); } }
    else if (q.get("diseno")) {
      var dd = store.get("avril.disenos", []).filter(function (x) { return x.id === q.get("diseno"); })[0];
      if (dd) { state = normalize(dd.state); touched = true; start = "armar"; }
    } else if (q.get("borrador")) {
      var br = store.get("avril.borrador", null);
      if (br && br.state) { state = normalize(br.state); touched = true; start = "armar"; }
    } else if (location.hash === "#armar") start = "armar";
    show(start, true);
  }

  /* =============================================================
     Empresas — cotizador
     ============================================================= */
  function initQuote() {
    var f = $("[data-quote]");
    if (!f) return;
    var E = P.empresas;
    var otro = $("#q-otro", f), logoIn = $("#q-logo", f), logoPrev = $("[data-logo-preview]", f);
    function qty() {
      var r = $("input[name=cantidad]:checked", f);
      if (!r) return 50;
      if (r.value === "otro") return Math.max(10, parseInt(otro.value, 10) || 0);
      return +r.value;
    }
    function calc() {
      var n = qty();
      var pz = +(($("input[name=piezas]:checked", f) || {}).value || 2);
      var unit = E.cajita + pz * E.piezaPromedio;
      var desc = 0;
      Object.keys(E.descuentos).forEach(function (k) { if (n >= +k) desc = E.descuentos[k]; });
      var total = n * unit * (1 - desc);
      otro.closest(".field").hidden = !($("input[name=cantidad]:checked", f) || {}).value || $("input[name=cantidad]:checked", f).value !== "otro";
      $("[data-q-unit]").textContent = money(unit * (1 - desc));
      $("[data-q-qty]").textContent = n + " cajitas de " + pz + " piezas";
      $("[data-q-desc]").textContent = desc ? Math.round(desc * 100) + "%" : "—";
      tweenMoney($("[data-q-total]"), total);
      return { n: n, pz: pz, total: total };
    }
    f.addEventListener("input", calc);
    f.addEventListener("change", calc);
    if (logoIn) logoIn.addEventListener("change", function () {
      var file = logoIn.files[0];
      if (!file || !/^image\//.test(file.type)) { toast("Esa imagen no se pudo leer. Prueba con otra."); return; }
      var fr = new FileReader();
      fr.onload = function () { logoPrev.src = fr.result; logoPrev.hidden = false; };
      fr.readAsDataURL(file);
    });
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var r = calc();
      var fecha = $("#q-fecha", f).value;
      var emp = $("#q-empresa", f).value.trim();
      var text = "Hola Avril, quiero cotizar detalles corporativos.\n" +
        (emp ? "Empresa: " + emp + "\n" : "") +
        "Cantidad: " + r.n + " cajitas de " + r.pz + " piezas\n" +
        (fecha ? "Fecha: " + fecha + "\n" : "") +
        "Diseño con nuestro logo" + (logoIn.files[0] ? " (te lo envío por aquí)" : "") + "\n" +
        "Estimado web: " + money(r.total);
      window.open(WA + "?text=" + encodeURIComponent(text), "_blank", "noopener");
    });
    var d = $("#q-fecha", f);
    if (d) { var t = new Date(); t.setDate(t.getDate() + 3); d.min = t.toISOString().slice(0, 10); }
    calc();
  }

  /* =============================================================
     Mi Avril — seguimiento, diseños y fechas
     ============================================================= */
  function initMiAvril() {
    var root = $("[data-mi-avril]");
    if (!root) return;

    // Pestañas
    var tabs = $$("[role=tab]", root);
    function select(id) {
      tabs.forEach(function (t) {
        var on = t.getAttribute("aria-controls") === id;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        $("#" + t.getAttribute("aria-controls")).hidden = !on;
      });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(t.getAttribute("aria-controls")); history.replaceState(null, "", "#" + t.getAttribute("aria-controls")); });
      t.addEventListener("keydown", function (e) {
        var k = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!k) return;
        var n = tabs[(i + k + tabs.length) % tabs.length];
        n.focus(); n.click();
      });
    });
    var h = location.hash.replace("#", "");
    if (h && $("#" + h) && tabs.some(function (t) { return t.getAttribute("aria-controls") === h; })) select(h);

    // Seguimiento: usa el último pedido guardado o el de ejemplo
    var order = store.get("avril.pedido", null);
    var s = normalize(order ? order.state : B.DEMO);
    renderBox($("[data-track-box]", root), s);
    var set = function (sel, v) { var el = $(sel, root); if (el) el.textContent = v; };
    if (order) {
      set("[data-t-id]", order.id);
      set("[data-t-distrito]", order.distrito || "—");
      set("[data-t-mensaje]", s.message || "—");
      set("[data-t-sorpresa]", order.sorpresa ? "Sí" : "No");
      set("[data-t-total]", money(order.total));
      if (order.franja) set("[data-t-eta]", "Llega el " + formatDate(order.fecha) + " entre " + order.franja);
    }
    set("[data-t-piezas]", piecesSummary(s));

    // Recordatorio de esta fecha
    var rem = $("[data-track-remind]", root);
    if (rem) rem.addEventListener("change", function () {
      var list = store.get("avril.fechas", []);
      var key = order ? order.id : "demo";
      list = list.filter(function (f) { return f.from !== key; });
      if (rem.checked) list.push({ id: "f" + Date.now().toString(36), nombre: order ? "Pedido " + order.id : "Mi caja Avril", fecha: (order && order.fecha) || new Date().toISOString().slice(0, 10), ocasion: "Mi caja Avril", from: key });
      store.set("avril.fechas", list);
      drawReminders();
      toast(rem.checked ? "Listo, te recordamos esta fecha el próximo año." : "Quitamos el recordatorio.");
    });

    // Mis diseños
    function drawDesigns() {
      var wrap = $("[data-designs]", root);
      if (!wrap) return;
      var list = store.get("avril.disenos", []);
      var draft = store.get("avril.borrador", null);
      if (!list.length) {
        wrap.innerHTML = '<div class="empty" style="grid-column:1/-1"><p>' +
          (draft && draft.touched ? "Dejaste tu caja a medio armar. ¿La terminamos?" : "Aún no guardas diseños. Arma tu primera caja y aparecerá aquí.") +
          '</p><a class="btn btn-primary" href="disena.html' + (draft && draft.touched ? "?borrador=1" : "") + '">' + (draft && draft.touched ? "Terminar mi caja" : "Crear mi caja") + "</a></div>";
        return;
      }
      wrap.innerHTML = list.map(function (d) {
        var st = normalize(d.state);
        return '<article class="card design-card"><div class="box-preview">' + boxHTML(st) + "</div>" +
          '<div><h3 style="font-size:1.15rem">Caja de ' + st.size + "</h3><p class=\"small\">" + esc(piecesSummary(st)) + "</p></div>" +
          '<div class="row"><span class="price">' + money(priceOf(st)) + '</span><a class="btn btn-primary btn-sm" href="disena.html?diseno=' + esc(d.id) + '">Repetir mi caja</a></div></article>';
      }).join("");
    }
    drawDesigns();

    // Fechas especiales
    function drawReminders() {
      var ul = $("[data-reminders]", root);
      if (!ul) return;
      var list = store.get("avril.fechas", []);
      ul.innerHTML = list.length ? list.map(function (f) {
        return '<li><span><strong style="font-weight:500">' + esc(f.nombre) + "</strong> · " + esc(f.ocasion) + "<br><span class=\"small muted\">" + esc(formatDate(f.fecha)) + '</span></span><button type="button" data-del-date="' + esc(f.id) + '" aria-label="Eliminar recordatorio de ' + esc(f.nombre) + '"><svg class="icon" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></li>';
      }).join("") : '<li class="muted">Todavía no tienes fechas guardadas.</li>';
    }
    drawReminders();
    var rf = $("[data-reminder-form]", root);
    if (rf) rf.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!rf.reportValidity()) return;
      var list = store.get("avril.fechas", []);
      list.push({ id: "f" + Date.now().toString(36), nombre: $("#r-nombre", rf).value.trim(), fecha: $("#r-fecha", rf).value, ocasion: $("#r-ocasion", rf).value });
      list.sort(function (a, b) { return (a.fecha || "").slice(5).localeCompare((b.fecha || "").slice(5)); });
      if (!store.set("avril.fechas", list)) { toast("No pudimos guardar en este navegador."); return; }
      rf.reset();
      drawReminders();
      toast("Guardamos tu fecha especial 💜");
    });
    root.addEventListener("click", function (e) {
      var b = e.target.closest("[data-del-date]");
      if (!b) return;
      store.set("avril.fechas", store.get("avril.fechas", []).filter(function (f) { return f.id !== b.dataset.delDate; }));
      drawReminders();
    });
  }

  function formatDate(iso) {
    if (!iso) return "—";
    var p = String(iso).slice(0, 10).split("-");
    var m = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    return p.length === 3 ? (+p[2]) + " de " + m[(+p[1]) - 1] : iso;
  }

  function initYear() { $$("[data-year]").forEach(function (e) { e.textContent = new Date().getFullYear(); }); }

  /* ---------- Arranque ---------- */
  function boot() {
    document.documentElement.classList.remove("no-js");
    safe(initHeader, "initHeader");
    safe(initDrawer, "initDrawer");
    safe(initReveals, "initReveals");
    safe(function () { initBeforeAfter(document); }, "initBeforeAfter");
    safe(initReadyPrices, "initReadyPrices");
    safe(initHomeUpload, "initHomeUpload");
    safe(initResume, "initResume");
    safe(initFilters, "initFilters");
    safe(initTool, "initTool");
    safe(initQuote, "initQuote");
    safe(initMiAvril, "initMiAvril");
    safe(initYear, "initYear");
    safe(initParallax, "initParallax");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
