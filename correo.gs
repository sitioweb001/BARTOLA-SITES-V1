/**
 * =====================================================
 * 💜 DESEOS DE BARTOLITA — Servicio de correo (Apps Script)
 * =====================================================
 * Este script NO usa Google Sheets. Hace dos cosas:
 *
 *  1) doPost(): recibe peticiones de la web y envía correos con
 *     MailApp (nueva fecha, nuevo deseo, nuevo módulo, prueba).
 *
 *  2) revisarRecordatorios(): se ejecuta solo, todos los días a las
 *     8:00 AM (trigger). Lee los eventos y responsables desde
 *     Firestore y envía:
 *        ⏰ Aviso el día antes del evento
 *        💜 Aviso el mismo día del evento
 *     Marca el evento como notificado para no repetir el correo.
 *
 * DESPLIEGUE:
 * 1. https://script.google.com → tu proyecto → pega este código.
 * 2. CLAVE_SECRETA debe ser IDÉNTICA a MAIL_API_CLAVE de firebase-logic.js.
 * 3. Implementar → Nueva implementación (o Administrar → editar → nueva
 *    versión) → Aplicación web, ejecutar como "Yo", acceso "Cualquier usuario".
 * 4. Selecciona la función  menuInstalarTrigger  y presiónale ▶ Ejecutar UNA vez.
 *    Autoriza los permisos (correo + conexión externa a Firestore).
 * 5. Prueba: ejecuta  revisarRecordatorios  a mano y mira Ver → Registros.
 * =====================================================
 */

const CLAVE_SECRETA = "3457";

// Datos públicos de tu proyecto Firebase (los mismos de firebase-config.js)
const FIREBASE_API_KEY = "AIzaSyA3h8z2hsrE1WdIw3moBNZi9qrmolF8PHw";
const FIREBASE_PROJECT_ID = "deseos-de-bartolita";
const URL_SITIO = "https://sitioweb001.github.io/BARTOLA-SITES-V1/";
const ZONA_HORARIA = "America/El_Salvador";
const HORA_RECORDATORIO = 8; // 8:00 AM

/* ============ API WEB (envío de correos) ============ */
function doGet(e) {
  return respuestaJSON({ ok: true, mensaje: "💜 Servicio de correo de Bartolita activo" });
}

function doPost(e) {
  let datos = {};
  try {
    datos = JSON.parse(e.postData.contents);
  } catch (err) {
    return respuestaJSON({ ok: false, error: "JSON inválido" });
  }

  if (datos.clave !== CLAVE_SECRETA) {
    return respuestaJSON({ ok: false, error: "Clave incorrecta" });
  }

  try {
    const destinatarios = []
      .concat(datos.destinatarios || datos.to || [])
      .filter(Boolean);

    const asunto = String(datos.asunto || datos.subject || "💜 Deseos de Bartolita").slice(0, 200);
    const html = String(datos.html || datos.htmlBody || "");

    if (!destinatarios.length) return respuestaJSON({ ok: false, error: "Sin destinatarios" });
    if (!html) return respuestaJSON({ ok: false, error: "Correo sin contenido" });

    const res = enviarA(destinatarios, asunto, html);
    return respuestaJSON({ ok: true, enviados: res.enviados, fallidos: res.fallidos });
  } catch (err) {
    return respuestaJSON({ ok: false, error: err.message });
  }
}

function enviarA(destinatarios, asunto, html) {
  let enviados = 0;
  const fallidos = [];
  destinatarios.forEach((correo) => {
    if (!validarEmail(correo)) { fallidos.push(correo); return; }
    try {
      MailApp.sendEmail({ to: correo, subject: asunto, htmlBody: html });
      enviados++;
    } catch (err) {
      fallidos.push(correo);
    }
  });
  return { enviados, fallidos };
}

function respuestaJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

/* ============ RECORDATORIOS AUTOMÁTICOS ============ */

/**
 * Instala el trigger diario. Ejecútala UNA sola vez a mano.
 */
