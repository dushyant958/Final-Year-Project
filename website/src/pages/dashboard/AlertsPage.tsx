import { useState } from 'react';
import { motion } from 'motion/react';
import { useOutletContext } from 'react-router-dom';
import { Warning, WarningCircle, X } from '@phosphor-icons/react';
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
  Good: 'Air quality is great. Enjoy outdoor activities freely.',
  Satisfactory: 'Acceptable for most. Unusually sensitive people should reduce prolonged outdoor exertion.',
  Moderate: 'Sensitive groups may experience health effects. General public is less likely to be affected.',
  Poor: 'Everyone may begin to experience health effects. Limit prolonged outdoor exertion.',
  'Very Poor': 'Health warnings of emergency conditions. Reduce time outdoors, especially for children and elderly.',
  Severe: 'Emergency conditions. Avoid all outdoor activity. Wear N95 mask if going out.',
};

const ALERT_MESSAGES = [
  { minAqi: 201, message: 'AQI exceeds 200 \u2014 limit outdoor activity' },
  { minAqi: 301, message: 'AQI exceeds 300 \u2014 close windows, use air purifier' },
  { minAqi: 401, message: 'AQI exceeds 400 \u2014 emergency conditions, stay indoors' },
];

export default function AlertsPage() {
  const { aqi, cat: currentCat } = useOutletContext<DashboardContext>();
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  const activeAlerts = ALERT_MESSAGES.filter(a => (aqi ?? 0) >= a.minAqi && !dismissed.has(a.minAqi));
  const totalAlerts = ALERT_MESSAGES.filter(a => (aqi ?? 0) >= a.minAqi).length;

  const dismiss = (minAqi: number) => {
    setDismissed(prev => new Set(prev).add(minAqi));
  };

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

      {/* Alert summary */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="bg-ds border border-dotted border-db p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-dm mb-1">
              Active Alerts
            </p>
            <p className="font-display text-4xl font-bold text-dh tracking-tight">
              {totalAlerts}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-dm uppercase tracking-widest mb-1">Current AQI</p>
            <p className="font-display text-2xl font-bold" style={{ color: currentCat?.color }}>
              {aqi ?? '\u2014'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Dismissible alerts */}
      {activeAlerts.length > 0 && (
        <div className="space-y-3">
          {activeAlerts.map((alert, idx) => (
            <motion.div
              key={alert.minAqi}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 + idx * 0.06, duration: 0.3 }}
              className="bg-ds p-4 flex items-center gap-3"
            >
              <WarningCircle weight="fill" className="h-5 w-5 text-[#ef4444] shrink-0" />
              <span className="text-sm text-dbd flex-1">{alert.message}</span>
              <button
                onClick={() => dismiss(alert.minAqi)}
                className="text-dm hover:text-dh transition-colors p-1"
              >
                <X weight="bold" className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* AQI category cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {AQI_CATEGORIES.map((cat, idx) => {
          const isActive = currentCat?.label === cat.label;
          return (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + idx * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={`bg-ds border border-dotted border-db p-6 border-l-4 hover:-translate-y-px transition-transform ${isActive ? 'bg-de' : ''}`}
              style={{
                borderLeftColor: cat.color,
                boxShadow: isActive ? `0 4px 20px ${cat.color}25` : 'none',
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
