import { motion } from 'motion/react';
import { useOutletContext } from 'react-router-dom';
import { Cpu, WifiHigh, Thermometer, Brain, Cloud, Code } from '@phosphor-icons/react';
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

const SYSTEM_INFO = [
  {
    icon: Cpu,
    title: 'MCU',
    details: [
      { label: 'Chip', value: 'STM32F407VG' },
      { label: 'Core', value: 'ARM Cortex-M4' },
      { label: 'Clock', value: '168 MHz' },
    ],
  },
  {
    icon: WifiHigh,
    title: 'Gateway',
    details: [
      { label: 'Module', value: 'ESP32-WROOM-32' },
      { label: 'Protocol', value: 'Wi-Fi 802.11 b/g/n' },
    ],
  },
  {
    icon: Thermometer,
    title: 'Sensors',
    details: [
      { label: 'MQ-7', value: 'CO' },
      { label: 'MQ-135', value: 'NH\u2083 / Benzene / Smoke' },
      { label: 'BME680', value: 'T / H / P' },
    ],
  },
  {
    icon: Brain,
    title: 'ML Model',
    details: [
      { label: 'Algorithm', value: 'XGBoost' },
      { label: 'Features', value: '14 features' },
      { label: 'Accuracy', value: 'R\u00b2 = 0.86' },
    ],
  },
  {
    icon: Cloud,
    title: 'Cloud',
    details: [
      { label: 'Provider', value: 'CloudPe S3' },
      { label: 'Region', value: 'in-west3' },
    ],
  },
  {
    icon: Code,
    title: 'Firmware',
    details: [
      { label: 'Version', value: 'v1.0.3' },
      { label: 'ML Runtime', value: 'm2cgen compiled' },
    ],
  },
];

export default function SystemPage() {
  useOutletContext<DashboardContext>();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2">
        <Cpu weight="thin" className="h-5 w-5 text-primary" />
        <h2 className="text-[11px] font-mono font-semibold uppercase tracking-widest text-primary">
          System Information
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {SYSTEM_INFO.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
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
              <div className="flex items-center gap-3 mb-4">
                <Icon weight="thin" className="h-6 w-6 text-primary" />
                <h3 className="font-display font-bold text-lg tracking-tight text-dh">
                  {item.title}
                </h3>
              </div>
              <div className="space-y-2">
                {item.details.map((detail) => (
                  <div
                    key={detail.label}
                    className="flex justify-between items-center text-xs border-b border-dotted border-db pb-2 last:border-0 last:pb-0"
                  >
                    <span className="text-dm font-mono">{detail.label}</span>
                    <span className="text-dbd font-medium">{detail.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
