import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Search, ChevronRight, ChevronDown, ArrowLeft } from 'lucide-react';
import { useEstudiantes, type Estudiante, type Risk } from '../../data/useEstudiantes';

const COBALT = '#2563EB';
const BORDER = '#E5E7EB';

const RISK_COLOR: Record<Risk, string> = {
  high:   '#EF4444',
  medium: '#F59E0B',
  low:    '#10B981',
};

const RISK_LABEL: Record<Risk, string> = {
  high:   'Alto',
  medium: 'Medio',
  low:    'Bajo',
};

type ActiveFilter = 'Todos' | 'ACTIVO' | 'BAJA';

function buildWellnessData(historial: number[]) {
  return historial.map((val, i) => ({ dia: i + 1, bienestar: val }));
}

function LoadingSkeleton() {
  return (
    <div className="flex" style={{ height: 'calc(100vh - 56px)' }}>
      <div style={{ width: '30%', background: '#F3F4F6', borderRight: `1px solid ${BORDER}` }} />
      <div style={{ flex: 1, background: '#F9FAFB' }} />
    </div>
  );
}

export function Screen4Historico({ onBack }: { onBack: () => void }) {
  const { data, loading, error } = useEstudiantes();

  const estudiantes = data?.estudiantes ?? [];

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote]             = useState('');
  const [filter, setFilter]         = useState<ActiveFilter>('Todos');
  const [search, setSearch]         = useState('');
  const [savedNotes, setSavedNotes] = useState<Record<string, { text: string; date: string }>>({});

  const selected: Estudiante | undefined = useMemo(() => {
    if (estudiantes.length === 0) return undefined;
    return estudiantes.find((e) => e.id === selectedId) ?? estudiantes[0];
  }, [selectedId, estudiantes]);

  const wellnessData = useMemo(
    () => selected ? buildWellnessData(selected.historial_bienestar) : [],
    [selected?.id]
  );

  const displayNote = selected
    ? (savedNotes[selected.id]?.text ?? selected.ultima_nota)
    : '';
  const displayDate = selected && savedNotes[selected.id]
    ? savedNotes[selected.id].date
    : 'Orientadora García';

  function handleSaveNote() {
    if (!selected || !note.trim()) return;
    const now = new Date().toLocaleString('es-MX', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
    setSavedNotes((prev) => ({ ...prev, [selected.id]: { text: note.trim(), date: now } }));
    setNote('');
  }

  const filteredStudents = useMemo(
    () => estudiantes.filter((s) => {
      const matchFilter =
        filter === 'Todos'  ||
        (filter === 'ACTIVO' && s.estatus === 'ACTIVO') ||
        (filter === 'BAJA'   && s.estatus === 'BAJA');
      const matchSearch =
        s.id.toLowerCase().includes(search.toLowerCase()) ||
        s.nombre.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    }),
    [estudiantes, filter, search]
  );

  if (loading) return <LoadingSkeleton />;
  if (error) return (
    <div className="p-8 text-center" style={{ color: '#EF4444', fontSize: '14px' }}>
      Error al cargar datos: {error}
    </div>
  );
  if (!selected) return null;

  return (
    <div className="flex" style={{ height: 'calc(100vh - 56px)' }}>
      {/* ── Sidebar 30% ── */}
      <aside
        className="flex flex-col shrink-0 bg-white"
        style={{ width: '30%', borderRight: `1px solid ${BORDER}` }}
      >
        {/* Sidebar header */}
        <div style={{ padding: '20px 16px 12px', borderBottom: `1px solid ${BORDER}` }}>
          {/* Back button */}
          <button
            onClick={onBack}
            className="flex items-center gap-1 mb-3"
            style={{
              fontSize: '12px',
              color: '#6B7280',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <ArrowLeft size={13} />
            Volver a Orientación
          </button>

          <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
            Histórico de Estudiantes
          </h2>
          <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
            {filteredStudents.length} de {estudiantes.length} registros
          </p>

          {/* Search */}
          <div
            className="flex items-center gap-2 mt-3"
            style={{ border: `1px solid ${BORDER}`, borderRadius: '4px', padding: '7px 10px' }}
          >
            <Search size={13} style={{ color: '#9CA3AF', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Buscar por ID o nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 outline-none bg-transparent"
              style={{ fontSize: '13px', color: '#374151' }}
            />
          </div>
        </div>

        {/* Estatus filter pills */}
        <div
          className="flex gap-1.5"
          style={{ padding: '10px 16px', borderBottom: `1px solid ${BORDER}` }}
        >
          {(['Todos', 'ACTIVO', 'BAJA'] as ActiveFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                fontSize: '11px',
                fontWeight: filter === f ? 500 : 400,
                color: filter === f ? COBALT : '#6B7280',
                border: `1px solid ${filter === f ? COBALT : BORDER}`,
                borderRadius: '4px',
                padding: '3px 10px',
                backgroundColor: filter === f ? '#EFF6FF' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Student list */}
        <div className="flex-1 overflow-y-auto">
          {filteredStudents.map((student) => (
            <button
              key={student.id}
              onClick={() => setSelectedId(student.id)}
              className="w-full text-left flex items-center gap-3 transition-colors"
              style={{
                padding: '12px 16px',
                borderBottom: `1px solid #F3F4F6`,
                backgroundColor: selected.id === student.id ? '#EFF6FF' : 'transparent',
                cursor: 'pointer',
              }}
            >
              {/* Risk dot */}
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: RISK_COLOR[student.riesgo],
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* ID + Estatus badge in the same row */}
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#111827' }}>
                    {student.id}
                  </span>
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      color: student.estatus === 'ACTIVO' ? '#166534' : '#991B1B',
                      backgroundColor: student.estatus === 'ACTIVO' ? '#F0FDF4' : '#FEF2F2',
                      border: `1px solid ${student.estatus === 'ACTIVO' ? '#BBF7D0' : '#FECACA'}`,
                      borderRadius: '4px',
                      padding: '1px 5px',
                      flexShrink: 0,
                    }}
                  >
                    {student.estatus}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '1px' }}>
                  {student.nombre} · Riesgo {RISK_LABEL[student.riesgo]} · {student.score}/10
                </div>
              </div>
              <ChevronRight size={12} style={{ color: '#D1D5DB', flexShrink: 0 }} />
            </button>
          ))}
        </div>
      </aside>

      {/* ── Detail panel 70% ── */}
      <main
        className="flex-1 overflow-y-auto"
        style={{ backgroundColor: '#F9FAFB', padding: '32px' }}
      >
        {/* Student header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>{selected.id}</h2>
              {/* Riesgo badge */}
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  color: RISK_COLOR[selected.riesgo],
                  backgroundColor: `${RISK_COLOR[selected.riesgo]}18`,
                  border: `1px solid ${RISK_COLOR[selected.riesgo]}30`,
                  borderRadius: '4px',
                  padding: '2px 8px',
                }}
              >
                Riesgo {RISK_LABEL[selected.riesgo]}
              </span>
              {/* Estatus badge */}
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  color: selected.estatus === 'ACTIVO' ? '#166534' : '#991B1B',
                  backgroundColor: selected.estatus === 'ACTIVO' ? '#F0FDF4' : '#FEF2F2',
                  border: `1px solid ${selected.estatus === 'ACTIVO' ? '#BBF7D0' : '#FECACA'}`,
                  borderRadius: '4px',
                  padding: '2px 8px',
                }}
              >
                {selected.estatus}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>
              {selected.nombre}
              <span style={{ margin: '0 8px', color: '#D1D5DB' }}>·</span>
              Matrícula: <strong style={{ color: '#111827' }}>{selected.matricula}</strong>
              <span style={{ margin: '0 8px', color: '#D1D5DB' }}>·</span>
              Índice de bienestar:{' '}
              <strong style={{ color: '#111827', fontWeight: 600 }}>{selected.score}/10</strong>
              <span style={{ margin: '0 8px', color: '#D1D5DB' }}>·</span>
              {selected.sesiones_pendientes > 0
                ? `${selected.sesiones_pendientes} sesiones pendientes`
                : 'Sin sesiones pendientes'}
            </p>
          </div>
        </div>

        {/* Wellness line chart */}
        <div
          className="bg-white mb-4"
          style={{ border: `1px solid ${BORDER}`, borderRadius: '4px', padding: '24px' }}
        >
          <div className="mb-4">
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
              Bienestar — Últimos 30 días
            </h3>
            <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
              Índice diario en escala 1–10 · Datos del sistema A.B.E.D.
            </p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={wellnessData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis
                dataKey="dia"
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                interval={4}
                tickFormatter={(v) => `D${v}`}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                domain={[0, 10]}
                ticks={[0, 2, 4, 6, 8, 10]}
              />
              <ReferenceLine y={5} stroke="#E5E7EB" strokeDasharray="4 4" />
              <Tooltip
                contentStyle={{
                  border: `1px solid ${BORDER}`,
                  borderRadius: '4px',
                  fontSize: '12px',
                  boxShadow: 'none',
                }}
                formatter={(value: number) => [value.toFixed(1), 'Bienestar']}
                labelFormatter={(l) => `Día ${l}`}
              />
              <Line
                type="monotone"
                dataKey="bienestar"
                stroke={selected.estatus === 'BAJA' ? '#9CA3AF' : COBALT}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: selected.estatus === 'BAJA' ? '#9CA3AF' : COBALT, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
          {selected.estatus === 'BAJA' && (
            <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '8px', fontStyle: 'italic' }}>
              * Datos históricos — El alumno se dio de baja de la institución.
            </p>
          )}
        </div>

        {/* Notes form */}
        <div
          className="bg-white"
          style={{ border: `1px solid ${BORDER}`, borderRadius: '4px', padding: '24px' }}
        >
          <div className="mb-4">
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
              Notas de Seguimiento
            </h3>
            <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
              Última nota registrada · {displayDate}
            </p>
          </div>

          {/* Previous note preview */}
          <div
            style={{
              backgroundColor: '#F9FAFB',
              border: `1px solid ${BORDER}`,
              borderRadius: '4px',
              padding: '12px',
              marginBottom: '12px',
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <span style={{ fontSize: '11px', fontWeight: 500, color: '#9CA3AF' }}>Nota anterior</span>
              <ChevronDown size={12} style={{ color: '#9CA3AF' }} />
            </div>
            <p style={{ fontSize: '12px', color: '#6B7280', lineHeight: 1.6 }}>
              {displayNote}
            </p>
          </div>

          <textarea
            key={selected.id}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Escriba las observaciones del seguimiento aquí..."
            className="w-full outline-none resize-none transition-colors"
            style={{
              fontSize: '13px',
              color: '#374151',
              border: `1px solid ${BORDER}`,
              borderRadius: '4px',
              padding: '12px',
              minHeight: '120px',
              lineHeight: 1.6,
            }}
            onFocus={(e) => (e.target.style.borderColor = COBALT)}
            onBlur={(e) => (e.target.style.borderColor = BORDER)}
          />
          <div className="flex items-center justify-between mt-4">
            <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
              {note.length} caracteres · Campo libre
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setNote('')}
                style={{
                  fontSize: '13px',
                  fontWeight: 400,
                  color: '#6B7280',
                  border: `1px solid ${BORDER}`,
                  borderRadius: '4px',
                  padding: '8px 16px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveNote}
                disabled={!note.trim()}
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'white',
                  backgroundColor: note.trim() ? COBALT : '#9CA3AF',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 20px',
                  cursor: note.trim() ? 'pointer' : 'not-allowed',
                  transition: 'background-color 0.15s',
                }}
                onMouseEnter={(e) => { if (note.trim()) (e.target as HTMLElement).style.backgroundColor = '#1D4ED8'; }}
                onMouseLeave={(e) => { if (note.trim()) (e.target as HTMLElement).style.backgroundColor = COBALT; }}
              >
                Guardar Nota
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
