import { useState, useEffect } from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { useEstudiantes } from '../../data/useEstudiantes';

const COBALT = '#2563EB';
const BORDER = '#E5E7EB';

type LogEntry = {
  time: string;
  event: string;
  status: string;
  ok: boolean;
};

const BASE_LOGS: LogEntry[] = [
  { time: '10:12', event: 'Inicio del sistema',        status: 'Completado',  ok: true },
  { time: '10:13', event: 'Carga de modelo de IA',     status: 'Exitoso',     ok: true },
  { time: '10:14', event: 'Conexión a base de datos',  status: 'Establecida', ok: true },
  { time: '10:15', event: 'Detección de Rostro',       status: 'Exitoso',     ok: true },
  { time: '10:16', event: 'Registro de Asistencia',    status: 'Guardado',    ok: true },
  { time: '10:18', event: 'Limpieza de Temporales',    status: 'Completado',  ok: true },
  { time: '10:20', event: 'Sincronización de BD',      status: 'Exitoso',     ok: true },
  { time: '10:22', event: 'Exportación de reporte',    status: 'Completado',  ok: true },
];

export function Screen3Consola() {
  const { data, loading } = useEstudiantes();

  const [cameraOn, setCameraOn] = useState(true);
  const [syncing, setSyncing]   = useState(false);
  const [privacy, setPrivacy]   = useState(true);
  const [lastSync, setLastSync] = useState('hace 2 min');
  const [logs, setLogs]         = useState<LogEntry[]>(BASE_LOGS);

  useEffect(() => {
    if (!data) return;
    const logsFromData: LogEntry[] = data.estudiantes.map((e) => ({
      time: '10:17',
      event: `Análisis emocional — ${e.id} (${e.nombre})`,
      status: 'Exitoso',
      ok: true,
    }));
    setLogs([...BASE_LOGS.slice(0, 5), ...logsFromData, ...BASE_LOGS.slice(5)]);
  }, [data]);

  function handleSync() {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setLastSync('hace unos segundos');
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      setLogs((prev) => [
        ...prev,
        { time, event: 'Sincronización manual', status: 'Exitoso', ok: true },
      ]);
    }, 1800);
  }

  function handleCameraToggle() {
    const next = !cameraOn;
    setCameraOn(next);
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setLogs((prev) => [
      ...prev,
      {
        time,
        event: next ? 'Cámara activada' : 'Cámara desactivada',
        status: next ? 'Activa' : 'Apagada',
        ok: next,
      },
    ]);
  }

  return (
    <div style={{ height: 'calc(100vh - 56px)', overflowY: 'auto', backgroundColor: '#F9FAFB' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 32px' }}>

        <div className="flex items-center justify-between" style={{ marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#111827' }}>
              Configuración del Sistema
            </h1>
            <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>
              Panel de Control de Infraestructura · A.B.E.D. System
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: loading ? '#F59E0B' : '#10B981',
              }}
            />
            <span style={{ fontSize: '13px', color: '#6B7280' }}>
              {loading ? 'Cargando datos...' : 'Sistema en Línea'}
            </span>
          </div>
        </div>

        <p
          style={{
            fontSize: '11px',
            fontWeight: 500,
            color: '#9CA3AF',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '12px',
          }}
        >
          Estado de Componentes
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '16px',
            marginBottom: '40px',
          }}
        >
          <div style={{ backgroundColor: 'white', border: `1px solid ${BORDER}`, borderRadius: '4px', padding: '24px' }}>
            <p style={{ fontSize: '11px', fontWeight: 500, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
              Estado de Cámara
            </p>
            <div className="flex items-center gap-2" style={{ marginBottom: '20px' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: cameraOn ? '#10B981' : '#9CA3AF',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: '22px', fontWeight: 600, color: '#111827' }}>
                {cameraOn ? 'Activa' : 'Apagada'}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '16px' }}>
              CAM-01 · 30fps · 1920×1080
            </p>
            <button
              onClick={handleCameraToggle}
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: cameraOn ? '#EF4444' : COBALT,
                border: `1px solid ${cameraOn ? '#FECACA' : BORDER}`,
                borderRadius: '4px',
                padding: '7px 16px',
                backgroundColor: cameraOn ? '#FEF2F2' : 'white',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              {cameraOn ? 'Apagar' : 'Encender'}
            </button>
          </div>

          <div style={{ backgroundColor: 'white', border: `1px solid ${BORDER}`, borderRadius: '4px', padding: '24px' }}>
            <p style={{ fontSize: '11px', fontWeight: 500, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
              Sincronización de Base de Datos
            </p>
            <span style={{ fontSize: '22px', fontWeight: 600, color: '#111827', display: 'block', marginBottom: '8px' }}>
              Sincronizada
            </span>
            <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '16px' }}>
              Última sincronización: {lastSync}
            </p>
            <button
              onClick={handleSync}
              disabled={syncing}
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: syncing ? '#9CA3AF' : COBALT,
                border: `1px solid ${syncing ? BORDER : COBALT}`,
                borderRadius: '4px',
                padding: '7px 16px',
                backgroundColor: syncing ? '#F9FAFB' : '#EFF6FF',
                cursor: syncing ? 'not-allowed' : 'pointer',
                width: '100%',
              }}
            >
              {syncing ? 'Sincronizando...' : 'Sincronizar Ahora'}
            </button>
          </div>

          <div style={{ backgroundColor: 'white', border: `1px solid ${BORDER}`, borderRadius: '4px', padding: '24px' }}>
            <p style={{ fontSize: '11px', fontWeight: 500, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
              Privacidad
            </p>
            <span style={{ fontSize: '22px', fontWeight: 600, color: '#111827', display: 'block', marginBottom: '8px' }}>
              {privacy ? 'Protegida' : 'Desactivada'}
            </span>
            <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '16px' }}>
              Cumplimiento GDPR · Modo {privacy ? 'anónimo' : 'sin filtro'}
            </p>
            <div className="flex items-center justify-between">
              <span style={{ fontSize: '13px', color: privacy ? '#111827' : '#9CA3AF', fontWeight: 500 }}>
                Anonimización:{' '}
                <span style={{ color: privacy ? '#10B981' : '#EF4444' }}>
                  {privacy ? 'ACTIVADA' : 'DESACTIVADA'}
                </span>
              </span>
              <SwitchPrimitive.Root
                checked={privacy}
                onCheckedChange={setPrivacy}
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  width: '36px',
                  height: '20px',
                  borderRadius: '10px',
                  backgroundColor: privacy ? COBALT : '#D1D5DB',
                  border: 'none',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'background-color 0.2s',
                  outline: 'none',
                }}
              >
                <SwitchPrimitive.Thumb
                  style={{
                    display: 'block',
                    width: '14px',
                    height: '14px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    transform: privacy ? 'translateX(19px)' : 'translateX(3px)',
                    transition: 'transform 0.2s',
                  }}
                />
              </SwitchPrimitive.Root>
            </div>
          </div>
        </div>

        <p
          style={{
            fontSize: '11px',
            fontWeight: 500,
            color: '#9CA3AF',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '12px',
          }}
        >
          Log de Actividad
        </p>

        <div style={{ backgroundColor: 'white', border: `1px solid ${BORDER}`, borderRadius: '4px', overflow: 'hidden' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '100px 1fr 130px',
              backgroundColor: '#F9FAFB',
              borderBottom: `1px solid ${BORDER}`,
              padding: '10px 20px',
            }}
          >
            {['Hora', 'Evento', 'Estado'].map((col) => (
              <span
                key={col}
                style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  color: '#9CA3AF',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                }}
              >
                {col}
              </span>
            ))}
          </div>

          {[...logs].reverse().map((row, i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '100px 1fr 130px',
                padding: '12px 20px',
                borderBottom: i < logs.length - 1 ? `1px solid #F3F4F6` : 'none',
                backgroundColor: i === 0 ? '#FAFAFA' : 'white',
              }}
            >
              <span style={{ fontSize: '13px', color: '#9CA3AF', fontVariantNumeric: 'tabular-nums' }}>
                {row.time}
              </span>
              <span style={{ fontSize: '13px', color: '#374151' }}>{row.event}</span>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: row.ok ? '#10B981' : '#EF4444',
                  backgroundColor: row.ok ? '#F0FDF4' : '#FEF2F2',
                  border: `1px solid ${row.ok ? '#BBF7D0' : '#FECACA'}`,
                  borderRadius: '4px',
                  padding: '2px 8px',
                  display: 'inline-block',
                  alignSelf: 'center',
                  width: 'fit-content',
                }}
              >
                {row.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
