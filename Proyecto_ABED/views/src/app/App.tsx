import { useState } from 'react';
import { Screen1Dashboard } from './components/Screen1Dashboard';
import { Screen2Orientacion } from './components/Screen2Orientacion';
import { Screen3Consola } from './components/Screen3Consola';
import { Screen4Historico } from './components/Screen4Historico';

const COBALT = '#2563EB';
const BORDER = '#E5E7EB';

type Screen = 'dashboard' | 'orientacion' | 'historico' | 'consola';

const NAV_ITEMS: { key: Screen; label: string; badge?: string }[] = [
  { key: 'dashboard',   label: 'Tablero de Dirección' },
  { key: 'orientacion', label: 'Gestión de Orientación', badge: '3' },
  { key: 'consola',     label: 'Consola Técnica de IA' },
];

export default function App() {
  const [screen, setScreen] = useState<Screen>('dashboard');

  return (
    <div
      className="flex flex-col"
      style={{ width: '100vw', height: '100vh', backgroundColor: '#F9FAFB', fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      {/* ── Global header ── */}
      <header
        className="flex items-center justify-between shrink-0 bg-white"
        style={{ height: '56px', borderBottom: `1px solid ${BORDER}`, padding: '0 32px' }}
      >
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div
              style={{
                width: '20px',
                height: '20px',
                backgroundColor: COBALT,
                borderRadius: '4px',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#111827',
                letterSpacing: '0.04em',
              }}
            >
              A.B.E.D. System
            </span>
          </div>

          <nav className="flex items-center">
            {NAV_ITEMS.map((item) => {
              const active = screen === item.key ||
                (item.key === 'orientacion' && screen === 'historico');
              return (
                <button
                  key={item.key}
                  onClick={() => setScreen(item.key)}
                  className="relative flex items-center gap-2 transition-colors"
                  style={{
                    fontSize: '13px',
                    fontWeight: active ? 500 : 400,
                    color: active ? COBALT : '#6B7280',
                    padding: '0 16px',
                    height: '56px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: active ? `2px solid ${COBALT}` : '2px solid transparent',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.label}
                  {item.badge && (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 500,
                        color: '#EF4444',
                        backgroundColor: '#FEF2F2',
                        border: '1px solid #FECACA',
                        borderRadius: '10px',
                        padding: '1px 6px',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>


      </header>

      <main className="flex-1 overflow-hidden">
        {screen === 'dashboard'   && <div className="h-full overflow-y-auto"><Screen1Dashboard /></div>}
        {screen === 'orientacion' && (
          <Screen2Orientacion onNavigateHistorico={() => setScreen('historico')} />
        )}
        {screen === 'historico'   && (
          <Screen4Historico onBack={() => setScreen('orientacion')} />
        )}
        {screen === 'consola'     && <Screen3Consola />}
      </main>
    </div>
  );
}
