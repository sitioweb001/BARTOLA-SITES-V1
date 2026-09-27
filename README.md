# 💜 Deseos de Bartolita

> Un espacio privado para dos: guardar deseos, agendar momentos y verlos cumplirse uno por uno.

<p align="center">
  <img alt="versión" src="https://img.shields.io/badge/versión-4.0.0-C8A2E0?style=for-the-badge&logo=heart&logoColor=white">
  <img alt="firebase" src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black">
  <img alt="firestore" src="https://img.shields.io/badge/Cloud%20Firestore-039BE5?style=for-the-badge&logo=firebase&logoColor=white">
  <img alt="apps script" src="https://img.shields.io/badge/Apps%20Script%20(solo%20correo)-4285F4?style=for-the-badge&logo=google&logoColor=white">
  <img alt="pwa" src="https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white">
  <img alt="html5" src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white">
  <img alt="css3" src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white">
  <img alt="javascript" src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">
</p>

<p align="center">
  <a href="https://sitioweb001.github.io/BARTOLITA-SITES/">
    <img alt="Abrir web" src="https://img.shields.io/badge/💜%20Abrir%20la%20web-BARTOLITA%20SITES-9370B8?style=for-the-badge">
  </a>
</p>

> ⚠️ **Cambio importante de versión:** desde la v4, la app **ya no usa Google Sheets ni Google Apps Script como base de datos**. Todos los datos (módulos, deseos, eventos, responsables) viven ahora en **Cloud Firestore**. Apps Script se conserva únicamente como un microservicio muy pequeño (`correo.gs`) cuya única función es enviar correos con `MailApp`, porque Firestore por sí solo no puede mandar emails gratis.

---

## 📑 Índice

