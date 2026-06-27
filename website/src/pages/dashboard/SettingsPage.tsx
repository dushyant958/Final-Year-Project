import { motion } from 'motion/react';
import { useOutletContext } from 'react-router-dom';
import { GearSix } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

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

const SETTINGS = [
  {
    label: 'Refresh Interval',
    value: '30 seconds',
  },
  {
    label: 'Location',
    value: 'Pimpri, Pune',
  },
  {
    label: 'City Mean AQI',
    value: '103.7 (Mumbai baseline)',
  },
  {
    label: 'Data Endpoint',
    value: 'https://s3.in-west3.purestore.io/aqi-data/latest.json',
  },
];

export default function SettingsPage() {
  useOutletContext<DashboardContext>();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2">
        <GearSix weight="thin" className="h-5 w-5 text-primary" />
        <h2 className="text-[11px] font-mono font-semibold uppercase tracking-widest text-primary">
          Settings
        </h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'bg-ds border border-dotted border-db p-6',
          'hover:-translate-y-px transition-transform'
        )}
        style={{ borderRadius: 0 }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow =
            '0 4px 20px rgba(255,64,64,0.15)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = 'none';
        }}
      >
        <div className="divide-y-0">
          {SETTINGS.map((setting, idx) => (
            <motion.div
              key={setting.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 + idx * 0.08, duration: 0.3 }}
              className="border-b border-dotted border-db py-4 first:pt-0 last:border-0 last:pb-0"
            >
              <p className="text-[10px] font-mono text-dm uppercase tracking-widest mb-1">
                {setting.label}
              </p>
              <p className="text-sm text-dbd">{setting.value}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
