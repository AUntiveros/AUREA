// public/src/WorkOrderViewer.tsx
import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, getDocs, DocumentData } from 'firebase/firestore';

// === MODELO COMPLETO DE WORKORDER ===
interface WorkOrder {
  id: string;
  equipmentId: string;
  type: 'CORRECTIVO' | 'PREVENTIVO' | 'CALIBRACION' | 'INSPECCION' | 'DIAGNOSTICO';
  status: 'ABIERTO' | 'ASIGNADO' | 'EN_PROCESO' | 'ESPERA_REPUESTO' | 'CERRADO' | 'CANCELADO';

  creation: {
    reportedAt: string;
    reportedBy: {
      userId: string;
      name: string;
      role?: string;
    };
    areaIncidente: string;
    description: string;
    attachments?: string[];
  };

  assignment?: {
    assignedAt: string;
    assignedTo: {
      userId: string;
      name: string;
      type: 'INTERNO' | 'TERCERO';
      company?: string;
    };
  };

  execution?: {
    startedAt?: string;
    diagnosedBy?: 'PROPIO' | 'TERCERO';
    repairedBy?: 'PROPIO' | 'TERCERO';
    failureCause?: string;
    repairMethodology?: string;
    sparePartsUsed?: { partNumber?: string; name: string; quantity: number }[];
    equipmentStatusDuringService?: 'OPERATIVO' | 'INOPERATIVO' | 'EN_REPARACION' | 'FUERA_DE_SERVICIO';
    workingTimeHours?: number;
  };

  closure?: {
    closedAt?: string;
    finalEquipmentStatus?: 'OPERATIVO' | 'INOPERATIVO' | 'OBSOLETO' | 'BAJA' | 'EN_OBSERVACION';
    fechaReingresoArea?: string;
    userSatisfaction?: number;
    resolutionTimeSeconds?: number;
    downTimeSeconds?: number;
    reportUrl?: string;
  };

  metadata: {
    createdAt: string;
    createdBy: string;
    updatedAt?: string;
    updatedBy?: string;
  };
}

// === PROPS PARA FILTRO ===
interface WorkOrderViewerProps {
  filterEquipmentId?: string | null;
}

