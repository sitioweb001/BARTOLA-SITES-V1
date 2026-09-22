/* =====================================================
   💜 DESEOS DE BARTOLITA — Lógica de datos (Firebase)
   =====================================================
   Este archivo reemplaza al backend de Google Apps Script.
   Expone las mismas funciones apiGet(accion) y apiPost(payload)
   que ya usa index.html, pero ahora hablan directo con Firestore
   en vez de hacer fetch() a un Web App de Apps Script.

   No necesitas cambiar nada del <script> principal de index.html:
   sigue llamando apiGet("obtenerModulos"), apiPost({accion:...}), etc.
   ===================================================== */

const COL = {
  modulos: "modulos",
  deseos: "deseos",
  eventos: "eventos",
  responsables: "responsables",
  notificaciones: "notificaciones"
};

const URL_SITIO = "https://sitioweb001.github.io/BARTOLITA-SITES/";

/* ===== Envío real de correo (Apps Script) =====
   Firestore por sí solo no manda correos. En vez de pagar la extensión
   "Trigger Email from Firestore", usamos un Apps Script mínimo (correo.gs)
   que solo hace MailApp.sendEmail. Gratis, con tu propia cuenta de Gmail.

   1. Despliega correo.gs como Aplicación web (ver instrucciones ahí).
   2. Pega aquí abajo la URL que te da (termina en /exec).
   3. La CLAVE debe ser IDÉNTICA a la que pusiste en CLAVE_SECRETA de correo.gs. */
const MAIL_API_URL = "https://script.google.com/macros/s/AKfycbyTTJXya83fCKsSMXy6LmyDV6k2WbLc21QVJ8Q4ezxBvFP4VPPYmY_DK4c8HWmXI7rbzQ/exec";
const MAIL_API_CLAVE = "3457";

/* ===== Utilidades (equivalentes a las del .gs) ===== */
function generarId(prefijo) {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  const t = Date.now().toString(36).slice(-4).toUpperCase();
  return `${prefijo}-${t}${rand}`;
}
function nowISO() {
  return new Date().toISOString();
}
function escaparTexto(txt) {
  if (txt === null || txt === undefined) return "";
  return String(txt).replace(/<[^>]*>/g, "").trim();
}
function validarURL(url) {
  if (!url) return "";
  let u = String(url).trim();
  if (!u) return "";
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;
  return u;
}
function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}
async function esperarSesion() {
  if (window.firebaseListo) await window.firebaseListo;
}

/* ===== Notificaciones / correo =====
   Cada vez que se crea un módulo, deseo o evento, se llama a
   encolarCorreo(), que manda la petición al Apps Script de correo
   (correo.gs) para que la envíe de verdad con MailApp/Gmail. */
async function registrarNotif(tipo, destinatario, asunto, eventoId, estado) {
  try {
    await db.collection(COL.notificaciones).add({
      fecha: nowISO(),
      tipo,
      destinatario,
      asunto,
      eventoId: eventoId || "",
      estado: estado || "OK"
    });
  } catch (e) { /* no bloquea la app si falla el log */ }
}

function plantillaCorreo({ titulo, subtitulo, cuerpoHtml }) {
  return `
  <div style="font-family:'Quicksand',sans-serif;max-width:480px;margin:auto;background:#FBF8FE;padding:28px;border-radius:18px;border:1px solid #E9D9F8;">
    <div style="font-size:1.4rem;font-weight:700;color:#4A3467;margin-bottom:4px;">${titulo}</div>
    ${subtitulo ? `<div style="color:#7A6B92;margin-bottom:14px;">${subtitulo}</div>` : ""}
    ${cuerpoHtml || ""}
    <a href="${URL_SITIO}" style="display:inline-block;margin-top:18px;padding:12px 22px;background:#9370B8;color:#fff;border-radius:12px;text-decoration:none;font-weight:600;">
      Abrir 💜 Deseos de Bartolita
    </a>
  </div>`;
}

