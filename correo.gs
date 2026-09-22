/**
 * =====================================================
 * 💜 DESEOS DE BARTOLITA — Servicio de correo (Apps Script)
 * =====================================================
 * Este script YA NO guarda datos (eso lo hace Firebase/Firestore).
 * Su única tarea es recibir una petición desde la web y enviar un
 * correo real con MailApp, usando tu cuenta de Gmail. Es gratis y
 * no necesita ninguna base de datos ni Google Sheets.
 *
 * DESPLIEGUE:
 * 1. https://script.google.com → Proyecto nuevo → pega este código
 *    (borra lo que venga por defecto).
 * 2. Cambia CLAVE_SECRETA por una palabra/clave que solo ustedes conozcan.
 * 3. Implementar → Nueva implementación → tipo "Aplicación web".
 *      - Ejecutar como: Yo (tu cuenta de Gmail)
 *      - Quién puede acceder: Cualquier usuario
 * 4. Autoriza los permisos que pida (enviar correo en tu nombre).
 * 5. Copia la URL que te da (termina en /exec) y pégala en
 *    firebase-logic.js, en la constante MAIL_API_URL.
 * =====================================================
 */

const CLAVE_SECRETA = "CAMBIA-ESTA-CLAVE-1234";

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

    if (!destinatarios.length) {
      return respuestaJSON({ ok: false, error: "Sin destinatarios" });
    }
    if (!html) {
      return respuestaJSON({ ok: false, error: "Correo sin contenido" });
    }

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

    return respuestaJSON({ ok: true, enviados, fallidos });
  } catch (err) {
    return respuestaJSON({ ok: false, error: err.message });
  }
}

function respuestaJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

/**
 * Prueba manual: selecciona esta función en el editor de Apps Script
 * y presiona "Ejecutar" para mandarte un correo de prueba a ti mismo,
 * sin pasar por la web. Cambia el correo antes de ejecutar.
 */
function pruebaManual() {
  MailApp.sendEmail({
    to: "tu-correo@gmail.com",
    subject: "💜 Prueba directa desde Apps Script",
    htmlBody: "<p>Si te llegó esto, el envío de correos funciona 🎉</p>"
  });
}
