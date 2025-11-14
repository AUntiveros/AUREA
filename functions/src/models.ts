// functions/src/models.ts

// ============================================================
// MODELO DE INVENTARIO (EQUIPMENT)
// ============================================================
export interface Equipment {
  // 1. IDENTIFICACIÓN Y CLASIFICACIÓN
  id: string;                  // ID ÚNICO DEL INVENTARIO (clave primaria)
  codigoIC: string;            // CÓDIGO IC
  codigoAF?: string;           // CÓDIGO AF (opcional)
  lote?: string;               // NÚMERO DE LOTE

  nombre: string;              // Nombre comercial del dispositivo
  descripcion?: string;

  tipoEquipo: string;          // Ej: Imagenología, Soporte Vital, Laboratorio
  tipoArticulo?: string;       // Ej: Equipo, Accesorio, Refacción

  clasificacionNomenclatura?: {
    tipo: 'GMDN' | 'UMDNS' | 'OTRO';
    code: string;
    term: string;
  };

  modalidadIngreso: string;    // Compra, Donación, Leasing, Comodato
  condicionIngreso: string;    // Nuevo, Usado, Reparado, Reacondicionado

  pertenencia: 'PROPIO' | 'DONACION' | 'COMODATO' | 'LEASING';
  propietario?: string;        // Nombre si aplica

  criticidad: 'ALTO' | 'MEDIO' | 'BAJO';
  criticidadIC?: string;       // Criticidad según IC

  clasificacionRiesgo?: string; // Riesgo OMS/ISO (A/B/C o I/II/III)

  // 2. DATOS TÉCNICOS DEL EQUIPO
  marca: string;
  modelo: string;
  numeroSerie?: string;
  anoFabricacion?: number;

  softwareVersion?: string;
  firmwareVersion?: string;

  alimentacionElectrica?: {
    voltaje?: string;
    frecuencia?: string;
    consumo?: string;
    tipoEnchufe?: string;
  };

  requisitosInstalacion?: {
    gas?: boolean;
    vacio?: boolean;
    red?: boolean;
    ups?: boolean;
    otros?: string[];
  };

  requisitosAmbientales?: {
    temperatura?: string;
    humedad?: string;
    otros?: string[];
  };

  accesorios?: {
    name: string;
    quantity: number;
  }[];

  fungibles?: {
    name: string;
    code?: string;
  }[];

  refacciones?: {
    name: string;
    code?: string;
    quantity: number;
  }[];

  // 3. LOCALIZACIÓN Y ASIGNACIÓN
  localizacion: {
    pabellon?: string;
    piso?: string;
    areaClinica: string;
    referenciaArea?: string;

    centroCostoNombre: string;
    centroCostoCodigo: string;

    departamentoPropietario?: string;
    responsableArea?: string;

    sede: string;
    red?: string; // Si el hospital pertenece a una red
  };

  // 4. ESTADO FUNCIONAL Y OPERATIVO
  estadoSistema: 
    'OPERATIVO' | 
    'INOPERATIVO' | 
    'EN_MANTENIMIENTO' | 
    'STANDBY' | 
    'OBSOLETO' |
    'EN_BAJA' |
    'BAJA';

  estadoOperativo?: 
    'DISPONIBLE' | 
    'EN_USO' | 
    'EN_REPARACION' |
    'RETIRADO' |
    'FUERA_DE_SERVICIO';

  nivelTecnico?: 'I' | 'II' | 'III';

  endOfLife?: string;
  endOfSupport?: string;

  // 5. CICLO DE VIDA Y GARANTÍA
  cicloVida: {
    vidaUtilAnos?: number;
    usoAnos?: number;
    vidaUtilConsumida?: number; // %

    fechaRecepcion?: string;
    fechaInstalacion?: string;
    fechaAceptacion?: string;
    resultadoAceptacion?: string;

    enGarantia?: boolean;
    garantiaAnos?: number;
    garantiaInicio?: string;
    garantiaFin?: string;
  };