async function obtenerDestinatarios(campoTipo) {
  const snap = await db.collection(COL.responsables).get();
  const correos = [];
  snap.forEach((doc) => {
    const r = doc.data();
    if (r.activo === false) return;
    if (r[campoTipo]) correos.push(r.email);
  });
  return correos;
}

async function encolarCorreo(destinatarios, asunto, html) {
  const lista = (Array.isArray(destinatarios) ? destinatarios : [destinatarios]).filter(validarEmail);
  if (!lista.length) return { ok: true, enviados: 0 };

  if (!MAIL_API_URL || MAIL_API_URL.includes("PEGA_AQUI")) {
    console.warn("MAIL_API_URL no está configurado en firebase-logic.js; no se envió el correo:", asunto);
    return { ok: false, error: "MAIL_API_URL no configurado" };
  }

  try {
    // Content-Type: text/plain evita que el navegador mande una petición
    // OPTIONS (preflight) que Apps Script no responde bien.
    const r = await fetch(MAIL_API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        clave: MAIL_API_CLAVE,
        destinatarios: lista,
        asunto,
        html
      })
    });
    return await r.json();
  } catch (e) {
    console.error("Error enviando correo vía Apps Script:", e);
    return { ok: false, error: e.message };
  }
}

async function notificarNuevaFecha(ev) {
  const destinatarios = await obtenerDestinatarios("notif_nueva_fecha");
  if (!destinatarios.length) return;
  const asunto = `💜 Nueva fecha: ${ev.titulo}`;
  const html = plantillaCorreo({
    titulo: "💜 ¡Nueva fecha agendada!",
    subtitulo: ev.titulo,
    cuerpoHtml: `<p><b>📅 Fecha:</b> ${ev.fecha}</p>
      ${ev.horaInicio ? `<p><b>🕐 Hora:</b> ${ev.horaInicio} - ${ev.horaFin || ""}</p>` : ""}
      ${ev.lugar ? `<p><b>📍 Lugar:</b> ${ev.lugar}</p>` : ""}
      <p>${ev.descripcion || ""}</p>`
  });
  await encolarCorreo(destinatarios, asunto, html);
  await registrarNotif("nueva_fecha", destinatarios.join(","), asunto, ev.id, "OK");
}
async function notificarNuevoDeseo(deseo) {
  const destinatarios = await obtenerDestinatarios("notif_nuevo_deseo");
  if (!destinatarios.length) return;
  const asunto = `💜 Nuevo deseo: ${deseo.nombre}`;
  const html = plantillaCorreo({
    titulo: "💭 ¡Nuevo deseo añadido!",
    subtitulo: deseo.nombre,
    cuerpoHtml: `<p>${deseo.descripcion || ""}</p>
      ${deseo.url ? `<p><a href="${deseo.url}">${deseo.url}</a></p>` : ""}`
  });
  await encolarCorreo(destinatarios, asunto, html);
  await registrarNotif("nuevo_deseo", destinatarios.join(","), asunto, "", "OK");
}
async function notificarNuevoModulo(mod) {
  const destinatarios = await obtenerDestinatarios("notif_nuevo_modulo");
  if (!destinatarios.length) return;
  const asunto = `💜 Nuevo módulo: ${mod.nombre}`;
  const html = plantillaCorreo({
    titulo: `${mod.icono || "💜"} ¡Nuevo módulo creado!`,
    subtitulo: mod.nombre,
    cuerpoHtml: `<p>${mod.descripcion || ""}</p>`
  });
  await encolarCorreo(destinatarios, asunto, html);
  await registrarNotif("nuevo_modulo", destinatarios.join(","), asunto, "", "OK");
}

/* =====================================================
   MÓDULOS
   ===================================================== */
async function obtenerModulos() {
  const snap = await db.collection(COL.modulos).get();
  const datos = snap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((m) => m.activo !== false)
    .sort((a, b) => (a.orden || 0) - (b.orden || 0));
  return { ok: true, datos };
}

