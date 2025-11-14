// public/src/EquipmentViewer.tsx
import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, getDocs, DocumentData } from 'firebase/firestore';

// === MODELO COMPLETO DE EQUIPMENT ===
interface Equipment {
  id: string;
  codigoIC: string;
  codigoAF?: string;
  lote?: string;
  nombre: string;
  descripcion?: string;
  tipoEquipo: string;
  tipoArticulo?: string;
  clasificacionNomenclatura?: {
    tipo: 'GMDN' | 'UMDNS' | 'OTRO';
    code: string;
    term: string;
  };
  modalidadIngreso: string;
  condicionIngreso: string;
  pertenencia: 'PROPIO' | 'DONACION' | 'COMODATO' | 'LEASING';
  propietario?: string;
  criticidad: 'ALTO' | 'MEDIO' | 'BAJO';
  criticidadIC?: string;
  clasificacionRiesgo?: string;

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

  accesorios?: { name: string; quantity: number }[];
  fungibles?: { name: string; code?: string }[];
  refacciones?: { name: string; code?: string; quantity: number }[];

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
    red?: string;
  };

  estadoSistema: 'OPERATIVO' | 'INOPERATIVO' | 'EN_MANTENIMIENTO' | 'STANDBY' | 'OBSOLETO' | 'EN_BAJA' | 'BAJA';
  estadoOperativo?: 'DISPONIBLE' | 'EN_USO' | 'EN_REPARACION' | 'RETIRADO' | 'FUERA_DE_SERVICIO';
  nivelTecnico?: 'I' | 'II' | 'III';
  endOfLife?: string;
  endOfSupport?: string;

  cicloVida: {
    vidaUtilAnos?: number;
    usoAnos?: number;
    vidaUtilConsumida?: number;
    fechaRecepcion?: string;
    fechaInstalacion?: string;
    fechaAceptacion?: string;
    resultadoAceptacion?: string;
    enGarantia?: boolean;
    garantiaAnos?: number;
    garantiaInicio?: string;
    garantiaFin?: string;
  };

  compra?: {
    proveedor?: string;
    moneda?: 'USD' | 'PEN';
    precioCompra?: number;
    precioCompraLocal?: number;
    tipoCambio?: number;
    fechaCompra?: string;
    numeroOC?: string;
    registroSanitario?: string;
    estadoRegistroSanitario?: 'ACTIVO' | 'VENCIDO' | 'EN_RENOVACION';
  };

  mantenimiento?: {
    planMP?: string;
    planCM?: string;
    requiereCalibracion?: boolean;
    fechaUltimaCalibracion?: string;
    fechaProximaCalibracion?: string;
    resultadoUltimaCalibracion?: string;
  };

  historial?: {
    recalls?: string[];
    incidentes?: string[];
  };

  baja?: {
    fechaBaja?: string;
    motivo?: string;
  };

  comentarios?: string;

  metadata: {
    creadoPor: string;
    creadoEn: string;
    actualizadoPor?: string;
    actualizadoEn?: string;
  };
}

// === PROPS PARA NAVEGACIÓN ===
interface EquipmentViewerProps {
  onSelectEquipment?: (id: string) => void;
}

