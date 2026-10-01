/* =====================================================
   💜 DESEOS DE BARTOLITA — Inicializar base de datos
   =====================================================
   CÓMO USARLO:
   1. Abre https://sitioweb001.github.io/BARTOLA-SITES-V1/index.html
      (ya con firebase-config.js correctamente configurado y subido).
   2. Abre la consola del navegador (F12 → pestaña "Console").
   3. Pega TODO este código y presiona Enter.
   4. Espera el mensaje "✅ Base de datos lista".
   5. Recarga la página normalmente.

   Es seguro ejecutarlo más de una vez: no duplica los módulos
   si ya existen (los detecta por nombre).
   ===================================================== */
(async () => {
  console.log("💜 Inicializando base de datos de Bartolita...");

  if (typeof db === "undefined") {
    console.error("❌ No se encontró Firestore (db). Asegúrate de estar en la página con firebase-config.js cargado.");
    return;
  }

  await window.firebaseListo;

  const modulosIniciales = [
    { icono: "🌸", nombre: "Lugares que queremos visitar", descripcion: "Sitios que soñamos conocer juntos" },
    { icono: "🍰", nombre: "Cosas que queremos comer", descripcion: "Restaurantes y platillos pendientes" },
    { icono: "🎬", nombre: "Cosas que queremos hacer", descripcion: "Planes y actividades juntos" },
    { icono: "🎁", nombre: "Cosas que queremos comprar", descripcion: "Caprichos y regalitos" },
    { icono: "💜", nombre: "Momentos que queremos vivir", descripcion: "Recuerdos por crear" }
  ];

  const snap = await db.collection("modulos").get();
  const existentes = new Set(snap.docs.map((d) => d.data().nombre));

  let creados = 0;
  for (let i = 0; i < modulosIniciales.length; i++) {
    const m = modulosIniciales[i];
    if (existentes.has(m.nombre)) {
      console.log(`↪️  Ya existe: ${m.nombre}`);
      continue;
    }
    await db.collection("modulos").add({
      nombre: m.nombre,
      descripcion: m.descripcion,
      icono: m.icono,
      orden: i + 1,
      fechaCreacion: new Date().toISOString(),
      activo: true
    });
    console.log(`✨ Creado módulo: ${m.icono} ${m.nombre}`);
    creados++;
  }

  // Documento de configuración/versión, opcional pero útil como referencia
  await db.collection("config").doc("general").set(
    { version: "1.0.0-firebase", migradoEl: new Date().toISOString() },
    { merge: true }
  );

  console.log(`✅ Base de datos lista. Módulos nuevos creados: ${creados}.`);
  console.log("Ya puedes recargar la página y empezar a usar Deseos de Bartolita 💜");
})();
