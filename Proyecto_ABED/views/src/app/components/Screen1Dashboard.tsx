import { useMemo } from 'react';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';
import { useEstudiantes, type Estudiante } from '../../data/useEstudiantes';

const COBALT = '#2563EB';
const BORDER = '#E5E7EB';

const EMOTION_COLORS: Record<string, string> = {
  'Alegría':  COBALT,
  'Neutral':  '#93C5FD',
  'Tristeza': '#6B7280',
  'Ansiedad': '#E5E7EB',
  'Enojo':    '#F87171',
};

function LoadingSkeleton() {
  return (
    <div className="p-8" style={{ maxWidth: '1280px', margin: '0 auto' }}>
      <div style={{ height: '28px', width: '220px', background: '#F3F4F6', borderRadius: '4px', marginBottom: '32px' }} />
      <div className="grid grid-cols-12 gap-4 mb-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="col-span-4" style={{ height: '120px', background: '#F3F4F6', borderRadius: '4px' }} />
        ))}
      </div>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-5" style={{ height: '320px', background: '#F3F4F6', borderRadius: '4px' }} />
        <div className="col-span-7" style={{ height: '320px', background: '#F3F4F6', borderRadius: '4px' }} />
      </div>
    </div>
  );
}

function deriveKpis(estudiantes: Estudiante[]) {
  const total = estudiantes.length;
  if (total === 0) return [];

  const highRisk = estudiantes.filter((e) => e.riesgo === 'high');
  const alertas   = estudiantes.filter((e) => e.sesiones_pendientes > 0);
  const avgScore  = estudiantes.reduce((acc, e) => acc + e.score, 0) / total;
  const highPct   = Math.round((highRisk.length / total) * 100);

  return [
    {
      label: 'Nivel de Riesgo Alto',
      value: `${highPct}%`,
      sub: 'del grupo total',
      trend: `${highRisk.length} estudiantes en riesgo alto`,
      up: true,
      color: '#EF4444',
    },
    {
      label: 'Alertas Activas',
      value: `${alertas.length}`,
      sub: 'requieren seguimiento',
      trend: `${alertas.reduce((a, e) => a + e.sesiones_pendientes, 0)} sesiones por atender`,
      up: false,
      color: '#F59E0B',
    },
    {
      label: 'Media de Bienestar',
      value: avgScore.toFixed(1),
      sub: '/ 10.0 puntos',
      trend: `Promedio de ${total} estudiantes`,
      up: true,
      color: COBALT,
    },
  ];
}

function deriveEmotionalData(estudiantes: Estudiante[]) {
  const counts: Record<string, number> = {};
  for (const e of estudiantes) {
    counts[e.emocion_predominante] = (counts[e.emocion_predominante] ?? 0) + 1;
  }
  const total = estudiantes.length || 1;
  return Object.entries(counts).map(([name, count]) => ({
    name,
    value: Math.round((count / total) * 100),
    color: EMOTION_COLORS[name] ?? '#9CA3AF',
  }));
}

function deriveAttendanceData(estudiantes: Estudiante[]) {
  if (estudiantes.length === 0) return [];
  const semanas = estudiantes[0].asistencia_semanal.map((s) => s.semana);
  return semanas.map((semana, idx) => {
    const totalAsist = estudiantes.reduce(
      (acc, e) => acc + (e.asistencia_semanal[idx]?.asistencia ?? 0), 0
    );
    const totalAus = estudiantes.reduce(
      (acc, e) => acc + (e.asistencia_semanal[idx]?.ausencia ?? 0), 0
    );
    const count = estudiantes.length;
    return {
      semana,
      asistencia: Math.round(totalAsist / count),
      ausencia:   Math.round(totalAus / count),
    };
  });
}

