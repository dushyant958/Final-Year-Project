import { getAQICategory } from '../../lib/aqi';

interface Props { aqi: number; }

const CX = 150, CY = 140, R = 110, STROKE = 22;

const SEGMENTS = [
  { min: 0,   max: 50,  color: '#22c55e' },
  { min: 50,  max: 100, color: '#a3e635' },
  { min: 100, max: 200, color: '#f59e0b' },
  { min: 200, max: 300, color: '#ef4444' },
  { min: 300, max: 400, color: '#a855f7' },
  { min: 400, max: 500, color: '#7f1d1d' },
];

const TICKS = [0, 50, 100, 200, 300, 400, 500];

function angleForAqi(val: number) {
  return Math.PI - (Math.min(500, Math.max(0, val)) / 500) * Math.PI;
}

function pointOnArc(val: number, r: number) {
  const a = angleForAqi(val);
  return { x: CX + r * Math.cos(a), y: CY - r * Math.sin(a) };
}

function describeArc(start: number, end: number, r: number) {
  const s = pointOnArc(start, r);
  const e = pointOnArc(end, r);
  const sweep = ((end - start) / 500) * Math.PI;
  const large = sweep > Math.PI / 2 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`;
}

export function AQIGauge({ aqi }: Props) {
  const cat = getAQICategory(aqi);
  const needle = angleForAqi(aqi);
  const needleLen = R - 8;
  const nx = CX + needleLen * Math.cos(needle);
  const ny = CY - needleLen * Math.sin(needle);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 300 170" className="w-full max-w-xs select-none">
        {/* Background track */}
        <path d={describeArc(0, 500, R)} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={STROKE} strokeLinecap="butt" />

        {/* Colored segments */}
        {SEGMENTS.map(s => (
          <path key={s.min} d={describeArc(s.min, s.max, R)} fill="none" stroke={s.color} strokeWidth={STROKE} strokeLinecap="butt" opacity={0.85} />
        ))}

        {/* Segment divider lines */}
        {TICKS.slice(1, -1).map(t => {
          const p1 = pointOnArc(t, R - STROKE / 2 - 1);
          const p2 = pointOnArc(t, R + STROKE / 2 + 1);
          return <line key={t} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#111114" strokeWidth="2" />;
        })}

        {/* Tick labels */}
        {TICKS.map(t => {
          const pt = pointOnArc(t, R + STROKE / 2 + 14);
          return (
            <text key={t} x={pt.x} y={pt.y} textAnchor="middle" dominantBaseline="middle"
              fontSize="8" fill="#666" fontFamily="'Geist Mono', monospace" fontWeight="600">
              {t}
            </text>
          );
        })}

        {/* Needle */}
        <line x1={CX} y1={CY} x2={nx} y2={ny} stroke="#f5f5f5" strokeWidth="2" strokeLinecap="round" />
        <circle cx={CX} cy={CY} r="6" fill="#111114" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
        <circle cx={CX} cy={CY} r="2.5" fill={cat.color} />
      </svg>

      {/* AQI value */}
      <div className="text-center -mt-1">
        <div className="font-display font-bold text-4xl tracking-tight" style={{ color: cat.color }}>
          {Math.round(aqi)}
        </div>
        <div className="text-[10px] font-mono font-bold uppercase tracking-widest mt-0.5" style={{ color: cat.color }}>
          {cat.label}
        </div>
      </div>
    </div>
  );
}
