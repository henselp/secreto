import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Configuración con tus credenciales de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAbcedXuzh0U8oIerDn8fftnPzbiKRQ7TQ",
  authDomain: "amigo-secreto-d8f27.firebaseapp.com",
  projectId: "amigo-secreto-d8f27",
  storageBucket: "amigo-secreto-d8f27.firebasestorage.app",
  messagingSenderId: "929264539557",
  databaseURL: "https://amigo-secreto-d8f27-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const RETIRADO = "Alejandro";
const PARTICIPANTES = [
  "Dayana", "Sandra", "Henry", "Kaleth", "Brayan",
  "Lisbeth", "Shara", "Daniela", "Selena", "Ana", "Mariana"
];

let asignacionesGlobales = {};

// Escuchar cambios en la base de datos en tiempo real
const asignacionesRef = ref(db, 'asignaciones');
onValue(asignacionesRef, (snapshot) => {
  const data = snapshot.val() || {};
  asignacionesGlobales = data;
  
  const registradosCount = Object.keys(data).length;
  document.getElementById("contador").textContent = registradosCount;

  cargarParticipantes();

  // Muestra el botón de Henry cuando las 11 personas hayan registrado su respuesta
  if (registradosCount >= PARTICIPANTES.length) {
    document.getElementById("btn-analizar").classList.remove("hidden");
  }
});

// Cargar lista filtrada en el select (solo muestra los que no han respondido)
function cargarParticipantes() {
  const select = document.getElementById("select-dador");
  select.innerHTML = '-- Selecciona tu nombre --';

  PARTICIPANTES.forEach(nombre => {
    if (!asignacionesGlobales[nombre]) {
      const opt = document.createElement("option");
      opt.value = nombre;
      opt.textContent = nombre;
      select.appendChild(opt);
    }
  });
}

// Evento Guardar Registro en Firebase
document.getElementById("btn-guardar").addEventListener("click", () => {
  const dador = document.getElementById("select-dador").value;
  const receptor = document.getElementById("input-receptor").value.trim();

  if (!dador) {
    alert("Por favor selecciona tu nombre en la lista.");
    return;
  }

  if (!receptor) {
    alert("Por favor escribe el nombre de la persona que te tocó.");
    return;
  }

  // Guardar en la base de datos en la nube
  set(ref(db, 'asignaciones/' + dador), receptor)
    .then(() => {
      alert("¡Tus datos han sido guardados con éxito!");
      document.getElementById("pantalla-registro").classList.add("hidden");
      document.getElementById("pantalla-exito").classList.remove("hidden");
    })
    .catch((error) => {
      alert("Error al guardar en la base de datos: " + error.message);
    });
});

// Evento Analizar y Reasignar (Administrador)
document.getElementById("btn-analizar").addEventListener("click", () => {
  let personaY = null;
  let personaX = null;

  // 1. Identificar quién tenía a Alejandro (ignorando mayúsculas y espacios extra)
  for (let dador in asignacionesGlobales) {
    if (asignacionesGlobales[dador].trim().toLowerCase() === RETIRADO.toLowerCase()) {
      personaY = dador;
      break;
    }
  }

  // 2. Identificar a quién nadie mencionó en los registros
  const receptoresGuardados = Object.values(asignacionesGlobales).map(r => r.trim().toLowerCase());
  for (let participante of PARTICIPANTES) {
    if (!receptoresGuardados.includes(participante.trim().toLowerCase())) {
      personaX = participante;
      break;
    }
  }

  if (!personaY || !personaX) {
    alert("Error al analizar los datos. Verifica que los nombres registrados coincidan con la lista.");
    return;
  }

  // Aplicar la reasignación automática en memoria
  asignacionesGlobales[personaY] = personaX;

  // Mostrar el mensaje de resumen del cambio
  document.getElementById("resumen-cambio").innerHTML =
    `**Reasignación Automática:**`;
});
  