async function crearModulo(d) {
  const nombre = escaparTexto(d.nombre);
  if (!nombre) return { ok: false, error: "El módulo necesita un nombre" };

  const snap = await db.collection(COL.modulos).get();
  const maxOrden = snap.docs.reduce((m, doc) => Math.max(m, Number(doc.data().orden) || 0), 0);

  const icono = escaparTexto(d.icono) || "💜";
  const descripcion = escaparTexto(d.descripcion);
  const ref = await db.collection(COL.modulos).add({
    nombre,
    descripcion,
    icono,
    orden: Number(d.orden) || maxOrden + 1,
    fechaCreacion: nowISO(),
    activo: true
  });

  notificarNuevoModulo({ id: ref.id, nombre, icono, descripcion });
  return { ok: true, id: ref.id };
}

async function actualizarModulo(d) {
  const nombre = escaparTexto(d.nombre);
  if (!nombre) return { ok: false, error: "El módulo necesita nombre" };
  const ref = db.collection(COL.modulos).doc(String(d.id));
  const doc = await ref.get();
  if (!doc.exists) return { ok: false, error: "Módulo no encontrado" };

  await ref.update({
    nombre,
    descripcion: escaparTexto(d.descripcion),
    icono: escaparTexto(d.icono) || "💜",
    orden: Number(d.orden) || doc.data().orden || 1
  });
  return { ok: true };
}

async function eliminarModulo(d) {
  const ref = db.collection(COL.modulos).doc(String(d.id));
  const doc = await ref.get();
  if (!doc.exists) return { ok: false, error: "Módulo no encontrado" };

  // Desactivar los deseos de este módulo (igual que hacía el backend)
  const snapDeseos = await db.collection(COL.deseos).where("moduloId", "==", String(d.id)).get();
  const batch = db.batch();
  snapDeseos.forEach((doc) => batch.update(doc.ref, { activo: false }));
  await batch.commit();

  await ref.delete();
  return { ok: true };
}

/* =====================================================
   DESEOS
   ===================================================== */
async function obtenerDeseos() {
  const snap = await db.collection(COL.deseos).get();
  const datos = snap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((x) => x.activo !== false);
  return { ok: true, datos };
}

async function crearDeseo(d) {
  const nombre = escaparTexto(d.nombre);
  if (!nombre) return { ok: false, error: "El deseo necesita un nombre" };
  if (!d.moduloId) return { ok: false, error: "Falta el módulo" };

  const snap = await db.collection(COL.deseos).where("moduloId", "==", String(d.moduloId)).get();
  const maxOrden = snap.docs.reduce((m, doc) => Math.max(m, Number(doc.data().orden) || 0), 0);

  const ahora = nowISO();
  const url = validarURL(d.url);
  const prioridad = d.prioridad || "Sin prioridad";
  const descripcion = escaparTexto(d.descripcion);

  const ref = await db.collection(COL.deseos).add({
    moduloId: String(d.moduloId),
    orden: Number(d.orden) || maxOrden + 1,
    nombre,
    url,
    prioridad,
    descripcion,
    fechaCreacion: ahora,
    fechaActualizacion: ahora,
    activo: true
  });

  notificarNuevoDeseo({ id: ref.id, nombre, url, prioridad, descripcion, moduloId: d.moduloId });
  return { ok: true, id: ref.id };
}

async function actualizarDeseo(d) {
  const nombre = escaparTexto(d.nombre);
  if (!nombre) return { ok: false, error: "El deseo necesita nombre" };
  const ref = db.collection(COL.deseos).doc(String(d.id));
  const doc = await ref.get();
  if (!doc.exists) return { ok: false, error: "Deseo no encontrado" };

  await ref.update({
    orden: Number(d.orden) || doc.data().orden || 1,
    nombre,
    url: validarURL(d.url),
    prioridad: d.prioridad || "Sin prioridad",
    descripcion: escaparTexto(d.descripcion),
    fechaActualizacion: nowISO()
  });
  return { ok: true };
}

async function eliminarDeseo(d) {
  const ref = db.collection(COL.deseos).doc(String(d.id));
  const doc = await ref.get();
  if (!doc.exists) return { ok: false, error: "Deseo no encontrado" };
  await ref.delete();
  return { ok: true };
}

/* =====================================================
   EVENTOS
   ===================================================== */
