// en public/src/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

// Configuración de tu proyecto de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAkJn_5po1Jlnu5_Wvk-bfIDiMWZQX6zW8",
  authDomain: "aurea-478103.firebaseapp.com",
  projectId: "aurea-478103",
  storageBucket: "aurea-478103.firebasestorage.app",
  messagingSenderId: "39175054307",
  appId: "1:39175054307:web:2f5f47ae09453b364976d6",
  measurementId: "G-ZB5X1HNPSQ"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const functions = getFunctions(app);

// Conecta a los emuladores si estamos en entorno de desarrollo
if (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost") {
  console.log("Conectando a los emuladores de Firebase...");
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectFunctionsEmulator(functions, '127.0.0.1', 5001);
}

export { db, functions };