- [✨ Descripción general](#-descripción-general)
- [🎨 Paleta de colores](#-paleta-de-colores)
- [🧩 Estructura del proyecto](#-estructura-del-proyecto)
- [🏗️ Arquitectura](#️-arquitectura)
- [⚙️ Tecnologías usadas](#️-tecnologías-usadas)
- [🚀 Instalación paso a paso](#-instalación-paso-a-paso)
- [🗄️ Base de datos (Cloud Firestore)](#️-base-de-datos-cloud-firestore)
- [💜 Módulo de deseos](#-módulo-de-deseos)
- [📅 Módulo de calendario](#-módulo-de-calendario)
- [👑 Vista de Bartolo](#-vista-de-bartolo)
- [🔔 Notificaciones y correos](#-notificaciones-y-correos)
- [📲 Instalable como app (PWA)](#-instalable-como-app-pwa)
- [🧭 Estructura del menú](#-estructura-del-menú)
- [🖼️ Ejemplos visuales](#️-ejemplos-visuales)
- [🛠️ API interna (firebase-logic.js)](#️-api-interna-firebase-logicjs)
- [📱 Responsive](#-responsive)
- [🧪 Pruebas](#-pruebas)
- [🔒 Seguridad](#-seguridad)
- [❓ Preguntas frecuentes](#-preguntas-frecuentes)
- [📄 Licencia](#-licencia)
- [💌 Créditos](#-créditos)

---

## ✨ Descripción general

**Deseos de Bartolita** es una aplicación web privada, instalable como app (PWA), pensada para que dos personas puedan:

- 🌸 Guardar sus **deseos** agrupados por módulos (lugares, comidas, planes, regalos, momentos).
- 📅 Agendar **momentos juntos** en un calendario interactivo, que ahora muestra emojis y un resumen de texto directamente en cada día.
- 💜 Marcar como **cumplidos** tanto los eventos del calendario **como los deseos individuales**.
- 👑 Acceder a una vista especial **"Vista de Bartolo"** con estadísticas, filtros, la lista de deseos pendientes agrupada por módulo, y un aviso de fechas próximas.
- 🔔 Recibir **notificaciones por correo** el día antes y el mismo día del evento.
- 🔗 Guardar **enlaces** con vista previa y botón de copiar.
- 📧 Configurar **responsables** que recibirán correos automáticos.
- 📲 **Instalarse en el celular o la computadora** como una app real, con ícono propio y funcionamiento sin conexión para el cascarón visual.

Toda la información se guarda en tiempo real en **Cloud Firestore** y la app se sirve como un sitio estático (por ejemplo, en GitHub Pages). El envío de correos sigue delegado a una cuenta de Gmail mediante un script mínimo de Google Apps Script.

---

## 🎨 Paleta de colores

| Color | Hex | Uso principal |
|---|---|---|
| 🟣 **Lila claro** | `#F4ECFC` | Fondos secundarios |
| 🟣 **Lavanda** | `#E9D9F8` | Bordes, tarjetas |
| 🟣 **Lila medio** | `#D4B8EC` | Acentos, botones |
| 🟣 **Lila fuerte** | `#B892DB` | Estados activos |
| 🟣 **Morado suave** | `#9370B8` | Texto destacado |
| 🟣 **Morado profundo** | `#6B4C8F` | Títulos |
| 🟣 **Morado oscuro** | `#4A3467` | Titulares |
| ⚪ **Blanco** | `#FFFFFF` | Tarjetas, modales |
| 🌸 **Rosa suave** | `#FBEAF4` | Fines de semana en el calendario |
| 🌸 **Rosa pastel** | `#F2C4DD` | Acentos decorativos |
| 🔴 **Urgente** | `#E8748F` | Prioridad alta |
| 🟡 **Importante** | `#E8B556` | Prioridad media |
| 🟢 **Puede esperar** | `#7FC8A0` | Prioridad baja |
| ⚪ **Sin prioridad** | `#B8A8D0` | Neutro |

### Vista de la paleta

```text
┌──────────────────────────────────────────────────────┐
│  #FBF8FE   #F4ECFC   #E9D9F8   #D4B8EC   #B892DB     │
│  #9370B8   #6B4C8F   #4A3467   #FFFFFF   #FBEAF4     │
│  #F2C4DD   #E8748F   #E8B556   #7FC8A0   #B8A8D0     │
└──────────────────────────────────────────────────────┘
```

---

## 🧩 Estructura del proyecto

```text
BARTOLITA-SITES/
│
├── index.html                 # Frontend completo (HTML + CSS + JS)
├── firebase-config.js         # Configuración e inicialización de Firebase
├── firebase-logic.js          # "Backend" en el navegador: CRUD contra Firestore
├── firestore.rules            # Reglas de seguridad de Firestore
├── inicializar-bd.js          # Script de un solo uso para crear los módulos iniciales
├── correo.gs                  # Único resto de Apps Script: solo envía correos (MailApp)
├── manifest.json               # Manifest de la PWA (nombre, colores, íconos)
├── service-worker.js          # Cachea el cascarón para que la app instale e inicie offline
├── icon-192.png                # Ícono de la app (192×192)
├── icon-512.png                 # Ícono de la app (512×512)
├── icon-512-maskable.png       # Ícono "maskable" para Android
├── README.md                   # Este archivo
│
└── /fotos/                    # (Opcional) Recursos gráficos extra
```

| Archivo | Descripción |
|---|---|
| `index.html` | Interfaz completa: deseos, calendario, vista Bartolo, notificaciones, modales. Carga Firebase, `firebase-config.js` y `firebase-logic.js`. |
| `firebase-config.js` | Pega aquí tu `firebaseConfig` del panel de Firebase. Inicializa la app, Firestore y el inicio de sesión anónimo. |
| `firebase-logic.js` | Reemplaza al antiguo `codigo.gs`. Expone las mismas funciones `apiGet(accion)` / `apiPost(payload)` que usa `index.html`, pero hablan directo con Firestore en el navegador. |
| `firestore.rules` | Reglas de seguridad: solo permite leer/escribir a quien tenga una sesión (aunque sea anónima) creada por `firebase-config.js`. |
| `inicializar-bd.js` | Se pega una sola vez en la consola del navegador para crear los módulos iniciales en Firestore. Es seguro ejecutarlo más de una vez. |
| `correo.gs` | Microservicio de Apps Script que **solo** envía correos con `MailApp`. No guarda datos ni usa Google Sheets. |
| `manifest.json` / `service-worker.js` / `icon-*.png` | Convierten la web en una **PWA instalable**, con ícono propio y arranque aunque no haya conexión. |
| `README.md` | Documentación del proyecto. |

---

## 🏗️ Arquitectura

```text
┌─────────────────────────────────────────────────────────┐
│                   USUARIO (navegador / app instalada)    │
│                                                          │
│   💻 index.html (HTML + CSS + JS)                        │
│   ├─ firebase-config.js  → inicializa Firebase           │
│   ├─ firebase-logic.js   → apiGet() / apiPost()          │
│   └─ service-worker.js   → cachea el cascarón (PWA)      │
└───────────────┬───────────────────────┬──────────────────┘
                │ SDK de Firebase        │ fetch() (solo para correos)
                ▼                        ▼
┌───────────────────────────┐  ┌─────────────────────────────┐
│      CLOUD FIRESTORE      │  │   GOOGLE APPS SCRIPT         │
│                           │  │   (correo.gs)                │
│  📦 modulos               │  │                              │
│  📦 deseos                │  │   doPost() → MailApp.sendEmail│
│  📦 eventos               │  │   Solo envía correos, no      │
│  📦 responsables          │  │   guarda ningún dato          │
│  📦 notificaciones        │  │                              │
│  📦 config                │  └─────────────────────────────┘
│                           │
│  Auth: sesión anónima     │
│  Reglas: firestore.rules  │
└───────────────────────────┘
```

**En resumen:** Firestore es ahora la única base de datos (lectura y escritura en tiempo real desde el navegador), y Apps Script quedó reducido a un simple "enviador de correos" sin acceso a los datos.

---

## ⚙️ Tecnologías usadas

| Capa | Tecnología |
|---|---|
| 🎨 Frontend | HTML5, CSS3, JavaScript (Vanilla) |
| 🅰️ Tipografías | Caveat + Quicksand (Google Fonts) |
| 🗄️ Base de datos | **Cloud Firestore** (Firebase) |
| 🔐 Autenticación | Firebase Auth anónimo |
| 📧 Correos | Gmail (`MailApp` vía Google Apps Script) |
| 📲 Instalabilidad | Web App Manifest + Service Worker (PWA) |
| 🌐 Hosting | GitHub Pages (o cualquier hosting de archivos estáticos) |

---

## 🚀 Instalación paso a paso

### 1️⃣ Crear el proyecto de Firebase

1. Ve a [https://console.firebase.google.com](https://console.firebase.google.com)
2. **Agregar proyecto** → nómbralo, por ejemplo, `deseos-de-bartolita`
3. Dentro del proyecto: ⚙️ **Configuración del proyecto → General → Tus apps**
4. Crea una app web (ícono `</>`) y copia el objeto `firebaseConfig`

### 2️⃣ Activar Firestore y Authentication

1. En el menú lateral: **Firestore Database → Crear base de datos** (modo producción)
2. En el menú lateral: **Authentication → Sign-in method → Anónimo → Habilitar**
   (así la app puede leer/escribir sin pedirles usuario y contraseña a ustedes dos)

### 3️⃣ Configurar `firebase-config.js`

Pega tu `firebaseConfig` en el archivo:

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.firebasestorage.app",
  messagingSenderId: "...",
  appId: "...",
};
```

### 4️⃣ Publicar las reglas de seguridad

En **Firestore Database → Reglas**, pega el contenido de `firestore.rules` y publica.

### 5️⃣ Subir los archivos a tu hosting

Sube `index.html`, `firebase-config.js`, `firebase-logic.js`, `manifest.json`,
`service-worker.js` y los íconos (`icon-192.png`, `icon-512.png`, `icon-512-maskable.png`)
al mismo directorio, por ejemplo un repositorio de GitHub llamado `BARTOLITA-SITES` con
**GitHub Pages** activado. La web quedará en:

```text
https://sitioweb001.github.io/BARTOLITA-SITES/
```

### 6️⃣ Inicializar la base de datos

1. Abre la web ya publicada.
2. Abre la consola del navegador (`F12` → pestaña **Console**).
3. Pega **todo** el contenido de `inicializar-bd.js` y presiona `Enter`.
4. Espera el mensaje `✅ Base de datos lista`.
5. Recarga la página normalmente.

Es seguro ejecutarlo más de una vez: no duplica los módulos si ya existen.

### 7️⃣ Configurar el envío de correos (opcional pero recomendado)

1. Ve a [https://script.google.com](https://script.google.com) → **Proyecto nuevo**
2. Pega el contenido de `correo.gs`
3. Cambia `CLAVE_SECRETA` por una clave que solo ustedes conozcan
4. **Implementar → Nueva implementación → Aplicación web**
   - Ejecutar como: **Yo**
   - Quién puede acceder: **Cualquier usuario**
5. Autoriza los permisos de envío de correo
6. Copia la URL (`.../exec`) y pégala, junto con la clave, en `firebase-logic.js`:

```javascript
const MAIL_API_URL = "https://script.google.com/macros/s/TU_ID/exec";
const MAIL_API_CLAVE = "TU_CLAVE_SECRETA";
```

---

## 🗄️ Base de datos (Cloud Firestore)

A diferencia de la versión anterior (Google Sheets), los datos ahora son **colecciones de documentos** en Firestore. No hay filas ni columnas fijas: cada documento solo trae los campos que necesita.

### Colección `modulos`

```json
{
  "nombre": "Lugares que queremos visitar",
  "descripcion": "Sitios que soñamos conocer juntos",
  "icono": "🌸",
  "orden": 1,
  "fechaCreacion": "2026-01-01T00:00:00.000Z",
  "activo": true
}
```

### Colección `deseos`

```json
{
  "moduloId": "abc123",
  "orden": 1,
  "nombre": "Ir a la playa",
  "url": "https://...",
  "prioridad": "🔴 Urgente",
  "descripcion": "Un día soleado los dos solos",
  "cumplido": false,
  "fechaCreacion": "2026-01-01T00:00:00.000Z",
  "fechaActualizacion": "2026-01-01T00:00:00.000Z",
  "activo": true
}
```

> 🆕 Desde esta versión, cada deseo tiene su propio campo `cumplido`, independiente de si está o no vinculado a un evento del calendario. Así se puede marcar un deseo como logrado aunque nunca se le haya puesto fecha.

### Colección `eventos`

```json
{
  "titulo": "Cena juntos",
  "fecha": "2026-09-21",
  "horaInicio": "19:00",
  "horaFin": "21:00",
  "descripcion": "Una noche especial",
  "lugar": "San Miguel",
  "tipo": "💕 Cita",
  "todoElDia": false,
  "moduloId": "abc123",
  "deseoId": "def456",
  "cumplido": false,
  "fechaCreacion": "2026-01-01T00:00:00.000Z",
  "fechaActualizacion": "2026-01-01T00:00:00.000Z",
  "activo": true,
  "notificadoAntes": false,
  "notificadoDia": false
}
```

### Colección `responsables`

```json
{
  "email": "correo@gmail.com",
  "nombre": "Emerson",
  "notif_nueva_fecha": true,
  "notif_nuevo_deseo": true,
  "notif_nuevo_modulo": false,
  "notif_dia_antes": true,
  "notif_dia_evento": true,
  "activo": true,
  "fechaCreacion": "2026-01-01T00:00:00.000Z"
}
```

### Colección `notificaciones`

Guarda un registro (log) de cada intento de envío de correo, con su tipo, destinatario y estado.

### Colección `config`

Guarda datos generales de la app, como la versión de la base de datos migrada.

> 💾 **Respaldos:** en Firebase Console → Firestore Database puedes exportar tus colecciones, o usar `gcloud firestore export` si quieres automatizar copias de seguridad.

---

## 💜 Módulo de deseos

```text
┌──────────────────────────────────────────────┐
│  🌸 Lugares que queremos visitar             │
│                                              │
│  01. Ir a la playa                           │
│      🔗 Abrir  👁 Vista previa  📋 Copiar    │
│      🔴 URGENTE                              │
│                                              │
│  02. Visitar un restaurante                  │
│      🔗 Abrir  👁 Vista previa  📋 Copiar    │
│      🟡 IMPORTANTE                           │
│                                              │
│  ＋ Añadir otro deseo                        │
└──────────────────────────────────────────────┘
```

### Prioridades

| Nivel | Icono | Color |
|---|---|---|
| Urgente | 🔴 | Rojo suave |
| Importante | 🟡 | Amarillo suave |
| Puede esperar | 🟢 | Verde suave |
| Sin prioridad | ⚪ | Gris suave |

---

## 📅 Módulo de calendario

```text
┌─────────────────────────────────────────────────┐
│                   21                            │
│              SEPTIEMBRE                         │
│                2026                             │
│               Lunes                             │
│                                                 │
│      ‹     Septiembre 2026     ›                │
│                                                 │
│  L    M    X    J    V    S    D                │
│  1    2    3    4    5    6    7                │
│  8    9   10   11   12   13   14                │
│ 15   16   17   18  💕19   20   21                │
│ 22   23  🍰24   25   26   27   28                │
│                                                 │
│           [💜 Agendar momento]                  │
└─────────────────────────────────────────────────┘
```

El calendario ya no solo marca los días con un punto: **cada casilla muestra el emoji del tipo de evento y un fragmento del título** (por ejemplo `💕 Cena juntos`), para que se entienda de un vistazo qué hay agendado ese día sin tener que abrirlo.

| Elemento | Significado |
|---|---|
| 🔵 Fondo morado degradado | Día de **hoy** |
| 💕🍰🎬… | Emoji del **tipo de evento** de ese día |
| texto pequeño bajo el emoji | Título corto del evento (o "+N" si hay varios) |
| 🌸 Fondo rosa | **Fin de semana** |
| 🟣 Fondo morado fuerte | Día **seleccionado** |
| ✓ Check | Todos los eventos de ese día están **cumplidos** |

---

## 👑 Vista de Bartolo

```text
┌─────────────────────────────────────────────────┐
│              👑 Vista de Bartolo                │
│  Vista privada para ti. Aquí ves todas las      │
│  fechas, los deseos pendientes y marcas lo      │
│  cumplido.                                      │
├─────────────────────────────────────────────────┤
│  🔔 2 fechas se acercan en los próximos 7 días  │
│  💕 Cena juntos — Hoy · 19:00                    │
│  🍰 Postres — 3 Oct                              │
├─────────────────────────────────────────────────┤
│  💜 Eventos  ✔️ Cumplidos  ⏳ Pendientes  🔴   │
│     12          4            8            2      │
├─────────────────────────────────────────────────┤
│  [Todos] [Pendientes] [Cumplidos] [Hoy]         │
├─────────────────────────────────────────────────┤
│  📅 Eventos                                      │
│  📅 21 SEP  💕 Cena juntos  ⏳ Próximo          │
│  🕐 19:00 — 21:00 · 📍 San Miguel                │
│  [✓ Cumplido]  [✏️ Editar]                     │
├─────────────────────────────────────────────────┤
│  🌸 Deseos pendientes (por módulo)               │
│  🌸 Lugares que queremos visitar                 │
│    Ir a la playa           🔴 Urgente     [✓]   │
│  🍰 Cosas que queremos comer                     │
│    Probar el nuevo café    🟡 Importante  [✓]   │
└─────────────────────────────────────────────────┘
```

Esta vista ahora tiene **tres bloques**:

1. 🔔 **Aviso de fechas próximas**: un banner que resume automáticamente los eventos pendientes de los próximos 7 días.
2. 📅 **Eventos**: la lista de fechas del calendario, igual que antes, con filtros Todos / Pendientes / Cumplidos / Hoy.
3. 🌸 **Deseos pendientes por módulo**: todos los deseos guardados, agrupados por su módulo, **tengan o no una fecha asignada**, cada uno con su propio botón para marcarlo como cumplido.

---

## 🔔 Notificaciones y correos

### Tipos de correo

| Icono | Evento | Destinatarios |
|---|---|---|
| 📅 | Nueva fecha agendada | Suscritos a `notif_nueva_fecha` |
| 💜 | Nuevo deseo añadido | Suscritos a `notif_nuevo_deseo` |
| 🌸 | Nuevo módulo creado | Suscritos a `notif_nuevo_modulo` |
| ⏰ | Aviso el día antes | Suscritos a `notif_dia_antes` |
| 💜 | Aviso el mismo día | Suscritos a `notif_dia_evento` |
| 📨 | Correo de prueba | Manual |

`firebase-logic.js` arma el HTML del correo y lo manda como un `fetch()` a la URL de `correo.gs` (`MAIL_API_URL`), que es quien realmente llama a `MailApp.sendEmail`. Cada intento queda registrado en la colección `notificaciones` de Firestore.

### Plantilla de correo

```text
┌─────────────────────────────────────────────────┐
│         💜                                      │
│      Deseos de Bartolita                        │
│   Un lugar para nuestros momentos               │
├─────────────────────────────────────────────────┤
│                                                 │
│   💜 Nueva fecha agendada                       │
│   Se agendó un momento especial                 │
│                                                 │
│   ┌───────────────────────────────────┐         │
│   │ Cena juntos                       │         │
│   │ 📅 2026-09-21                     │         │
│   │ 🕐 19:00 — 21:00                  │         │
│   │ 📍 San Miguel                     │         │
│   │ 💬 "Una noche especial"           │         │
│   │ [💕 Cita]                         │         │
│   └───────────────────────────────────┘         │
│                                                 │
│   [💜 Abrir la web]                             │
│                                                 │
│   Enviado automáticamente 💜                    │
└─────────────────────────────────────────────────┘
```

> ⚠️ Los recordatorios diarios automáticos (revisar "¿hay evento mañana/hoy?" a las 8 AM) dependían de un **trigger de Apps Script** ligado a la hoja de cálculo. Como Apps Script ya no aloja los datos, ese trigger debe reimplementarse aparte (por ejemplo con una **Cloud Function programada** que lea Firestore y llame a `correo.gs`, o volviendo a instalar un trigger en Apps Script que primero consulte Firestore). Revisa el menú de tu proyecto de Apps Script para instalarlo si lo necesitas.

---

## 📲 Instalable como app (PWA)

Gracias a `manifest.json` y `service-worker.js`, "Deseos de Bartolita" se puede **instalar** en el celular o la computadora como si fuera una app nativa:

- 🎨 Ícono propio (`icon-192.png`, `icon-512.png`, `icon-512-maskable.png`) y colores de marca (`#6B4C8F` / `#FBF8FE`).
- 📴 El **cascarón** (HTML, manifest, íconos) se cachea para que la app abra aunque no haya conexión.
- 🔄 Los **datos siempre se piden a Firestore en tiempo real**: nunca se cachean, para ver siempre la información más reciente.
- 📱 Al abrir la web desde el navegador, aparecerá un banner de "Instala Deseos de Bartolita".

---

## 🧭 Estructura del menú

```text
☰ Menú hamburguesa
│
├── PRINCIPAL
│   ├── 💜 Lista de deseos
│   └── 📅 Nuestro calendario
│
├── ESPECIAL
│   ├── 👑 Vista de Bartolo
│   └── 🔔 Notificaciones
│
└── ACCIONES RÁPIDAS
    ├── ＋ Nuevo módulo
    └── 📅 Agendar momento
```

---

## 🖼️ Ejemplos visuales

### Tarjeta de deseo

```text
┌──────────────────────────────────────────────┐
│  01. Ir a la playa                            │
│  🔴 URGENTE                                   │
│  "Un día soleado los dos solos"               │
│  [📋 Copiar] [🔗 Abrir] [👁 Vista previa]     │
│  [✏️ Editar] [🗑️]                             │
└──────────────────────────────────────────────┘
```

### Modal de evento

```text
┌──────────────────────────────────────────────┐
│  💜 Nuevo momento                      [×]    │
│                                              │
│  Título: [Cena juntos_______________]        │
│  Fecha:  [2026-09-21___] Tipo: [💕 Cita ▼]   │
│  ☐ Todo el día                                │
│  Hora inicio: [19:00__] Hora fin: [21:00__]  │
│  Lugar: [San Miguel_____________________]    │
│  Descripción: [Una noche especial____]       │
│                                              │
│  [Cancelar]              [Guardar evento 💜] │
└──────────────────────────────────────────────┘
```

---

## 🛠️ API interna (`firebase-logic.js`)

`index.html` sigue llamando a `apiGet(accion)` y `apiPost(payload)` exactamente igual que en la versión de Apps Script — lo único que cambió es que, por dentro, esas funciones ahora hablan directo con el SDK de Firestore en vez de hacer un `fetch()` a una Web App.

### Acciones de lectura (`apiGet`)

| Acción | Descripción |
|---|---|
| `ping` | Comprueba que Firebase responde |
| `obtenerModulos` | Devuelve todos los módulos activos |
| `obtenerDeseos` | Devuelve todos los deseos activos |
| `obtenerEventos` | Devuelve todos los eventos activos |
| `obtenerResponsables` | Devuelve los correos suscritos |
| `obtenerConfig` | Devuelve configuración general |

### Acciones de escritura (`apiPost`)

| Acción | Datos | Descripción |
|---|---|---|
| `crearModulo` | `{nombre, icono, descripcion}` | Crea un módulo |
| `actualizarModulo` | `{id, ...campos}` | Actualiza un módulo |
| `eliminarModulo` | `{id}` | Elimina un módulo (y sus deseos) |
| `crearDeseo` | `{moduloId, nombre, url, prioridad, orden, descripcion}` | Crea un deseo |
| `actualizarDeseo` | `{id, ...campos}` | Actualiza un deseo |
| `eliminarDeseo` | `{id}` | Elimina un deseo |
| `marcarCumplidoDeseo` | `{id, cumplido}` | 🆕 Marca un deseo como cumplido, sin necesidad de un evento |
| `crearEvento` | `{titulo, fecha, horaInicio, horaFin, lugar, tipo, todoElDia, moduloId, deseoId}` | Crea un evento |
| `actualizarEvento` | `{id, ...campos}` | Actualiza un evento |
| `eliminarEvento` | `{id}` | Elimina un evento |
| `marcarCumplido` | `{id, cumplido}` | Marca un **evento** del calendario como cumplido |
| `crearResponsable` | `{email, nombre, ...notif_*}` | Agrega un responsable |
| `actualizarResponsable` | `{id, ...campos}` | Actualiza un responsable |
| `eliminarResponsable` | `{id}` | Elimina un responsable |
| `enviarPruebaResponsable` | `{email}` | Envía correo de prueba (vía `correo.gs`) |

### Ejemplo de respuesta

```json
{
  "ok": true,
  "datos": [
    {
      "id": "abc123",
      "nombre": "Lugares que queremos visitar",
      "icono": "🌸",
      "orden": 1,
      "activo": true
    }
  ]
}
```

---

## 📱 Responsive

| Dispositivo | Ancho | Comportamiento |
|---|---|---|
| 📱 Teléfono | < 640px | Todo vertical, modales de pantalla completa, calendario compacto (sin texto bajo el emoji) |
| 📱 Tablet | 640 – 1024px | Grid adaptativo de 2 columnas |
| 💻 Laptop | 1024 – 1440px | Grid de 3 columnas |
| 🖥️ Escritorio | > 1440px | Grid de 4 columnas |

---

## 🧪 Pruebas

### Probar que Firebase responde

En la consola del navegador, con la web abierta:

```javascript
await db.collection("modulos").get().then(s => console.log(s.size, "módulos"));
```

### Probar el envío de correos

En [https://script.google.com](https://script.google.com), abre el proyecto de `correo.gs` y:

1. Selecciona la función **`pruebaManual`**
2. Cámbiale el correo de destino
3. Clic en ▶️ **Ejecutar**
4. Revisa tu bandeja de entrada

O bien, desde la app: **Notificaciones → agrega un responsable → 📤 Enviar prueba**.

---

## 🔒 Seguridad

- `firestore.rules` exige que exista una sesión (aunque sea anónima) creada por `firebase-config.js` para poder leer o escribir. Esto evita que cualquiera que encuentre tus llaves públicas de Firebase escriba directo en tu base de datos sin pasar por tu propia web.
- Las llaves de `firebaseConfig` (API key, etc.) **son públicas por diseño** en cualquier app de Firebase; lo que realmente protege los datos son las **reglas de Firestore**, no ocultar esas llaves.
- `correo.gs` usa una `CLAVE_SECRETA` compartida entre el script y `firebase-logic.js` para que solo tu propia web pueda pedirle que envíe correos.

---

## ❓ Preguntas frecuentes

<details>
<summary><b>¿Por qué ya no se usa Google Sheets?</b></summary>

Google Sheets funcionaba bien para pocos datos, pero tenía límites de velocidad y de lecturas/escrituras simultáneas. Cloud Firestore permite actualizaciones en tiempo real, reglas de seguridad más finas y escala mejor sin tocar código.
</details>

<details>
<summary><b>¿Por qué sigue existiendo Apps Script (`correo.gs`) si ya no hay Sheets?</b></summary>

Firestore no puede enviar correos por sí solo de forma gratuita. `correo.gs` es un script mínimo que solo usa `MailApp.sendEmail` con tu cuenta de Gmail; ya no lee ni escribe ningún dato.
</details>

<details>
<summary><b>¿Por qué no me llegan los correos?</b></summary>

1. Verifica que el responsable esté **activo**.
2. Revisa que esté suscrito al tipo de correo correcto.
3. Confirma que `MAIL_API_URL` y `MAIL_API_CLAVE` en `firebase-logic.js` coincidan exactamente con los de `correo.gs`.
4. Comprueba la carpeta de spam.
</details>

<details>
<summary><b>¿Cómo cambio el color de un módulo?</b></summary>

Los colores están definidos en el CSS del `index.html` en las variables `:root`. Cambia los valores `--lila-*` y `--rosa-*`.
</details>

<details>
<summary><b>¿Puedo tener más de un Bartolo?</b></summary>

Sí, agrega más correos en **Responsables** y cada uno recibirá sus propios correos.
</details>

<details>
<summary><b>¿Los datos se pierden si borro el HTML?</b></summary>

No. Los datos viven en Cloud Firestore, no en el archivo `index.html`. El HTML solo es la interfaz.
</details>

<details>
<summary><b>¿Cómo hago una copia de seguridad?</b></summary>

Desde Firebase Console → Firestore Database puedes exportar tus colecciones, o usar la herramienta `gcloud firestore export` si quieres automatizarlo.
</details>

---

## 📄 Licencia

```text
MIT License 💜

Copyright (c) 2026 Bartolita

Permiso para usar, copiar, modificar y distribuir este software
con o sin fines de lucro, siempre y cuando se mantenga el aviso
de copyright original.
```

---

## 💌 Créditos

<table>
  <tr>
    <td align="center">💜</td>
    <td>
      <b>Hecho con amor para Bartolita</b><br>
      <i>"Un deseo cumplido es un recuerdo que se queda para siempre."</i>
    </td>
  </tr>
</table>

<p align="center">
  <img alt="hecho con amor" src="https://img.shields.io/badge/hecho%20con-💜-C8A2E0?style=for-the-badge">
  <img alt="para" src="https://img.shields.io/badge/para-Bartolita-9370B8?style=for-the-badge">
</p>

---

<p align="center">
  <a href="#-deseos-de-bartolita">⬆️ Volver al inicio</a>
</p>
