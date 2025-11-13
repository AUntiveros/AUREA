// en functions/src/index.ts

// Usamos la sintaxis de importación moderna de la v2
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { WorkOrder } from "./models"; // Tu modelo sigue siendo el mismo

// Inicializa la conexión con los servicios de Firebase
admin.initializeApp();
const db = admin.firestore();

// Definimos una interfaz para los datos que esperamos recibir del frontend
interface CreateIncidentData {
  equipmentId: string;
  description: string;
}

/**
 * Cloud Function para crear un nuevo incidente (Work Order).
 * Esta es la sintaxis moderna para las funciones 'onCall' (v2).
 */
export const createIncident = onCall<CreateIncidentData>((request) => {
  // 1. Logging y Autenticación
  logger.info("Recibido nuevo incidente:", request.data);

  // En la v2, la autenticación se verifica así:
  if (!request.auth) {
    logger.warn("Llamada a createIncident por un usuario no autenticado.");
    // Para forzar la autenticación, lanzamos el error así:
    throw new HttpsError("unauthenticated", "El usuario debe estar autenticado.");
  }
  const uid = request.auth.uid;
  
  // 2. Validación de los datos recibidos
  // ¡No se necesita aserción de tipo! La v2 lo maneja por nosotros.
  // TypeScript ya sabe que `request.data` es del tipo `CreateIncidentData`.
  if (!request.data.equipmentId || !request.data.description) {
    throw new HttpsError(
      "invalid-argument",
      "La función debe ser llamada con 'equipmentId' y 'description'."
    );
  }
  
  // 3. Crear el objeto del nuevo Work Order
  const newWorkOrder: Omit<WorkOrder, 'id'> = {
    equipmentId: request.data.equipmentId,
    type: 'CORRECTIVO',
    status: "ABIERTO",
    creation: {
      reportedAt: new Date(),
      reportedBy: uid, // Ahora tenemos la certeza de que el UID existe
    },
  };

  // 4. Guardar el nuevo ticket en la base de datos
  // Usamos un 'return' directo de la promesa de Firestore
  return db.collection("workOrders").add(newWorkOrder)
    .then((docRef) => {
      logger.info(`Nuevo Work Order creado con ID: ${docRef.id}`);
      return { status: "success", workOrderId: docRef.id };
    })
    .catch((error) => {
      logger.error("Error al crear el Work Order:", error);
      throw new HttpsError(
        "internal",
        "No se pudo crear el Work Order."
      );
    });
});