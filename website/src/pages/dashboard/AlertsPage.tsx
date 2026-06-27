import { motion } from 'motion/react';
import { useOutletContext } from 'react-router-dom';
import { Warning } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { AQI_CATEGORIES } from '../../lib/aqi';

type DashboardContext = {
  latest: any;
  history: any[];
  loading: boolean;
  error: boolean;
  lastUpdated: Date | null;
  refresh: () => void;
  aqi: number;
  cat: any;
  online: boolean;
};

const HEALTH_ADVISORIES: Record<string, string> = {
  Good: 'Air quality is great',
  Satisfactory: 'Acceptable for most',
  Moderate: 'Sensitive groups may be affected',
  Poor: 'Everyone may experience effects',
  'Very Poor': 'Health warnings issued',
  Severe: 'Emergency conditions',
};

export default function AlertsPage() {
  const { cat: currentCat } = useOutletContext<DashboardContext>();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2">
        <Warning weight="thin" className="h-5 w-5 text-primary" />
        <h2 className="text-[11px] font-mono font-semibold uppercase tracking-widest text-primary">
          Alert Thresholds
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {AQI_CATEGORIES.map((cat, idx) => {
          const isActive = currentCat?.label === cat.label;
          return (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                'bg-ds border border-dotted border-db p-6 border-l-4',
                'hover:-translate-y-px transition-transform',
                isActive && 'bg-de'
              )}
              style={{
                borderLeftColor: cat.color,
                borderRadius: 0,
                boxShadow: isActive ? `0 4px 20px ${cat.color}25` : 'none',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  `0 4px 20px ${cat.color}30`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = isActive
                  ? `0 4px 20px ${cat.color}25`
                  : 'none';
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3
                  className="font-display font-bold text-lg tracking-tight"
                  style={{ color: cat.color }}
                >
                  {cat.label}
                </h3>
                {isActive && (
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5">
                    Current
                  </span>
                )}
              </div>
              <p className="text-[11px] font-mono text-dm mb-3">
                AQI {cat.min} &ndash; {cat.max}
              </p>
              <p className="text-sm text-dbd leading-relaxed">
                {HEALTH_ADVISORIES[cat.label]}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