// === COMPONENTE VISOR ===
export const WorkOrderViewer: React.FC<WorkOrderViewerProps> = ({ filterEquipmentId }) => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, "workorders"));
        const woList = querySnapshot.docs.map((doc: DocumentData) => ({
          id: doc.id,
          ...doc.data(),
        })) as WorkOrder[];
        setWorkOrders(woList);
      } catch (err) {
        setError("Error al cargar las órdenes de trabajo.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkOrders();
  }, []);

  // === FILTRADO ===
  const filteredOrders = filterEquipmentId
    ? workOrders.filter(wo => wo.equipmentId === filterEquipmentId)
    : workOrders;

  if (loading) return <p>Cargando órdenes de trabajo...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  const formatDate = (iso: string) => new Date(iso).toLocaleString('es-PE');
  const formatHours = (seconds?: number) => seconds ? `${(seconds / 3600).toFixed(1)}h` : '—';

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>
        Órdenes de Trabajo
        {filterEquipmentId && ` - Equipo: ${filterEquipmentId}`}
        {' '}
        ({filteredOrders.length})
      </h1>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead style={{ backgroundColor: '#f4f4f4' }}>
          <tr>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Equipo</th>
            <th style={thStyle}>Tipo</th>
            <th style={thStyle}>Estado</th>
            <th style={thStyle}>Reportado</th>
            <th style={thStyle}>Técnico</th>
            <th style={thStyle}>Tiempo</th>
            <th style={thStyle}>Detalles</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map(wo => (
            <React.Fragment key={wo.id}>
              <tr style={{ backgroundColor: expandedId === wo.id ? '#f9f9f9' : 'white' }}>
                <td style={tdStyle}><code>{wo.id}</code></td>
                <td style={tdStyle}><strong>{wo.equipmentId}</strong></td>
                <td style={tdStyle}>{wo.type}</td>
                <td style={tdStyle}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    backgroundColor:
                      wo.status === 'CERRADO' ? '#d4edda' :
                      wo.status === 'EN_PROCESO' ? '#fff3cd' :
                      wo.status === 'ESPERA_REPUESTO' ? '#f8d7da' :
                      '#e2e3e5',
                    color:
                      wo.status === 'CERRADO' ? '#155724' :
                      wo.status === 'EN_PROCESO' ? '#856404' :
                      wo.status === 'ESPERA_REPUESTO' ? '#721c24' :
                      '#495057'
                  }}>
                    {wo.status}
                  </span>
                </td>
                <td style={tdStyle}>
                  {formatDate(wo.creation.reportedAt).split(',')[0]}
                  <br />
                  <small>{wo.creation.reportedBy.name}</small>
                </td>
                <td style={tdStyle}>
                  {wo.assignment?.assignedTo.name || '—'}
                  <br />
                  <small style={{ color: '#666' }}>
                    {wo.assignment?.assignedTo.type === 'TERCERO' ? wo.assignment.assignedTo.company : 'Interno'}
                  </small>
                </td>
                <td style={tdStyle}>
                  <small>
                    Res: {formatHours(wo.closure?.resolutionTimeSeconds)}<br />
                    Down: {formatHours(wo.closure?.downTimeSeconds)}
                  </small>
                </td>
                <td style={tdStyle}>
                  <button
                    onClick={() => setExpandedId(expandedId === wo.id ? null : wo.id)}
                    style={actionBtnStyle}
                  >
                    {expandedId === wo.id ? 'Ocultar' : 'Ver todo'}
                  </button>
                </td>
              </tr>

              {expandedId === wo.id && (
                <tr>
                  <td colSpan={8} style={{ padding: 0, border: '1px solid #ddd' }}>
                    <div style={{ padding: '16px', backgroundColor: '#f9f9f9', fontSize: '13px' }}>
                      <h4>Detalle Completo: {wo.id}</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                        <div>
                          <strong>Creación</strong><br />
                          <strong>Fecha:</strong> {formatDate(wo.creation.reportedAt)}<br />
                          <strong>Reportado por:</strong> {wo.creation.reportedBy.name} ({wo.creation.reportedBy.role || 'Sin rol'})<br />
                          <strong>Área:</strong> {wo.creation.areaIncidente}<br />
                          <strong>Descripción:</strong><br />
                          <em>{wo.creation.description}</em>
                        </div>

                        {wo.assignment && (
                          <div>
                            <strong>Asignación</strong><br />
                            <strong>Fecha:</strong> {formatDate(wo.assignment.assignedAt)}<br />
                            <strong>Técnico:</strong> {wo.assignment.assignedTo.name}<br />
                            <strong>Tipo:</strong> {wo.assignment.assignedTo.type}
                            {wo.assignment.assignedTo.company && ` (${wo.assignment.assignedTo.company})`}
                          </div>
                        )}

                        {wo.execution && (
                          <div>
                            <strong>Ejecución</strong><br />
                            {wo.execution.failureCause && (
                              <>Causa: {wo.execution.failureCause}<br /></>
                            )}
                            {wo.execution.repairMethodology && (
                              <>Metodología: {wo.execution.repairMethodology}<br /></>
                            )}
                            {wo.execution.sparePartsUsed && wo.execution.sparePartsUsed.length > 0 && (
                              <>
                                <strong>Repuestos:</strong>
                                <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                                  {wo.execution.sparePartsUsed.map((p, i) => (
                                    <li key={i}>{p.name} (x{p.quantity}) {p.partNumber && `[${p.partNumber}]`}</li>
                                  ))}
                                </ul>
                              </>
                            )}
                          </div>
                        )}

                        {wo.closure && (
                          <div>
                            <strong>Cierre</strong><br />
                            {wo.closure.closedAt ? (
                              <>Cerrado: {formatDate(wo.closure.closedAt)}<br /></>
                            ) : (
                              <>Estado: Pendiente</>
                            )}
                            {wo.closure.finalEquipmentStatus && (
                              <>Equipo final: {wo.closure.finalEquipmentStatus}<br /></>
                            )}
                            {wo.closure.reportUrl && (
                              <a href={wo.closure.reportUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>
                                Ver informe
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

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