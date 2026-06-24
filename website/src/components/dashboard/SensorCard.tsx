interface Props {
  label: string;
  unit: string;
  value: number | null;
  color?: string;
  icon: string;
  decimals?: number;
}

export function SensorCard({ label, unit, value, color = '#60a5fa', icon, decimals = 1 }: Props) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-3 border border-gray-100">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest uppercase" style={{ color }}>
          {label}
        </span>
        <span className="text-xl">{icon}</span>
      </div>
      <div>
        <div className="text-3xl font-black tracking-tight text-gray-900">
          {value !== null ? value.toFixed(decimals) : '—'}
        </div>
        <div className="text-xs text-gray-400 mt-1 tracking-wide">{unit}</div>
      </div>
    </div>
  );
}