function menuInstalarTrigger() {
  ScriptApp.getProjectTriggers().forEach((t) => {
    if (t.getHandlerFunction() === "revisarRecordatorios") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("revisarRecordatorios")
    .timeBased()
    .everyDays(1)
    .atHour(HORA_RECORDATORIO)
    .inTimezone(ZONA_HORARIA)
    .create();
  Logger.log("✅ Trigger instalado: revisarRecordatorios cada día a las " + HORA_RECORDATORIO + ":00 (" + ZONA_HORARIA + ")");
}

/**
 * Revisa Firestore y envía los avisos del día antes y del mismo día.
 * La llama el trigger, pero también puedes ejecutarla a mano para probar.
 */
function revisarRecordatorios() {
  const token = obtenerTokenFirebase();
  const eventos = listarColeccion("eventos", token);
  const responsables = listarColeccion("responsables", token)
    .filter((r) => r.activo !== false && validarEmail(r.email));

  const ahora = new Date();
  const hoy = Utilities.formatDate(ahora, ZONA_HORARIA, "yyyy-MM-dd");
  const manana = Utilities.formatDate(new Date(ahora.getTime() + 24 * 3600 * 1000), ZONA_HORARIA, "yyyy-MM-dd");

  let enviadosAntes = 0, enviadosDia = 0;

  eventos.forEach((ev) => {
    if (ev.activo === false || ev.cumplido === true) return;

    if (ev.fecha === manana && ev.notificadoAntes !== true) {
      const dest = responsables.filter((r) => r.notif_dia_antes === true).map((r) => r.email);
      if (dest.length) {
        const asunto = "⏰ Mañana: " + ev.titulo;
        const html = plantillaCorreo("⏰ ¡Mañana tienen un momento!", ev.titulo, cuerpoEvento(ev));
        const res = enviarA(dest, asunto, html);
        if (res.enviados > 0) {
          marcarEvento(ev.id, "notificadoAntes", token);
          registrarNotificacion("recordatorio_antes", dest.join(","), asunto, ev.id, res.fallidos.length ? "PARCIAL" : "OK", token);
          enviadosAntes++;
        }
      }
    }

    if (ev.fecha === hoy && ev.notificadoDia !== true) {
      const dest = responsables.filter((r) => r.notif_dia_evento === true).map((r) => r.email);
      if (dest.length) {
        const asunto = "💜 ¡Hoy! " + ev.titulo;
        const html = plantillaCorreo("💜 ¡Hoy es el día!", ev.titulo, cuerpoEvento(ev));
        const res = enviarA(dest, asunto, html);
        if (res.enviados > 0) {
          marcarEvento(ev.id, "notificadoDia", token);
          registrarNotificacion("recordatorio_dia", dest.join(","), asunto, ev.id, res.fallidos.length ? "PARCIAL" : "OK", token);
          enviadosDia++;
        }
      }
    }
  });

  Logger.log("Recordatorios enviados → día antes: " + enviadosAntes + " · mismo día: " + enviadosDia);
}

function cuerpoEvento(ev) {
  const hora = ev.todoElDia === true
    ? "Todo el día"
    : (ev.horaInicio ? ev.horaInicio + (ev.horaFin ? " — " + ev.horaFin : "") : "");
  return "<p><b>📅 Fecha:</b> " + limpiar(ev.fecha) + "</p>" +
    (hora ? "<p><b>🕐 Hora:</b> " + limpiar(hora) + "</p>" : "") +
    (ev.lugar ? "<p><b>📍 Lugar:</b> " + limpiar(ev.lugar) + "</p>" : "") +
    (ev.descripcion ? "<p>" + limpiar(ev.descripcion) + "</p>" : "");
}

function plantillaCorreo(titulo, subtitulo, cuerpoHtml) {
  return '<div style="font-family:Quicksand,Arial,sans-serif;max-width:480px;margin:auto;background:#FBF8FE;padding:28px;border-radius:18px;border:1px solid #E9D9F8;">' +
    '<div style="font-size:1.4rem;font-weight:700;color:#4A3467;margin-bottom:4px;">' + titulo + '</div>' +
    (subtitulo ? '<div style="color:#7A6B92;margin-bottom:14px;">' + limpiar(subtitulo) + '</div>' : "") +
    cuerpoHtml +
    '<a href="' + URL_SITIO + '" style="display:inline-block;margin-top:18px;padding:12px 22px;background:#9370B8;color:#fff;border-radius:12px;text-decoration:none;font-weight:600;">Abrir 💜 Deseos de Bartolita</a>' +
    '</div>';
}

function limpiar(txt) {
  return String(txt == null ? "" : txt)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ============ Firestore por REST (sin Google Sheets) ============
 * Inicia sesión anónima con la API key pública y usa ese token; así
 * pasa las mismas reglas de firestore.rules (request.auth != null). */
function obtenerTokenFirebase() {
  const r = UrlFetchApp.fetch(
    "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=" + FIREBASE_API_KEY,
    { method: "post", contentType: "application/json", payload: JSON.stringify({ returnSecureToken: true }), muteHttpExceptions: true }
  );
  const j = JSON.parse(r.getContentText());
  if (!j.idToken) {
    throw new Error("No se pudo iniciar sesión anónima en Firebase (¿está habilitado Authentication → Anónimo?): " + r.getContentText());
  }
  return j.idToken;
}

function urlDocs() {
  return "https://firestore.googleapis.com/v1/projects/" + FIREBASE_PROJECT_ID + "/databases/(default)/documents";
}

function listarColeccion(nombre, token) {
  const salida = [];
  let pageToken = "";
  do {
    const url = urlDocs() + "/" + nombre + "?pageSize=300" + (pageToken ? "&pageToken=" + encodeURIComponent(pageToken) : "");
    const r = UrlFetchApp.fetch(url, { headers: { Authorization: "Bearer " + token }, muteHttpExceptions: true });
    const j = JSON.parse(r.getContentText());
    if (j.error) throw new Error("Firestore (" + nombre + "): " + j.error.message);
    (j.documents || []).forEach((d) => salida.push(docAObjeto(d)));
    pageToken = j.nextPageToken || "";
  } while (pageToken);
  return salida;
}

function docAObjeto(d) {
  const o = { id: d.name.split("/").pop() };
  const campos = d.fields || {};
  Object.keys(campos).forEach((k) => { o[k] = valorFirestore(campos[k]); });
  return o;
}

function valorFirestore(v) {
  if ("stringValue" in v) return v.stringValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("timestampValue" in v) return v.timestampValue;
  return null;
}

function marcarEvento(id, campo, token) {
  const url = urlDocs() + "/eventos/" + encodeURIComponent(id) + "?updateMask.fieldPaths=" + campo;
  const cuerpo = { fields: {} };
  cuerpo.fields[campo] = { booleanValue: true };
  UrlFetchApp.fetch(url, {
    method: "patch", contentType: "application/json",
    headers: { Authorization: "Bearer " + token },
    payload: JSON.stringify(cuerpo), muteHttpExceptions: true
  });
}

function registrarNotificacion(tipo, destinatario, asunto, eventoId, estado, token) {
  try {
    UrlFetchApp.fetch(urlDocs() + "/notificaciones", {
      method: "post", contentType: "application/json",
      headers: { Authorization: "Bearer " + token },
      payload: JSON.stringify({ fields: {
        fecha: { stringValue: new Date().toISOString() },
        tipo: { stringValue: tipo },
        destinatario: { stringValue: destinatario },
        asunto: { stringValue: asunto },
        eventoId: { stringValue: eventoId || "" },
        estado: { stringValue: estado }
      } }),
      muteHttpExceptions: true
    });
  } catch (e) { /* el log no debe romper el envío */ }
}

/**
 * Prueba manual: manda un correo de prueba a ti mismo.
 * Cambia el correo antes de ejecutar.
 */
function pruebaManual() {
  MailApp.sendEmail({
    to: "tu-correo@gmail.com",
    subject: "💜 Prueba directa desde Apps Script",
    htmlBody: "<p>Si te llegó esto, el envío de correos funciona 🎉</p>"
  });
}
