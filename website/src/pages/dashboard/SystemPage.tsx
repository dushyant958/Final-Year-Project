import { motion } from 'motion/react';
import { useOutletContext } from 'react-router-dom';
import { Cpu, ListBullets, Brain, ChartBar, CloudArrowUp } from '@phosphor-icons/react';

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

const PIPELINE_STEPS = [
  { icon: Cpu, label: 'Sensor Read' },
  { icon: ListBullets, label: 'Feature Vector' },
  { icon: Brain, label: 'XGBoost Inference' },
  { icon: ChartBar, label: 'AQI Output' },
  { icon: CloudArrowUp, label: 'ESP32 Upload' },
];

const HARDWARE_CARDS = [
  {
    title: 'STM32F407VGT6',
    details: [
      { label: 'Core', value: 'ARM Cortex-M4' },
      { label: 'Clock Speed', value: '168 MHz' },
      { label: 'Flash Memory', value: '1 MB' },
      { label: 'SRAM', value: '192 KB' },
      { label: 'ADC Resolution', value: '12-bit' },
    ],
  },
  {
    title: 'ESP32-WROOM-32',
    details: [
      { label: 'Core', value: 'Xtensa LX6' },
      { label: 'Clock Speed', value: '240 MHz' },
      { label: 'Connectivity', value: 'Wi-Fi 802.11 b/g/n' },
      { label: 'UART Baud', value: '115200' },
    ],
  },
  {
    title: 'XGBoost Model',
    details: [
      { label: 'Features', value: '14 features' },
      { label: 'Trees', value: '6000 trees' },
      { label: 'R\u00b2 Score', value: '0.8606' },
      { label: 'MAE', value: '25.67' },
      { label: 'Inference', value: '<1 ms' },
    ],
  },
  {
    title: 'Sensor Suite',
    details: [
      { label: 'MQ-7', value: 'CO' },
      { label: 'MQ-135', value: 'NH\u2083 / Benzene / Smoke' },
      { label: 'BME680', value: 'T / H / P' },
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

      {/* Data Pipeline */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="bg-ds border border-dotted border-db p-6"
      >
        <p className="text-[11px] font-mono font-semibold uppercase tracking-widest text-primary mb-6">
          Data Pipeline
        </p>
        <div className="flex items-center gap-0 overflow-x-auto">
          {PIPELINE_STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={step.label} className="flex items-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 + idx * 0.1, duration: 0.3 }}
                  className="bg-ds border border-dotted border-db p-4 flex flex-col items-center gap-2 min-w-[120px]"
                >
                  <Icon weight="thin" className="h-6 w-6 text-primary" />
                  <span className="text-[10px] font-mono text-dbd text-center whitespace-nowrap">
                    {step.label}
                  </span>
                </motion.div>
                {idx < PIPELINE_STEPS.length - 1 && (
                  <div className="flex-1 min-w-[24px] border-t border-dotted border-db self-center" />
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Hardware Cards 2x2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {HARDWARE_CARDS.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + idx * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="bg-ds border border-dotted border-db p-6 hover:-translate-y-px transition-transform"
          >
            <h3 className="font-display font-bold text-lg tracking-tight text-dh mb-4">
              {card.title}
            </h3>
            <div className="space-y-2">
              {card.details.map((detail) => (
                <div
                  key={detail.label}
                  className="flex justify-between items-center text-xs border-b border-dotted border-db pb-2 last:border-0 last:pb-0"
                >
                  <span className="font-mono text-dm">{detail.label}</span>
                  <span className="text-dbd font-medium">{detail.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
