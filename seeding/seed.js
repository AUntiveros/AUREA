// seeding/seed.js
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// --- CONFIGURACIÓN ---
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
admin.initializeApp({
  projectId: 'aurea-478103' // Cambia si usas otro proyecto
});
const db = admin.firestore();

// =================================================================================
// FUNCIÓN AUXILIAR PARA CARGAR COLECCIÓN DESDE JSON
// =================================================================================
async function seedCollection(collectionName, jsonFileName, validateRefs = false) {
  const dataPath = path.join(__dirname, jsonFileName);

  if (!fs.existsSync(dataPath)) {
    console.log(`Archivo no encontrado: ${jsonFileName}. Saltando '${collectionName}'.`);
    return;
  }

  console.log(`Borrando colección '${collectionName}'...`);
  await deleteCollection(collectionName);

  console.log(`Leyendo ${jsonFileName}...`);
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  if (!Array.isArray(data) || data.length === 0) {
    console.log(`Archivo vacío o inválido: ${jsonFileName}`);
    return;
  }

  console.log(`Cargando ${data.length} documentos en '${collectionName}'...`);

  const batch = db.batch();
  let validCount = 0;

  // Opcional: Validar referencias si es workorders
  let equipmentIds = new Set();
  if (validateRefs && collectionName === 'workorders') {
    const eqSnap = await db.collection('equipment').get();
    equipmentIds = new Set(eqSnap.docs.map(doc => doc.id));
  }

  data.forEach((item, index) => {
    const docId = item.id || `auto-${collectionName}-${index}`;
    
    if (!item.id) {
      console.warn(`Item sin 'id', se asigna: ${docId}`, item);
    }

    // Validar equipmentId en workorders
    if (validateRefs && collectionName === 'workorders' && item.equipmentId) {
      if (!equipmentIds.has(item.equipmentId)) {
        console.warn(`equipmentId inválido: ${item.equipmentId} (WO: ${docId})`);
        return;
      }
    }

    const docRef = db.collection(collectionName).doc(docId);
    batch.set(docRef, item);
    validCount++;
  });

  await batch.commit();
  console.log(`¡'${collectionName}' cargada! (${validCount} documentos)`);
}

// =================================================================================
// BORRAR COLECCIÓN (recursiva, segura)
// =================================================================================
async function deleteCollection(collectionPath) {
  const collectionRef = db.collection(collectionPath);
  const snapshot = await collectionRef.limit(500).get();

  if (snapshot.empty) return;

  const batch = db.batch();
  snapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();

  // Recursivo si hay más de 500
  if (snapshot.size === 500) {
    return deleteCollection(collectionPath);
  }
}

// =================================================================================
// MAIN
// =================================================================================
async function seedDatabase() {
  console.log('=== INICIANDO SEED DE FIRESTORE ===\n');

  try {
    // 1. Cargar equipos primero
    await seedCollection('equipment', 'equipment.example.json');

    // 2. Cargar workorders (con validación de equipmentId)
    await seedCollection('workorders', 'workorders.example.json', true);

    console.log('\n¡SEED COMPLETADO CON ÉXITO!');
    console.log('   Colecciones: equipment, workorders');
    console.log('   Usa el frontend para verificar');
  } catch (error) {
    console.error('\nERROR DURANTE EL SEED:', error);
    process.exit(1);
  }
}

// --- EJECUCIÓN DEL SCRIPT ---
seedDatabase().catch(error => {
  console.error('Ocurrió un error grave durante el seeding:', error);
  process.exit(1);
});