// === COMPONENTE VISOR ===
export const EquipmentViewer: React.FC<EquipmentViewerProps> = ({ onSelectEquipment }) => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setLoading(true);
        setError(null);
        const querySnapshot = await getDocs(collection(db, "equipment"));
        const equipmentList = querySnapshot.docs.map((doc: DocumentData) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
          } as Equipment;
        });
        setEquipment(equipmentList);
      } catch (err) {
        setError("Error al cargar los datos. Verifica emuladores o conexión.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipment();
  }, []);

  if (loading) return <p>Cargando equipos desde Firestore...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Inventario de Equipos Biomédicos</h1>
      <p><strong>Total:</strong> {equipment.length} equipos</p>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead style={{ backgroundColor: '#f4f4f4' }}>
          <tr>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Nombre</th>
            <th style={thStyle}>Marca / Modelo</th>
            <th style={thStyle}>Área</th>
            <th style={thStyle}>Estado</th>
            <th style={thStyle}>Vida Útil</th>
            <th style={thStyle}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {equipment.length === 0 ? (
            <tr>
              <td colSpan={7} style={tdStyle}>No hay equipos. ¿Ejecutaste el seed?</td>
            </tr>
          ) : (
            equipment.map((item) => (
              <React.Fragment key={item.id}>
                <tr style={{ backgroundColor: expandedId === item.id ? '#f9f9f9' : 'white' }}>
                  <td style={tdStyle}><code>{item.id}</code></td>
                  <td style={tdStyle}><strong>{item.nombre}</strong></td>
                  <td style={tdStyle}>{item.marca} / {item.modelo}</td>
                  <td style={tdStyle}>{item.localizacion.areaClinica}</td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor:
                        item.estadoSistema === 'OPERATIVO' ? '#d4edda' :
                        item.estadoSistema === 'EN_MANTENIMIENTO' ? '#fff3cd' :
                        '#f8d7da',
                      color:
                        item.estadoSistema === 'OPERATIVO' ? '#155724' :
                        item.estadoSistema === 'EN_MANTENIMIENTO' ? '#856404' :
                        '#721c24'
                    }}>
                      {item.estadoSistema}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    {item.cicloVida?.vidaUtilConsumida != null
                      ? `${item.cicloVida.vidaUtilConsumida}% usado`
                      : 'N/D'}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                        style={actionBtnStyle}
                      >
                        {expandedId === item.id ? 'Ocultar' : 'Detalles'}
                      </button>
                      <button
                        onClick={() => onSelectEquipment?.(item.id)}
                        style={{ ...actionBtnStyle, backgroundColor: '#007bff', color: 'white' }}
                      >
                        Ver Órdenes
                      </button>
                    </div>
                  </td>
                </tr>

                {/* FILA EXPANDIDA CON TODOS LOS CAMPOS */}
                {expandedId === item.id && (
                  <tr>
                    <td colSpan={7} style={{ padding: 0, border: '1px solid #ddd' }}>
                      <div style={{ padding: '16px', backgroundColor: '#f9f9f9', fontSize: '13px' }}>
                        <h4>Detalles Completos: {item.id}</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
                          {/* Identificación */}
                          <div>
                            <strong>Código IC:</strong> {item.codigoIC}<br/>
                            <strong>Criticidad:</strong> <span style={{ color: item.criticidad === 'ALTO' ? 'red' : item.criticidad === 'MEDIO' ? 'orange' : 'green' }}>{item.criticidad}</span><br/>
                            <strong>Modalidad:</strong> {item.modalidadIngreso}
                          </div>

                          {/* Localización */}
                          <div>
                            <strong>Sede:</strong> {item.localizacion.sede}<br/>
                            <strong>Centro de Costo:</strong> {item.localizacion.centroCostoNombre} ({item.localizacion.centroCostoCodigo})<br/>
                            <strong>Responsable:</strong> {item.localizacion.responsableArea || 'N/A'}
                          </div>

                          {/* Ciclo de Vida */}
                          <div>
                            <strong>Instalación:</strong> {item.cicloVida?.fechaInstalacion || 'N/D'}<br/>
                            <strong>Garantía:</strong> {item.cicloVida?.enGarantia ? 'Sí' : 'No'} 
                            {item.cicloVida?.garantiaFin ? ` (hasta ${item.cicloVida.garantiaFin})` : ''}<br/>
                            <strong>Fin de Soporte:</strong> {item.endOfSupport || 'N/D'}
                          </div>

                          {/* Compra */}
                          {item.compra && (
                            <div>
                              <strong>Proveedor:</strong> {item.compra.proveedor}<br/>
                              <strong>Precio:</strong> ${item.compra.precioCompra?.toLocaleString()} {item.compra.moneda}<br/>
                              <strong>OC:</strong> {item.compra.numeroOC}
                            </div>
                          )}

                          {/* Mantenimiento */}
                          {item.mantenimiento && (
                            <div>
                              <strong>Plan MP:</strong> {item.mantenimiento.planMP}<br/>
                              <strong>Últ. Calibración:</strong> {item.mantenimiento?.fechaUltimaCalibracion || 'N/D'}<br/>
                              <strong>Próxima:</strong> {item.mantenimiento.fechaProximaCalibracion || 'N/D'}
                            </div>
                          )}

                          {/* Accesorios */}
                          {item.accesorios && item.accesorios.length > 0 && (
                            <div>
                              <strong>Accesorios:</strong><br/>
                              <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                                {item.accesorios.map((a, i) => (
                                  <li key={i}>{a.name} (x{a.quantity})</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        <div style={{ marginTop: '12px', fontSize: '11px', color: '#666' }}>
                          <em>Creado por {item.metadata.creadoPor} el {new Date(item.metadata.creadoEn).toLocaleDateString()}</em>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

// === ESTILOS ===
const thStyle: React.CSSProperties = {
  padding: '12px 8px',
  textAlign: 'left' as const,
  backgroundColor: '#f4f4f4',
  borderBottom: '2px solid #ddd',
  fontSize: '14px'
};

const tdStyle: React.CSSProperties = {
  padding: '10px 8px',
  borderBottom: '1px solid #eee',
  verticalAlign: 'top'
};

const actionBtnStyle: React.CSSProperties = {
  padding: '6px 10px',
  fontSize: '12px',
  cursor: 'pointer',
  border: '1px solid #ddd',
  borderRadius: '4px',
  backgroundColor: '#f8f9fa',
  color: '#495057'
};