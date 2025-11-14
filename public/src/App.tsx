// public/src/App.tsx
import React, { useState } from 'react';
import { EquipmentViewer } from './EquipmentViewer';
import { WorkOrderViewer } from './WorkOrderViewer';

// === ESTILOS MODERNOS Y PROFESIONALES ===
const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
    color: '#212529'
  },
  header: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '1.5rem',
    textAlign: 'center' as const,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  title: {
    margin: 0,
    fontSize: '1.8rem',
    fontWeight: 300
  },
  nav: {
    display: 'flex',
    borderBottom: '1px solid #dee2e6',
    backgroundColor: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  tabButton: (active: boolean): React.CSSProperties => ({
    padding: '1rem 2rem',
    cursor: 'pointer',
    backgroundColor: active ? '#fff' : 'transparent',
    color: active ? '#007bff' : '#495057',
    border: 'none',
    borderBottom: active ? '3px solid #007bff' : '3px solid transparent',
    fontSize: '1rem',
    fontWeight: active ? 600 : 400,
    transition: 'all 0.2s'
  }),
  content: {
    padding: '2rem',
    backgroundColor: '#fff',
    minHeight: 'calc(100vh - 140px)'
  },
  stats: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap' as const
  },
  statCard: {
    backgroundColor: '#e9ecef',
    padding: '1rem',
    borderRadius: '8px',
    minWidth: '180px',
    textAlign: 'center' as const,
    fontSize: '0.9rem'
  }
};

function App() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'workorders'>('inventory');
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);

  // Para mostrar estadísticas (puedes conectar con datos reales después)
  const stats = {
    totalEquipos: 25,
    operativos: 18,
    enMantenimiento: 5,
    totalWO: 78,
    cerradas: 66
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <header style={styles.header}>
        <h1 style={styles.title}>AUREA - Sistema de Gestión de Activos Biomédicos</h1>
        <p style={{ margin: '0.5rem 0 0', fontSize: '1rem', opacity: 0.9 }}>
          Hospital Santa Isabel | Módulo del Ingeniero Clínico
        </p>
      </header>

      {/* ESTADÍSTICAS RÁPIDAS */}
      <div style={styles.stats}>
        <div style={styles.statCard}>
          <strong>{stats.totalEquipos}</strong><br />
          Equipos en Inventario
        </div>
        <div style={styles.statCard}>
          <strong style={{ color: '#28a745' }}>{stats.operativos}</strong> Operativos<br />
          <strong style={{ color: '#ffc107' }}>{stats.enMantenimiento}</strong> En Mantenimiento
        </div>
        <div style={styles.statCard}>
          <strong>{stats.totalWO}</strong><br />
          Órdenes de Trabajo
        </div>
        <div style={styles.statCard}>
          <strong style={{ color: '#28a745' }}>{stats.cerradas}</strong> Cerradas<br />
          <strong style={{ color: '#dc3545' }}>{stats.totalWO - stats.cerradas}</strong> Pendientes
        </div>
      </div>

      {/* NAVEGACIÓN */}
      <nav style={styles.nav}>
        <button
          style={styles.tabButton(activeTab === 'inventory')}
          onClick={() => {
            setActiveTab('inventory');
            setSelectedEquipmentId(null);
          }}
        >
          Inventario de Equipos
        </button>
        <button
          style={styles.tabButton(activeTab === 'workorders')}
          onClick={() => setActiveTab('workorders')}
        >
          Órdenes de Trabajo
        </button>
      </nav>

      {/* CONTENIDO */}
      <main style={styles.content}>
        {activeTab === 'inventory' && (
          <EquipmentViewer
            onSelectEquipment={(id) => {
              setSelectedEquipmentId(id);
              setActiveTab('workorders');
            }}
          />
        )}
        {activeTab === 'workorders' && (
          <WorkOrderViewer filterEquipmentId={selectedEquipmentId} />
        )}
      </main>

      {/* FOOTER */}
      <footer style={{
        textAlign: 'center' as const,
        padding: '1rem',
        backgroundColor: '#343a40',
        color: '#adb5bd',
        fontSize: '0.8rem',
        marginTop: 'auto'
      }}>
        © 2025 AUREA - Hospital Santa Isabel | v1.0.0
      </footer>
    </div>
  );
}

export default App;