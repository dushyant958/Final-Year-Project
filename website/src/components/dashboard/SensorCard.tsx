import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import {
  Thermometer,
  Drop,
  Gauge,
  Fire,
  Flask,
  CloudFog,
  Atom,
  Cube,
} from '@phosphor-icons/react';
import type { ComponentType } from 'react';

interface Props {
  label: string;
  unit: string;
  value: number | null;
  color?: string;
  icon: string;
  decimals?: number;
  index?: number;
}

const ICON_MAP: Record<string, ComponentType<{ size?: number; weight?: 'thin'; className?: string }>> = {
  '🌡': Thermometer,
  '💧': Drop,
  '🔵': Gauge,
  '🟤': CloudFog,
  '🟡': Flask,
  '🔴': Fire,
  '🧪': Atom,
};

export function SensorCard({ label, unit, value, icon, decimals = 1, index = 0 }: Props) {
  const IconComp = ICON_MAP[icon] ?? Cube;

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
      style={{
        // hover glow handled via CSS below
      }}
    >
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary opacity-60" />

      {/* Header: icon + label */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-dm">
          {label}
        </span>
        <IconComp size={18} weight="thin" className="text-dsc" />
      </div>

      {/* Value */}
      <div>
        <div className="font-display text-3xl font-bold tracking-tight text-dh">
          {value !== null ? value.toFixed(decimals) : '\u2014'}
        </div>
        <div className="text-[10px] font-mono text-dm mt-1">{unit}</div>
      </div>

      {/* Hover glow style */}
      <style>{`
        .group:hover {
          box-shadow: 0 0 0 1px rgba(255,64,64,0.2), 0 0 24px rgba(255,64,64,0.08);
        }
      `}</style>
    </motion.div>
  );
}