async function obtenerEventos() {
  const snap = await db.collection(COL.eventos).get();
  const datos = snap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((x) => x.activo !== false);
  return { ok: true, datos };
}

async function crearEvento(d) {
  const titulo = escaparTexto(d.titulo);
  if (!titulo) return { ok: false, error: "El evento necesita un título" };
  if (!d.fecha) return { ok: false, error: "El evento necesita fecha" };

  const horaInicio = d.horaInicio || "00:00";
  const horaFin = d.horaFin || "23:59";
  const descripcion = escaparTexto(d.descripcion) || "paseo o convivencia";
  const lugar = escaparTexto(d.lugar);
  const tipo = d.tipo || "💕 Cita";
  const ahora = nowISO();

  const ref = await db.collection(COL.eventos).add({
    titulo,
    fecha: d.fecha,
    horaInicio,
    horaFin,
    descripcion,
    lugar,
    tipo,
    todoElDia: !!d.todoElDia,
    moduloId: d.moduloId || "",
    deseoId: d.deseoId || "",
    cumplido: false,
    fechaCreacion: ahora,
    fechaActualizacion: ahora,
    activo: true,
    notificadoAntes: false,
    notificadoDia: false
  });

  notificarNuevaFecha({ id: ref.id, titulo, fecha: d.fecha, horaInicio, horaFin, descripcion, lugar, tipo });
  return { ok: true, id: ref.id };
}

async function actualizarEvento(d) {
  const titulo = escaparTexto(d.titulo);
  if (!titulo) return { ok: false, error: "Falta el título" };
  const ref = db.collection(COL.eventos).doc(String(d.id));
  const doc = await ref.get();
  if (!doc.exists) return { ok: false, error: "Evento no encontrado" };

  await ref.update({
    titulo,
    fecha: d.fecha,
    horaInicio: d.horaInicio || "00:00",
    horaFin: d.horaFin || "23:59",
    descripcion: escaparTexto(d.descripcion) || "paseo o convivencia",
    lugar: escaparTexto(d.lugar),
    tipo: d.tipo || "💕 Cita",
    todoElDia: !!d.todoElDia,
    moduloId: d.moduloId || "",
    deseoId: d.deseoId || "",
    fechaActualizacion: nowISO(),
    notificadoAntes: false,
    notificadoDia: false
  });
  return { ok: true };
}

async function eliminarEvento(d) {
  const ref = db.collection(COL.eventos).doc(String(d.id));
  const doc = await ref.get();
  if (!doc.exists) return { ok: false, error: "Evento no encontrado" };
  await ref.delete();
  return { ok: true };
}

async function marcarCumplido(d) {
  const ref = db.collection(COL.eventos).doc(String(d.id));
  const doc = await ref.get();
  if (!doc.exists) return { ok: false, error: "Evento no encontrado" };
  await ref.update({ cumplido: !!d.cumplido, fechaActualizacion: nowISO() });
  return { ok: true };
}

/* =====================================================
   RESPONSABLES
   ===================================================== */
async function obtenerResponsables() {
  const snap = await db.collection(COL.responsables).get();
  const datos = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return { ok: true, datos };
}

async function crearResponsable(d) {
  const email = escaparTexto(d.email);
  if (!email || !validarEmail(email)) return { ok: false, error: "Correo inválido" };

  const ref = await db.collection(COL.responsables).add({
    email,
    nombre: escaparTexto(d.nombre),
    notif_nueva_fecha: !!d.notif_nueva_fecha,
    notif_nuevo_deseo: !!d.notif_nuevo_deseo,
    notif_nuevo_modulo: !!d.notif_nuevo_modulo,
    notif_dia_antes: !!d.notif_dia_antes,
    notif_dia_evento: !!d.notif_dia_evento,
    activo: d.activo !== false,
    fechaCreacion: nowISO()
  });
  return { ok: true, id: ref.id };
}

