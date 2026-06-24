import { NavLink } from 'react-router-dom';

const NAV = [
  { to: '/dashboard',          icon: '⊞', label: 'Dashboard' },
  { to: '/dashboard/live',     icon: '◉', label: 'Live Data' },
  { to: '/dashboard/history',  icon: '▤', label: 'Historical' },
  { to: '/dashboard/trends',   icon: '⌇', label: 'Trends' },
  { to: '/dashboard/alerts',   icon: '⚑', label: 'Alerts' },
  { to: '/dashboard/system',   icon: '⊙', label: 'System Info' },
  { to: '/dashboard/settings', icon: '⚙', label: 'Settings' },
];

interface Props { online: boolean; }

export function Sidebar({ online }: Props) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[215px] bg-[#0d1117] flex flex-col z-40 border-r border-[rgba(255,255,255,0.05)]">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[rgba(255,255,255,0.05)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">A</div>
          <div>
            <p className="text-white font-bold text-sm leading-none">AQI Monitor</p>
            <p className="text-[10px] text-gray-500 mt-0.5">IoT Air Quality System</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[rgba(255,255,255,0.05)]'
              }`
            }
          >
            <span className="text-base w-5 text-center">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Status */}
      <div className="px-4 py-4 border-t border-[rgba(255,255,255,0.05)]">
        {[
          { label: 'STM32 Node',    ok: online },
          { label: 'ESP32 Gateway', ok: online },
          { label: 'Sensors',       ok: online },
          { label: 'Cloud Upload',  ok: online },
        ].map(s => (
          <div key={s.label} className="flex items-center justify-between py-1">
            <span className="text-[11px] text-gray-500">{s.label}</span>
            <span className={`w-2 h-2 rounded-full ${s.ok ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
        ))}
        <div className="mt-3 text-[10px] text-gray-600">v1.0.3 · m2cgen XGBoost</div>
      </div>
    </aside>
  );
}
