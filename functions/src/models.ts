// en functions/src/models.ts

// --- Modelo para el INVENTARIO (Colección 'equipment') ---
export interface Equipment {
  id: string; // CÓDIGO IC (Clave primaria)
  
  identification: {
    name: string; // NOMBRE
    brand: string; // MARCA
    model: string; // MODELO
    serialNumber: string; // SERIE
    assetCode?: string; // CÓDIGO AF (Opcional)
    type: string; // TIPO DE EQUIPO
  };

  status: {
    currentState: 'OPERATIVO' | 'INOPERATIVO' | 'EN_MANTENIMIENTO' | 'OBSERVADO' | 'EN_BAJA' | 'DE_BAJA';
    condition: string; // CONDICIÓN DE INGRESO
    systemStatus: string; // ESTADO DEL SISTEMA
  };

  location: {
    currentUPSS: string; // AREA CLINICA (UPSS)
    areaReference: string; // REFERENCIA DE ÁREA
    level: string; // NIVEL (Piso)
    costCenterName: string; // NOMBRE DE CENTRO DE COSTO
    costCenterCode: string; // CENTRO DE COSTO
    sede: string; // SEDE
  };
  
  acquisition: {
    ownership: 'PROPIO' | 'TERCERO' | 'COMODATO'; // PERTENENCIA
    modality: string; // MODALIDAD DE INGRESO
    provider: string; // PROVEEDOR
    purchaseOrder?: string; // N° DE OC
    purchaseDate?: Date; // FECHA DE COMPRA
    price?: {
      amount: number; // PRECIO COMPRA
      currency: 'USD' | 'PEN'; // TIPO DE MONEDA
      exchangeRate?: number; // TIPO DE CAMBIO
    };
    sanitaryRegistry?: string; // REGISTRO SANITARIO
  };

  lifecycle: {
    fabricationYear: number; // AÑO FABRICACIÓN
    receptionDate: Date; // FECHA DE RECEPCION
    warrantyStartDate: Date; // FECHA DE INICIO DE LA GARANTÍA
    warrantyDurationYears: number; // GARANTÍA (años)
    usefulLifeYears: number; // VIDA ÚTIL (años)
    endOfLifeDate?: Date; // END OF LIFE
    endOfSupportDate?: Date; // END OF SUPPORT
    disposalDate?: Date; // FECHA DE BAJA
  };

  risk: {
    criticity: 'ALTO' | 'MEDIO' | 'BAJO'; // CRITICIDAD
    criticityIC: string; // CRITICIDAD IC
  };
  
  // Los datos de Mantenimiento Preventivo/Correctivo irán en la colección 'workOrders'
  // y se vincularán a este equipo por su 'id'.
  // Las columnas P1, E1, P_MP_Feb, etc., se generarán dinámicamente con la lógica de negocio.
}


// --- Modelo para las OPERACIONES (Colección 'workOrders') ---
export interface WorkOrder {
  id?: string; // El ID autogenerado por Firestore
  equipmentId: string; // CÓDIGO IC del equipo relacionado

  type: 'CORRECTIVO' | 'PREVENTIVO' | 'CALIBRACION' | 'INSPECCION' | 'DIAGNOSTICO';
  status: 'ABIERTO' | 'ASIGNADO' | 'EN_PROCESO' | 'ESPERA_REPUESTO' | 'CERRADO' | 'CANCELADO';
  
  creation: {
    reportedAt: Date; // HORA DEL REPORTE
    reportedBy: string; // QUIEN REPORTA
  };

  assignment?: {
    assignedTo: string; // NOMBRE DE TECNICO ASIGNADO
    assignedAt: Date;
  };
  
  execution?: {
    startedAt: Date;
    diagnosedBy: 'PROPIO' | 'TERCERO';
    repairedBy: 'PROPIO' | 'TERCERO';
    failureCause: string; // CAUSA DE FALLA (A NIVEL ING)
    repairMethodology: string; // METODOLOGIA DE REPARACIÓN
    sparePartsUsed?: { name: string; code: string; quantity: number }[];
  };

  closure?: {
    closedAt: Date;
    finalEquipmentStatus: Equipment['status']['currentState']; // El estado final del equipo
    reportUrl?: string; // Link al PDF del informe en Cloud Storage
    userSatisfaction?: number; // Calificación de 1 a 5
    // Tiempos calculados al cerrar
    resolutionTimeSeconds: number; // TIEMPO DE RESOLUCIÓN
    downTimeSeconds: number; // TIEMPO DE INOPERATIVIDAD
  };
}