// en public/src/EquipmentViewer.tsx
import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
// Importamos los tipos necesarios desde el SDK de Firestore
import { collection, getDocs, DocumentData } from 'firebase/firestore'; 

// COPIAMOS NUESTRO MODELO DETALLADO AQUÍ PARA CONSISTENCIA
// (En un proyecto más grande, compartiríamos este tipo entre frontend y backend)
interface Equipment {
  id: string;
  nombre: string;
  marca: string;
  modelo: string;
  localizacion: {
    areaClinica: string;
  };
  estadoSistema: string;
}

export const EquipmentViewer: React.FC = () => {
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                setLoading(true);
                setError(null);
                const querySnapshot = await getDocs(collection(db, "equipment"));
                
                // Aquí usamos DocumentData para darle un tipo a 'doc'
                const equipmentList = querySnapshot.docs.map((doc: DocumentData) => {
                  // Extraemos los datos y los "moldeamos" a nuestra interfaz Equipment
                  const data = doc.data();
                  return {
                    id: doc.id,
                    nombre: data.nombre,
                    marca: data.marca,
                    modelo: data.modelo,
                    localizacion: data.localizacion,
                    estadoSistema: data.estadoSistema,
                  } as Equipment;
                });

                setEquipment(equipmentList);
            } catch (err) {
                setError("Error al cargar los datos. ¿Están los emuladores corriendo?");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchEquipment();
    }, []);

    if (loading) return <p>Cargando equipos desde el emulador...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div style={{ padding: '20px' }}>
            <h1>Visor de Inventario (Conectado a Firestore Emulator)</h1>
            <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Marca / Modelo</th>
                        <th>Ubicación</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {equipment.length === 0 ? (
                        <tr>
                            <td colSpan={5}>No se encontraron equipos. ¿Ejecutaste 'node seed.js'?</td>
                        </tr>
                    ) : (
                        equipment.map(item => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{item.nombre}</td>
                                <td>{item.marca} / {item.modelo}</td>
                                <td>{item.localizacion.areaClinica}</td>
                                <td>{item.estadoSistema}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};