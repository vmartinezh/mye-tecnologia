document.addEventListener("DOMContentLoaded", function () {
  var WA_NUMBER = "56994895613";
  var MAIL = "contacto@myetecnologia.cl";
  var SVG_NS = "http://www.w3.org/2000/svg";

  var CATS = {
    equipos: { short: "Equipos", name: "Equipos computacionales" },
    perifericos: { short: "Periféricos", name: "Periféricos y accesorios" },
    networking: { short: "Networking", name: "Networking y conectividad" },
    telecom: { short: "Telecom", name: "Telecomunicaciones" },
    energia: { short: "Energía", name: "Energía y respaldo" },
    empresas: { short: "Empresas", name: "Soluciones para empresas" },
    impresion: { short: "Impresión", name: "Impresión y documentos" }
  };
  var ORDER = Object.keys(CATS);
  var selected = [];
  var justPlugged = null;

  var ports = document.querySelectorAll(".port");
  var lineToggles = document.querySelectorAll(".lineToggle");
  var trayList = document.getElementById("trayList");
  var trayEmpty = document.getElementById("trayEmpty");
  var trayWa = document.getElementById("trayWa");
  var trayWaLabel = document.getElementById("trayWaLabel");
  var catChecks = document.getElementById("catChecks");
  var patchWrap = document.querySelector(".patchWrap");
  var patch = document.querySelector(".patch");
  var tray = document.querySelector(".tray");
  var cablesSvg = document.getElementById("cables");

  function waLink(text) {
    return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text);
  }

  function selectedNames() {
    return selected.map(function (c) { return CATS[c].name; });
  }

  /* ---------- Estado: conectar / desconectar ---------- */

  function toggle(cat) {
    var i = selected.indexOf(cat);
    if (i === -1) {
      selected.push(cat);
      selected.sort(function (a, b) { return ORDER.indexOf(a) - ORDER.indexOf(b); });
      justPlugged = cat;
    } else {
      selected.splice(i, 1);
      justPlugged = null;
    }
    render();
  }

  function render() {
    ports.forEach(function (p) {
      p.setAttribute("aria-pressed", String(selected.indexOf(p.dataset.cat) !== -1));
    });
    lineToggles.forEach(function (t) {
      var on = selected.indexOf(t.dataset.cat) !== -1;
      t.setAttribute("aria-pressed", String(on));
      t.querySelector(".lineLabel").textContent = on ? "Conectado" : "Conectar";
      t.closest(".line").classList.toggle("is-on", on);
    });
    document.querySelectorAll(".unit[data-cat]").forEach(function (u) {
      u.classList.toggle("is-on", selected.indexOf(u.dataset.cat) !== -1);
    });
    document.querySelectorAll("#plateLinks [data-cat]").forEach(function (led) {
      led.classList.toggle("is-on", selected.indexOf(led.dataset.cat) !== -1);
    });
    catChecks.querySelectorAll(".catChip").forEach(function (c) {
      c.setAttribute("aria-pressed", String(selected.indexOf(c.dataset.cat) !== -1));
    });

    trayList.innerHTML = "";
    selected.forEach(function (cat) {
      var li = document.createElement("li");
      li.className = "tape";
      li.dataset.cat = cat;
      li.textContent = CATS[cat].short;
      trayList.appendChild(li);
    });
    trayEmpty.hidden = selected.length > 0;

    var msg = selected.length
      ? "Hola M&E Tecnología, quiero cotizar: " + selectedNames().join(", ") + "."
      : "Hola M&E Tecnología, quiero cotizar.";
    trayWa.href = waLink(msg);
    trayWaLabel.textContent = selected.length
      ? "Cotizar por WhatsApp (" + selected.length + ")"
      : "Cotizar por WhatsApp";

    drawCables();
    justPlugged = null;
  }

  var hovered = null;
  function isolate(cat) {
    hovered = cat;
    ports.forEach(function (p) { p.classList.toggle("dim", !!cat && p.dataset.cat !== cat); });
    cablesSvg.querySelectorAll("g").forEach(function (g) {
      g.classList.toggle("dim", !!cat && g.getAttribute("data-cat") !== cat);
    });
  }

  ports.forEach(function (p) {
    p.addEventListener("click", function () { toggle(p.dataset.cat); });
    p.addEventListener("mouseenter", function () { isolate(p.dataset.cat); });
    p.addEventListener("mouseleave", function () { isolate(null); });
    p.addEventListener("focus", function () { isolate(p.dataset.cat); });
    p.addEventListener("blur", function () { isolate(null); });
  });
  lineToggles.forEach(function (t) {
    t.addEventListener("click", function () { toggle(t.dataset.cat); });
  });

  ORDER.forEach(function (cat) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "catChip";
    b.dataset.cat = cat;
    b.setAttribute("aria-pressed", "false");
    b.textContent = CATS[cat].name;
    b.addEventListener("click", function () { toggle(cat); });
    catChecks.appendChild(b);
  });

  /* ---------- Cables ---------- */

  function el(name, attrs) {
    var n = document.createElementNS(SVG_NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  function drawCables() {
    if (!cablesSvg || getComputedStyle(cablesSvg).display === "none") return;
    var wrap = patchWrap.getBoundingClientRect();
    var panelBottom = patch.getBoundingClientRect().bottom - wrap.top;
    var trayTop = tray.getBoundingClientRect().top - wrap.top;
    cablesSvg.setAttribute("viewBox", "0 0 " + wrap.width + " " + wrap.height);
    cablesSvg.innerHTML = "";

    ports.forEach(function (p) {
      var cat = p.dataset.cat;
      var jack = p.querySelector(".jack").getBoundingClientRect();
      var x = jack.left + jack.width / 2 - wrap.left;
      var g = el("g", { "data-cat": cat });
      var d;

      if (selected.indexOf(cat) !== -1) {
        var chip = trayList.querySelector('[data-cat="' + cat + '"]');
        var cr = chip.getBoundingClientRect();
        var cx = cr.left + cr.width / 2 - wrap.left;
        var start = jack.bottom - wrap.top - 2;
        var bend = Math.max(36, (trayTop - start) * 0.55);
        d = "M" + x + " " + start +
          " C" + x + " " + (start + bend) + " " + cx + " " + (trayTop - bend) + " " + cx + " " + (trayTop + 6);
        g.appendChild(el("path", { d: d, class: "sheath" }));
        var core = el("path", { d: d, class: "core" });
        g.appendChild(core);
        cablesSvg.appendChild(g);
        if (cat === justPlugged && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          var len = core.getTotalLength();
          [core, g.firstChild].forEach(function (path) {
            path.style.strokeDasharray = len;
            path.style.setProperty("--len", len);
            path.classList.add("draw");
          });
        }
      } else {
        var top = panelBottom - 1;
        d = "M" + x + " " + top +
          " C" + x + " " + (top + 20) + " " + (x + 9) + " " + (top + 26) + " " + (x + 7) + " " + (top + 42);
        g.appendChild(el("path", { d: d, class: "sheath" }));
        g.appendChild(el("path", { d: d, class: "core" }));
        g.appendChild(el("rect", {
          x: x + 1, y: top + 40, width: 12, height: 17, rx: 2,
          class: "loose", transform: "rotate(-6 " + (x + 7) + " " + (top + 48) + ")"
        }));
        cablesSvg.appendChild(g);
      }
    });
    if (hovered) isolate(hovered);
  }

  if ("ResizeObserver" in window) {
    new ResizeObserver(function () { drawCables(); }).observe(patchWrap);
  } else {
    window.addEventListener("resize", drawCables);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawCables);

  render();

  /* ---------- Formulario ---------- */

  var form = document.getElementById("orderForm");
  var formError = document.getElementById("formError");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var via = e.submitter && e.submitter.dataset.via === "mail" ? "mail" : "wa";
    var f = form.elements;
    var missing = [];
    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value.trim());

    [f.nombre, f.email, f.mensaje].forEach(function (input) { input.removeAttribute("aria-invalid"); });
    if (!f.nombre.value.trim()) { missing.push("tu nombre"); f.nombre.setAttribute("aria-invalid", "true"); }
    if (!emailOk) { missing.push("un email válido"); f.email.setAttribute("aria-invalid", "true"); }
    if (!f.mensaje.value.trim()) { missing.push("el mensaje"); f.mensaje.setAttribute("aria-invalid", "true"); }

    if (missing.length) {
      formError.textContent = "Para enviar la solicitud falta " + missing.join(", ").replace(/, ([^,]*)$/, " y $1") + ".";
      formError.hidden = false;
      form.querySelector('[aria-invalid="true"]').focus();
      return;
    }
    formError.hidden = true;

    var lines = [
      "Solicitud de cotización — M&E Tecnología",
      "",
      "Nombre: " + f.nombre.value.trim()
    ];
    if (f.empresa.value.trim()) lines.push("Empresa: " + f.empresa.value.trim());
    if (f.cargo.value.trim()) lines.push("Cargo: " + f.cargo.value.trim());
    if (f.telefono.value.trim()) lines.push("Teléfono: " + f.telefono.value.trim());
    lines.push("Email: " + f.email.value.trim());
    if (selected.length) lines.push("Categorías: " + selectedNames().join(", "));
    if (f.asunto.value.trim()) lines.push("Asunto: " + f.asunto.value.trim());
    lines.push("", f.mensaje.value.trim());
    var text = lines.join("\n");

    if (via === "mail") {
      var subject = f.asunto.value.trim() || "Solicitud de cotización";
      window.location.href = "mailto:" + MAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(text);
    } else {
      window.open(waLink(text), "_blank", "noopener");
    }
  });

  /* ---------- Navegación ---------- */

  var menuBtn = document.getElementById("menuBtn");
  var mobileMenu = document.getElementById("mobileMenu");

  function setMenu(open) {
    mobileMenu.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  }
  menuBtn.addEventListener("click", function () {
    setMenu(!mobileMenu.classList.contains("open"));
  });
  mobileMenu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { setMenu(false); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && mobileMenu.classList.contains("open")) { setMenu(false); menuBtn.focus(); }
  });

  var navLinks = document.querySelectorAll('.links a[href^="#"]');
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    navLinks.forEach(function (link) {
      var s = document.getElementById(link.getAttribute("href").slice(1));
      if (s) observer.observe(s);
    });
  }

  /* ---------- Carrusel de marcas ---------- */

  var brandPause = document.getElementById("brandPause");
  if (brandPause) {
    brandPause.addEventListener("click", function () {
      var paused = brandPause.getAttribute("aria-pressed") !== "true";
      brandPause.setAttribute("aria-pressed", String(paused));
      brandPause.setAttribute("aria-label", paused ? "Reanudar carrusel de marcas" : "Pausar carrusel de marcas");
      brandPause.querySelector("use").setAttribute("href", paused ? "#i-play" : "#i-pause");
      brandPause.closest(".brands").classList.toggle("is-paused", paused);
    });
  }

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