async function actualizarResponsable(d) {
  const email = escaparTexto(d.email);
  if (!email || !validarEmail(email)) return { ok: false, error: "Correo inválido" };
  const ref = db.collection(COL.responsables).doc(String(d.id));
  const doc = await ref.get();
  if (!doc.exists) return { ok: false, error: "Responsable no encontrado" };

  await ref.update({
    email,
    nombre: escaparTexto(d.nombre),
    notif_nueva_fecha: !!d.notif_nueva_fecha,
    notif_nuevo_deseo: !!d.notif_nuevo_deseo,
    notif_nuevo_modulo: !!d.notif_nuevo_modulo,
    notif_dia_antes: !!d.notif_dia_antes,
    notif_dia_evento: !!d.notif_dia_evento,
    activo: d.activo !== false
  });
  return { ok: true };
}

async function eliminarResponsable(d) {
  const ref = db.collection(COL.responsables).doc(String(d.id));
  const doc = await ref.get();
  if (!doc.exists) return { ok: false, error: "Responsable no encontrado" };
  await ref.delete();
  return { ok: true };
}

async function enviarPruebaResponsable(d) {
  const email = escaparTexto(d.email);
  if (!email || !validarEmail(email)) return { ok: false, error: "Correo inválido" };

  const html = plantillaCorreo({
    titulo: "💜 Prueba de notificaciones",
    subtitulo: "Este es un correo de prueba de Deseos de Bartolita",
    cuerpoHtml: "<p>Si ves esto, las notificaciones están funcionando 🎉</p>"
  });

  try {
    const resultado = await encolarCorreo([email], "💜 Prueba — Deseos de Bartolita", html);
    if (!resultado || !resultado.ok) {
      const error = (resultado && resultado.error) || "No se pudo enviar";
      await registrarNotif("prueba_responsable", email, "Prueba a " + email, "", "ERROR: " + error);
      return { ok: false, error };
    }
    await registrarNotif("prueba_responsable", email, "Prueba a " + email, "", "OK");
    return { ok: true };
  } catch (e) {
    await registrarNotif("prueba_responsable", email, "Prueba a " + email, "", "ERROR: " + e.message);
    return { ok: false, error: e.message };
  }
}

/* =====================================================
   ENRUTADOR — mismas firmas que usaba el index.html
   con el backend de Apps Script (apiGet / apiPost)
   ===================================================== */
async function apiGet(accion, extra) {
  await esperarSesion();
  try {
    switch (accion) {
      case "ping": return { ok: true, mensaje: "💜 Bartolita (Firebase)" };
      case "obtenerModulos": return await obtenerModulos();
      case "obtenerDeseos": return await obtenerDeseos();
      case "obtenerEventos": return await obtenerEventos();
      case "obtenerResponsables": return await obtenerResponsables();
      case "obtenerConfig": return { ok: true, datos: {} };
      default: return { ok: false, error: "Acción no reconocida: " + accion };
    }
  } catch (err) {
    console.error(err);
    return { ok: false, error: err.message || String(err) };
  }
}

async function apiPost(payload) {
  await esperarSesion();
  const accion = payload && payload.accion;
  try {
    switch (accion) {
      case "crearModulo": return await crearModulo(payload);
      case "actualizarModulo": return await actualizarModulo(payload);
      case "eliminarModulo": return await eliminarModulo(payload);
      case "crearDeseo": return await crearDeseo(payload);
      case "actualizarDeseo": return await actualizarDeseo(payload);
      case "eliminarDeseo": return await eliminarDeseo(payload);
      case "crearEvento": return await crearEvento(payload);
      case "actualizarEvento": return await actualizarEvento(payload);
      case "eliminarEvento": return await eliminarEvento(payload);
      case "marcarCumplido": return await marcarCumplido(payload);
      case "crearResponsable": return await crearResponsable(payload);
      case "actualizarResponsable": return await actualizarResponsable(payload);
      case "eliminarResponsable": return await eliminarResponsable(payload);
      case "enviarPruebaResponsable": return await enviarPruebaResponsable(payload);
      default: return { ok: false, error: "Acción no reconocida: " + accion };
    }
  } catch (err) {
    console.error(err);
    return { ok: false, error: err.message || String(err) };
  }
}
