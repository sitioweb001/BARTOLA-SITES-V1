/* =====================================================
   💜 DESEOS DE BARTOLITA — Configuración de Firebase
   =====================================================
   1. Ve a https://console.firebase.google.com
   2. Abre tu proyecto (o crea uno nuevo)
   3. ⚙️ Configuración del proyecto → General → "Tus apps"
   4. Si no tienes una app web, crea una (ícono </>)
   5. Copia el objeto "firebaseConfig" que te dan y pégalo aquí abajo,
      reemplazando todo el objeto de ejemplo.
   ===================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyA3h8z2hsrE1WdIw3moBNZi9qrmolF8PHw",
  authDomain: "deseos-de-bartolita.firebaseapp.com",
  projectId: "deseos-de-bartolita",
  storageBucket: "deseos-de-bartolita.firebasestorage.app",
  messagingSenderId: "649989456641",
  appId: "1:649989456641:web:a1e6fbfb20698161815100",
  measurementId: "G-1LE1F49YF0"
};

/* No necesitas tocar nada de aquí para abajo */
firebase.initializeApp(firebaseConfig);

// Base de datos Firestore, se usa en firebase-logic.js
const db = firebase.firestore();

// Analytics es opcional: si el navegador lo bloquea (adblock, Brave, etc.)
// no debe romper la app, por eso va en try/catch.
try {
  if (firebase.analytics) firebase.analytics();
} catch (e) {
  console.warn("Analytics no se pudo iniciar (no afecta el funcionamiento):", e);
}

// Autenticación anónima: así solo la propia web (con su config) puede
// leer/escribir, sin necesidad de pantalla de login para ustedes dos.
firebase.auth().signInAnonymously().catch((err) => {
  console.error("No se pudo iniciar sesión anónima en Firebase:", err);
});

// Bandera para saber si ya hay sesión lista antes de usar Firestore
window.firebaseListo = new Promise((resolve) => {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) resolve(user);
  });
});
