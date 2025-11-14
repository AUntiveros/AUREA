// en seeding/verify-data.js

const admin = require('firebase-admin');

// Le decimos al script que hable con el EMULADOR
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

// Inicializa la app de Firebase Admin
admin.initializeApp({
  projectId: 'aurea-478103' // Asegúrate de que este es el ID de tu proyecto
});

const db = admin.firestore();

async function verifyData() {
  console.log("Intentando conectar con el emulador de Firestore...");
  
  const equipmentRef = db.collection('equipment');
  const snapshot = await equipmentRef.get();

  if (snapshot.empty) {
    console.log('--------------------------------------------------');
    console.log('RESULTADO: No se encontraron documentos en la colección "equipment".');
    console.log('Esto puede significar que el script seed.js no se ha ejecutado todavía.');
    console.log('--------------------------------------------------');
    return;
  }

  console.log('--------------------------------------------------');
  console.log('¡ÉXITO! Se encontraron los siguientes equipos en la base de datos:');
  snapshot.forEach(doc => {
    // Usamos doc.data().identification.nombre si existe, si no, doc.data().nombre
    const nombre = doc.data().identification ? doc.data().identification.nombre : doc.data().nombre;
    console.log(`- ID: ${doc.id}, Nombre: ${nombre}`);
  });
  console.log('--------------------------------------------------');
  console.log('Esto confirma que tus datos existen. El problema de la UI en blanco es solo visual.');
}

verifyData().catch(error => {
  console.error('Ocurrió un error al verificar los datos:', error);
});