export function Screen1Dashboard() {
  const { data, loading, error } = useEstudiantes();

  const estudiantes = data?.estudiantes ?? [];

  const kpiData        = useMemo(() => deriveKpis(estudiantes),         [estudiantes]);
  const emotionalData  = useMemo(() => deriveEmotionalData(estudiantes), [estudiantes]);
  const attendanceData = useMemo(() => deriveAttendanceData(estudiantes), [estudiantes]);

  function exportPDF() {
    const meta    = data?.meta;
    const now     = new Date().toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' });
    const total   = estudiantes.length;
    const highRisk  = estudiantes.filter((e) => e.riesgo === 'high').length;
    const medRisk   = estudiantes.filter((e) => e.riesgo === 'medium').length;
    const lowRisk   = estudiantes.filter((e) => e.riesgo === 'low').length;
    const alertas   = estudiantes.filter((e) => e.sesiones_pendientes > 0).length;
    const avgScore  = total > 0
      ? (estudiantes.reduce((a, e) => a + e.score, 0) / total).toFixed(2)
      : '—';

    const RISK_LABELS: Record<string, string> = { high: 'Alto', medium: 'Medio', low: 'Bajo' };
    const RISK_COLORS: Record<string, string> = { high: '#FEF2F2', medium: '#FFFBEB', low: '#F0FDF4' };
    const RISK_TEXT:   Record<string, string> = { high: '#B91C1C', medium: '#92400E', low: '#166534' };

    const emotionRows = emotionalData
      .map((e) => `<tr><td>${e.name}</td><td style="text-align:center;font-weight:600">${e.value}%</td></tr>`)
      .join('');

    const attendanceRows = attendanceData
      .map((s) => `<tr>
        <td>${s.semana}</td>
        <td style="text-align:center;color:#2563EB;font-weight:600">${s.asistencia}%</td>
        <td style="text-align:center;color:#9CA3AF">${s.ausencia}%</td>
      </tr>`)
      .join('');

    const studentRows = estudiantes
      .map((e, i) => `<tr style="background:${i % 2 === 0 ? 'white' : '#FAFAFA'}">
        <td style="font-weight:600">${e.id}</td>
        <td>${e.nombre}</td>
        <td>${e.matricula}</td>
        <td>${e.horario}</td>
        <td style="text-align:center">
          <span style="background:${RISK_COLORS[e.riesgo]};color:${RISK_TEXT[e.riesgo]};padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600">
            ${RISK_LABELS[e.riesgo] ?? e.riesgo}
          </span>
        </td>
        <td style="text-align:center;font-weight:600">${e.score}/10</td>
        <td style="text-align:center">${e.emocion_predominante}</td>
        <td style="text-align:center;color:${e.sesiones_pendientes > 0 ? '#B91C1C' : '#6B7280'};font-weight:${e.sesiones_pendientes > 0 ? 600 : 400}">
          ${e.sesiones_pendientes > 0 ? e.sesiones_pendientes : '—'}
        </td>
      </tr>`)
      .join('');

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Reporte A.B.E.D. — ${meta?.ciclo ?? ''}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #111827; padding: 32px; }
    .report-header { border-bottom: 2px solid #2563EB; padding-bottom: 16px; margin-bottom: 20px; }
    .report-header h1 { font-size: 22px; color: #111827; }
    .report-header .subtitle { font-size: 11px; color: #9CA3AF; margin-top: 4px; }
    .kpis { display: flex; gap: 12px; margin: 16px 0 24px; }
    .kpi  { flex: 1; border: 1px solid #E5E7EB; border-radius: 6px; padding: 14px; }
    .kpi .label { font-size: 9px; text-transform: uppercase; letter-spacing: .06em; color: #9CA3AF; margin-bottom: 6px; }
    .kpi .value { font-size: 32px; font-weight: 700; line-height: 1; }
    .kpi .sub   { font-size: 10px; color: #9CA3AF; margin-top: 4px; }
    h2 { font-size: 13px; font-weight: 700; color: #111827; border-bottom: 1px solid #E5E7EB;
         padding-bottom: 6px; margin: 24px 0 10px; text-transform: uppercase; letter-spacing: .05em; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #F9FAFB; font-size: 10px; text-transform: uppercase; letter-spacing: .05em;
         color: #6B7280; padding: 8px 10px; text-align: left; border-bottom: 2px solid #E5E7EB; }
    td { padding: 9px 10px; border-bottom: 1px solid #F3F4F6; font-size: 12px; vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #E5E7EB;
              font-size: 10px; color: #9CA3AF; text-align: center; }
    @media print {
      body { padding: 16px; }
      .kpi .value { font-size: 24px; }
    }
  </style>
</head>
<body>
  <div class="report-header">
    <h1>&#x1F4CA; Reporte de Bienestar Estudiantil — A.B.E.D.</h1>
    <p class="subtitle">Ciclo ${meta?.ciclo ?? '—'} &nbsp;·&nbsp; Grupo de ${total} estudiantes &nbsp;·&nbsp; Generado: ${now}</p>
  </div>
  <h2>Indicadores Clave</h2>
  <div class="kpis">
    <div class="kpi">
      <div class="label">Riesgo Alto</div>
      <div class="value" style="color:#EF4444">${Math.round((highRisk / total) * 100)}%</div>
      <div class="sub">${highRisk} estudiantes</div>
    </div>
    <div class="kpi">
      <div class="label">Riesgo Medio</div>
      <div class="value" style="color:#F59E0B">${Math.round((medRisk / total) * 100)}%</div>
      <div class="sub">${medRisk} estudiantes</div>
    </div>
    <div class="kpi">
      <div class="label">Riesgo Bajo</div>
      <div class="value" style="color:#10B981">${Math.round((lowRisk / total) * 100)}%</div>
      <div class="sub">${lowRisk} estudiantes</div>
    </div>
    <div class="kpi">
      <div class="label">Alertas Activas</div>
      <div class="value" style="color:#F59E0B">${alertas}</div>
      <div class="sub">sesiones pendientes</div>
    </div>
    <div class="kpi">
      <div class="label">Media de Bienestar</div>
      <div class="value" style="color:#2563EB">${avgScore}</div>
      <div class="sub">/ 10.0 puntos</div>
    </div>
  </div>
  <h2>Clima Emocional del Grupo</h2>
  <table>
    <thead><tr><th>Emoción</th><th>% del Grupo</th></tr></thead>
    <tbody>${emotionRows}</tbody>
  </table>
  <h2>Asistencia Semanal Promedio</h2>
  <table>
    <thead><tr><th>Semana</th><th>Asistencia</th><th>Ausencia</th></tr></thead>
    <tbody>${attendanceRows}</tbody>
  </table>
  <h2>Listado Completo de Estudiantes</h2>
  <table>
    <thead>
      <tr>
        <th>ID</th><th>Nombre</th><th>Matrícula</th><th>Horario</th>
        <th>Nivel de Riesgo</th><th>Índice Bienestar</th><th>Emoción</th><th>Sesiones Pend.</th>
      </tr>
    </thead>
    <tbody>${studentRows}</tbody>
  </table>
  <div class="footer">Sistema A.B.E.D. — Bienestar Estudiantil &nbsp;·&nbsp; Reporte generado automáticamente &nbsp;·&nbsp; ${now}</div>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=1000,height=750');
    if (!win) {
      alert('Permite las ventanas emergentes para generar el reporte PDF.');
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  }

  if (loading) return <LoadingSkeleton />;
  if (error)   return (
    <div className="p-8 text-center" style={{ color: '#EF4444', fontSize: '14px' }}>
      Error al cargar datos: {error}
    </div>
  );

  const meta = data!.meta;
  const fechaActualizacion = new Date(meta.actualizacion).toLocaleString('es-MX', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="p-8" style={{ maxWidth: '1280px', margin: '0 auto' }}>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#111827' }}>
            Tablero de Dirección
          </h1>
          <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>
            Ciclo {meta.ciclo} · {estudiantes.length} estudiantes · Última actualización {fechaActualizacion}
          </p>
        </div>
        <button
          onClick={exportPDF}
          className="flex items-center gap-2 hover:bg-[#EFF6FF] transition-colors"
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: COBALT,
            border: `1px solid ${COBALT}`,
            borderRadius: '4px',
            padding: '8px 16px',
            backgroundColor: 'transparent',
          }}
        >
          <Download size={14} />
          Exportar Reporte
        </button>
      </div>

      <div className="grid grid-cols-12 gap-4 mb-6">
        {kpiData.map((kpi, i) => (
          <div
            key={i}
            className="col-span-4 bg-white"
            style={{ border: `1px solid ${BORDER}`, borderRadius: '4px', padding: '24px' }}
          >
            <div className="flex items-start justify-between mb-3">
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  color: '#9CA3AF',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                {kpi.label}
              </span>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: kpi.color,
                  marginTop: '3px',
                  flexShrink: 0,
                }}
              />
            </div>
            <div className="flex items-baseline gap-2">
              <span style={{ fontSize: '44px', fontWeight: 700, color: '#111827', lineHeight: 1 }}>
                {kpi.value}
              </span>
              <span style={{ fontSize: '14px', color: '#9CA3AF' }}>{kpi.sub}</span>
            </div>
            <div className="flex items-center gap-1 mt-3">
              {kpi.up ? (
                <TrendingUp size={12} style={{ color: kpi.color === '#EF4444' ? '#EF4444' : '#10B981' }} />
              ) : (
                <TrendingDown size={12} style={{ color: '#10B981' }} />
              )}
              <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{kpi.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div
          className="col-span-5 bg-white"
          style={{ border: `1px solid ${BORDER}`, borderRadius: '4px', padding: '24px' }}
        >
          <div className="mb-2">
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>Clima Emocional</h3>
            <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
              Distribución del grupo · {estudiantes.length} estudiantes
            </p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={emotionalData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                dataKey="value"
                paddingAngle={2}
              >
                {emotionalData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  border: `1px solid ${BORDER}`,
                  borderRadius: '4px',
                  fontSize: '12px',
                  boxShadow: 'none',
                }}
                formatter={(value) => [`${value}%`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
            {emotionalData.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    backgroundColor: item.color,
                    borderRadius: '2px',
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: '12px', color: '#6B7280', flex: 1 }}>{item.name}</span>
                <span style={{ fontSize: '12px', color: '#111827', fontWeight: 500 }}>{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        <div
          className="col-span-7 bg-white"
          style={{ border: `1px solid ${BORDER}`, borderRadius: '4px', padding: '24px' }}
        >
          <div className="mb-4">
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>Asistencia Semanal</h3>
            <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
              Promedio del grupo · Últimas {attendanceData.length} semanas
            </p>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={attendanceData} barSize={22} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis
                dataKey="semana"
                tick={{ fontSize: 12, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  border: `1px solid ${BORDER}`,
                  borderRadius: '4px',
                  fontSize: '12px',
                  boxShadow: 'none',
                }}
                formatter={(value) => [`${value}%`, '']}
              />
              <Bar dataKey="asistencia" name="Asistencia" fill={COBALT} radius={[2, 2, 0, 0]} />
              <Bar dataKey="ausencia" name="Ausencia" fill="#E5E7EB" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-6 mt-2">
            <div className="flex items-center gap-2">
              <div style={{ width: '10px', height: '10px', backgroundColor: COBALT, borderRadius: '2px' }} />
              <span style={{ fontSize: '12px', color: '#6B7280' }}>Asistencia</span>
            </div>
            <div className="flex items-center gap-2">
              <div style={{ width: '10px', height: '10px', backgroundColor: '#E5E7EB', borderRadius: '2px', border: '1px solid #D1D5DB' }} />
              <span style={{ fontSize: '12px', color: '#6B7280' }}>Ausencia</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
