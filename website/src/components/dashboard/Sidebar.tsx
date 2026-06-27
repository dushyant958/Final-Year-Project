import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  SquaresFour,
  Pulse,
  ChartBar,
  TrendUp,
  Bell,
  GearSix,
  Wrench,
  MapPin,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/dashboard', icon: SquaresFour, label: 'Dashboard' },
  { to: '/dashboard/live', icon: Pulse, label: 'Live Data' },
  { to: '/dashboard/history', icon: ChartBar, label: 'Historical' },
  { to: '/dashboard/trends', icon: TrendUp, label: 'Trends' },
  { to: '/dashboard/alerts', icon: Bell, label: 'Alerts' },
  { to: '/dashboard/system', icon: GearSix, label: 'System Info' },
  { to: '/dashboard/settings', icon: Wrench, label: 'Settings' },
];

interface Props {
  online: boolean;
}

export function Sidebar({ online }: Props) {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-dbg hidden lg:flex flex-col z-40 border-r border-dotted border-db">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-dotted border-db">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-none bg-primary flex items-center justify-center text-white font-black text-sm">
            AQI
          </div>
          <div>
            <p className="font-mono tracking-[0.28em] text-[10px] uppercase text-dm">
              MONITOR
            </p>
          </div>
        </div>
      </div>

      {/* Diamond divider */}
      <div className="flex items-center justify-center gap-2 py-3 px-5">
        <div className="flex-1 h-px border-b border-dotted border-db" />
        <span className="text-dm text-[8px] rotate-45">&#9670;</span>
        <div className="flex-1 h-px border-b border-dotted border-db" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 flex flex-col gap-0.5 overflow-y-auto">
        {NAV.map((item) => {
          const isActive =
            item.to === '/dashboard'
              ? location.pathname === '/dashboard'
              : location.pathname.startsWith(item.to);
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              className={cn(
                'relative flex items-center gap-3 px-4 py-3 text-sm transition-all duration-150 cursor-pointer rounded-none',
                isActive
                  ? 'text-dh font-semibold bg-de'
                  : 'text-dsc hover:text-dh hover:bg-de'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <Icon weight="thin" className="h-4 w-4 shrink-0" />
              <span className="font-mono text-[12px] tracking-wide">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-4 py-4 border-t border-dotted border-db">
        {/* Location */}
        <div className="flex items-center gap-2 mb-2">
          <MapPin weight="thin" className="h-3.5 w-3.5 text-dm shrink-0" />
          <span className="text-[10px] font-mono text-dm">Pimpri, Pune</span>
        </div>

        {/* Version */}
        <div className="text-[9px] font-mono text-dm">
          v1.0.3 &middot; m2cgen XGBoost
        </div>
      </div>
    </aside>
  );
}
