// functions/src/index.ts

import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { Equipment, WorkOrder } from "./models";

admin.initializeApp();
const db = admin.firestore();

// ============================================================
// FUNCIONES CRUD PARA INVENTARIO (EQUIPMENT)
// ============================================================

export const createEquipment = onCall<Equipment>(async (request) => {
  // Lógica simple: Guardamos todo el objeto Equipment tal cual llega
  logger.info("Creando nuevo equipo:", request.data.id);
  
  // Validar que tenga ID
  if (!request.data.id) {
    throw new HttpsError("invalid-argument", "El equipo debe tener un ID único.");
  }

  // Añadir metadatos de creación si no vienen
  const equipment = request.data;
  if (!equipment.metadata) {
      equipment.metadata = {
          creadoPor: request.auth?.uid || 'SYSTEM',
          creadoEn: new Date().toISOString()
      };
  }

  await db.collection("equipment").doc(equipment.id).set(equipment);
  return { status: "success", equipmentId: equipment.id };
});

export const getEquipment = onCall<{ equipmentId: string }>(async (request) => {
  const equipmentId = request.data.equipmentId;
  const doc = await db.collection("equipment").doc(equipmentId).get();
  if (!doc.exists) {
    throw new HttpsError("not-found", "Equipo no encontrado.");
  }
  return doc.data() as Equipment;
});

export const updateEquipment = onCall<{ equipmentId: string, updates: Partial<Equipment> }>(async (request) => {
  const { equipmentId, updates } = request.data;
  // Actualizar metadatos
  if (updates.metadata) {
      updates.metadata.actualizadoPor = request.auth?.uid || 'SYSTEM';
      updates.metadata.actualizadoEn = new Date().toISOString();
  }
  await db.collection("equipment").doc(equipmentId).update(updates);
  return { status: "success", equipmentId };
});

export const listEquipment = onCall(async (request) => {
  // Limitamos a 50 para no saturar en la demo
  const snapshot = await db.collection("equipment").limit(50).get();
  return snapshot.docs.map(doc => doc.data() as Equipment);
});


// ============================================================
// FUNCIONES CRUD PARA OPERACIONES (WORK ORDERS)
// ============================================================

// Interfaz simplificada para lo que envía el frontend al crear un incidente
interface CreateIncidentData {
  equipmentId: string;
  description: string;
  areaIncidente: string;
  reportedByName: string; // El nombre de la enfermera/usuario
  audioTranscription?: string; // Opcional
}

export const createWorkOrder = onCall<CreateIncidentData>(async (request) => {
  // 1. Validación de Autenticación
  // Para la demo, permitimos reportar sin auth si es desde un QR público, 
  // pero idealmente requerimos auth.
  const uid = request.auth?.uid || "anonymous";
  
  const input = request.data;

  // 2. Construcción del Objeto WorkOrder Completo
  const now = new Date().toISOString();

  const newWorkOrder: WorkOrder = {
    // Relación
    equipmentId: input.equipmentId,
    
    // Estado Inicial
    type: 'CORRECTIVO',
    status: 'ABIERTO',

    // Detalles de Creación
    creation: {
      reportedAt: now,
      reportedBy: {
        userId: uid,
        name: input.reportedByName,
        role: 'ASISTENCIAL' // Por defecto
      },
      areaIncidente: input.areaIncidente,
      description: input.description,
      audioTranscription: input.audioTranscription || ""
    },

    // Metadatos
    metadata: {
      createdAt: now,
      createdBy: uid
    }
  };

  // 3. Guardar en Firestore
  const docRef = await db.collection("workOrders").add(newWorkOrder);
  logger.info(`Nuevo Work Order creado con ID: ${docRef.id}`);
  
  // 4. Retornar ID
  return { status: "success", workOrderId: docRef.id };
});


export const getOpenWorkOrders = onCall(async (request) => {
  // Esta función alimenta el Dashboard del Jefe de MTTO
  const snapshot = await db.collection("workOrders")
                           .where("status", "==", "ABIERTO")
                           .orderBy("metadata.createdAt", "desc")
                           .get();
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as WorkOrder);
});


export const updateWorkOrder = onCall<{ workOrderId: string, updates: Partial<WorkOrder> }>(async (request) => {
  const { workOrderId, updates } = request.data;
  
  // Actualizar metadatos
  if (!updates.metadata) updates.metadata = { createdAt: "", createdBy: "" }; // Hack para TS
  updates.metadata.updatedAt = new Date().toISOString();
  updates.metadata.updatedBy = request.auth?.uid || 'SYSTEM';

  await db.collection("workOrders").doc(workOrderId).update(updates);
  return { status: "success", workOrderId };
});