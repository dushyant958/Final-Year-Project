import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import {
  Thermometer,
  Drop,
  Gauge,
  Fire,
  Flask,
  CloudFog,
  TestTube,
} from '@phosphor-icons/react';
import type { ComponentType } from 'react';

interface Props {
  label: string;
  unit: string;
  value: number | null;
  color?: string;
  decimals?: number;
  index?: number;
}

const LABEL_ICON_MAP: Record<string, ComponentType<{ size?: number; weight?: 'thin'; className?: string }>> = {
  'CO': Fire,
  'NH₃': Flask,
  'Benzene': TestTube,
  'Smoke / PM2.5': CloudFog,
  'Temperature': Thermometer,
  'Humidity': Drop,
  'Pressure': Gauge,
};

export function SensorCard({ label, unit, value, color, decimals = 1, index = 0 }: Props) {
  const IconComp = LABEL_ICON_MAP[label] ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'relative bg-ds border border-dotted border-db p-5 group cursor-default',
        'flex flex-col gap-3 rounded-none',
        'transition-transform duration-200',
        'hover:-translate-y-px'
      )}
    >
      {/* Top accent bar — uses sensor's own color */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-60"
        style={{ backgroundColor: color ?? '#666666' }}
      />

      {/* Header: icon + label */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-dm">
          {label}
        </span>
        {IconComp && <IconComp size={18} weight="thin" className="text-dsc" />}
      </div>

      {/* Value */}
      <div>
        <div className="font-display text-3xl font-bold tracking-tight text-dh">
          {value !== null ? value.toFixed(decimals) : '\u2014'}
        </div>
        <div className="text-[10px] font-mono text-dm mt-1">{unit}</div>
      </div>
    </motion.div>
  );
}
