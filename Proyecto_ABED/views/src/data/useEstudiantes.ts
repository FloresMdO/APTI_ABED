import { useState, useEffect } from 'react';

export type Risk = 'high' | 'medium' | 'low';

export type Estatus = 'ACTIVO' | 'BAJA';

export interface AsistenciaSemanal {
  semana: string;
  asistencia: number;
  ausencia: number;
}

export interface Estudiante {
  id: string;
  nombre: string;
  matricula: string;
  horario: string;
  riesgo: Risk;
  score: number;
  sesiones_pendientes: number;
  emocion_predominante: string;
  estatus: Estatus;
  asistencia_semanal: AsistenciaSemanal[];
  historial_bienestar: number[];
  ultima_nota: string;
}

export interface EstudiantesData {
  meta: { ciclo: string; actualizacion: string };
  estudiantes: Estudiante[];
}

export function useEstudiantes() {
  const [data, setData] = useState<EstudiantesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/estudiantes.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<EstudiantesData>;
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { data, loading, error };
}