  // 6. INFORMACIÓN DE COMPRA
  compra?: {
    proveedor?: string;

    moneda?: 'USD' | 'PEN';
    precioCompra?: number; // USD
    precioCompraLocal?: number; // PEN sin impuestos
    tipoCambio?: number;

    fechaCompra?: string;
    numeroOC?: string;

    registroSanitario?: string;
    estadoRegistroSanitario?: 'ACTIVO' | 'VENCIDO' | 'EN_RENOVACION';
  };

  // 7. INDICADORES LIGEROS (NO HISTORIALES)
  mantenimiento?: {
    planMP?: string;           // Nombre del plan MP (si existe)
    planCM?: string;           // Nombre del plan CM
    requiereCalibracion?: boolean;
    fechaUltimaCalibracion?: string;
    fechaProximaCalibracion?: string;
    resultadoUltimaCalibracion?: string;
  };

  // 8. HISTORIAL Y BAJA (NO DETALLADO)
  historial?: {
    recalls?: string[];
    incidentes?: string[];
  };

  baja?: {
    fechaBaja?: string;
    motivo?: string;
  };

  comentarios?: string;

  // 9. METADATOS
  metadata: {
    creadoPor: string;
    creadoEn: string;
    actualizadoPor?: string;
    actualizadoEn?: string;
  };
}

// ============================================================
// MODELO DE ORDEN DE TRABAJO (WORK ORDER)
// ============================================================
export interface WorkOrder {
  id?: string;                    // ID autogenerado (WO-xxxxx si deseas formatearlo)
  equipmentId: string;            // Relación con inventario (ID IC)

  // TIPO Y ESTADO DEL TICKET
  type: 'CORRECTIVO' | 'PREVENTIVO' | 'CALIBRACION' | 'INSPECCION' | 'DIAGNOSTICO';
  status: 
    'ABIERTO' | 
    'ASIGNADO' | 
    'EN_PROCESO' | 
    'ESPERA_REPUESTO' | 
    'CERRADO' | 
    'CANCELADO';

  // INFORMACIÓN DE CREACIÓN DEL INCIDENTE
  creation: {
    reportedAt: string;            // ISO (fecha y hora exacta)
    reportedBy: {
      userId: string;
      name: string;
      role?: string;
    };

    areaIncidente: string;         // Área donde ocurrió el problema
    equipoAreaOrigen?: string;     // Área donde estaba asignado el equipo

    description: string;
    audioTranscription?: string;

    attachments?: string[];        // Fotos / videos / evidencia
  };

  // ASIGNACIÓN DEL TICKET
  assignment?: {
    assignedAt: string;
    assignedTo: {
      userId: string;
      name: string;
      type: 'INTERNO' | 'TERCERO';  // Técnico propio o tercero
      company?: string;             // Si es tercero
    };
  };

  // EJECUCIÓN DEL SERVICIO
  execution?: {
    startedAt?: string;

    diagnosedBy?: 'PROPIO' | 'TERCERO';
    repairedBy?: 'PROPIO' | 'TERCERO';

    failureCause?: string;          // Estandarizado
    repairMethodology?: string;

    sparePartsUsed?: {
      partNumber?: string;
      name: string;
      quantity: number;
    }[];

    // Estado operativo durante la intervención
    equipmentStatusDuringService?: 
      'OPERATIVO' | 
      'INOPERATIVO' | 
      'EN_REPARACION' |
      'FUERA_DE_SERVICIO';

    // Tiempo usado en diagnóstico/reparación
    workingTimeHours?: number;
  };

  // CIERRE DEL WORK ORDER
  closure?: {
    closedAt: string;

    finalEquipmentStatus: 
      'OPERATIVO' | 
      'INOPERATIVO' | 
      'OBSOLETO' |
      'BAJA' |
      'EN_OBSERVACION';

    fechaReingresoArea?: string;    // Volvió a su sala
    userSatisfaction?: number;      // Calificación

    resolutionTimeSeconds?: number;
    downTimeSeconds?: number;

    reportUrl?: string;             // PDF del informe técnico

    signature?: {
      signerName: string;
      timestamp: string;
      digitalHash: string;
    };
  };

  // METADATOS
  metadata: {
    createdAt: string;
    createdBy: string;
    updatedAt?: string;
    updatedBy?: string;
  };
}