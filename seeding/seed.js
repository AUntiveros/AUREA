// en seeding/seed.js

// Importamos las herramientas de Firebase Admin
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// --- CONFIGURACIÓN ---
// ¡IMPORTANTE! Esto le dice al script que hable con el EMULADOR.
// Si alguna vez quieres llenar la base de datos de producción,
// deberás comentar esta línea.
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

// Ruta a tu archivo JSON de datos
const dataPath = path.join(__dirname, 'equipment.example.json');
const collectionName = 'equipment';

// Inicializa la app de Firebase Admin
// No necesita credenciales porque estamos hablando con el emulador
admin.initializeApp({
  projectId: 'aurea-478103' // Usa el ID de tu proyecto
});

const db = admin.firestore();

// --- FUNCIÓN PRINCIPAL ---
async function seedDatabase() {
  console.log(`Borrando la colección '${collectionName}' existente...`);
  await deleteCollection(collectionName);

  console.log(`Leyendo datos desde ${dataPath}...`);
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  console.log(`Iniciando la carga de ${data.length} documentos en '${collectionName}'...`);

  // Usamos un Batch para subir todos los documentos a la vez (más eficiente)
  const batch = db.batch();
  data.forEach(item => {
    // Usamos el 'id' del JSON como el ID del documento en Firestore
    const docRef = db.collection(collectionName).doc(item.id);
    batch.set(docRef, item);
  });

  await batch.commit();

  console.log('¡Carga de datos completada exitosamente!');
}


// --- FUNCIÓN AUXILIAR PARA BORRAR LA COLECCIÓN ---
// Esto asegura que cada vez que corras el script, empieces con datos limpios.
async function deleteCollection(collectionPath) {
  const collectionRef = db.collection(collectionPath);
  const snapshot = await collectionRef.limit(500).get();

  if (snapshot.size === 0) {
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  
  // Llama recursivamente para borrar más documentos si hay
  return deleteCollection(collectionPath);
}


// Ejecuta la función principal y maneja errores
seedDatabase().catch(error => {
  console.error('Ocurrió un error durante el seeding:', error);
  process.exit(1);
});