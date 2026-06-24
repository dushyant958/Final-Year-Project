import { getAQICategory } from '../../lib/aqi';

interface Props { aqi: number; }

const CX = 200, CY = 190, R_OUT = 155, R_IN = 100;

function toPoint(aqiVal: number, r: number) {
  const angle = Math.PI - (Math.min(500, Math.max(0, aqiVal)) / 500) * Math.PI;
  return { x: CX + r * Math.cos(angle), y: CY - r * Math.sin(angle) };
}

function arcPath(a1: number, a2: number, ro: number, ri: number) {
  const o1 = toPoint(a1, ro), o2 = toPoint(a2, ro);
  const i1 = toPoint(a1, ri), i2 = toPoint(a2, ri);
  const large = (a2 - a1) / 500 > 0.5 ? 1 : 0;
  return `M ${o1.x} ${o1.y} A ${ro} ${ro} 0 ${large} 0 ${o2.x} ${o2.y} L ${i2.x} ${i2.y} A ${ri} ${ri} 0 ${large} 1 ${i1.x} ${i1.y} Z`;
}

const SEGMENTS = [
  { min: 0,   max: 50,  color: '#16a34a' },
  { min: 50,  max: 100, color: '#65a30d' },
  { min: 100, max: 200, color: '#d97706' },
  { min: 200, max: 300, color: '#dc2626' },
  { min: 300, max: 400, color: '#9333ea' },
  { min: 400, max: 500, color: '#7f1d1d' },
];

const LABELS = [
  { aqi: 0,   label: 'Good',       sub: '0' },
  { aqi: 50,  label: 'Satisfact.',  sub: '50' },
  { aqi: 100, label: 'Moderate',   sub: '100' },
  { aqi: 200, label: 'Poor',       sub: '200' },
  { aqi: 300, label: 'Very Poor',  sub: '300' },
  { aqi: 400, label: 'Severe',     sub: '400' },
  { aqi: 500, label: '',           sub: '500' },
];

export function AQIGauge({ aqi }: Props) {
  const cat = getAQICategory(aqi);

  // Needle
  const needleAngle = Math.PI - (Math.min(500, Math.max(0, aqi)) / 500) * Math.PI;
  const nLen = R_OUT - 8;
  const nx = CX + nLen * Math.cos(needleAngle);
  const ny = CY - nLen * Math.sin(needleAngle);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 400 215" className="w-full max-w-md select-none">
        {/* Segments */}
        {SEGMENTS.map(s => (
          <path key={s.min} d={arcPath(s.min, s.max, R_OUT, R_IN)} fill={s.color} opacity={0.9} />
        ))}

        {/* Outer ring border */}
        <path
          d={`M ${toPoint(0, R_OUT).x} ${toPoint(0, R_OUT).y} A ${R_OUT} ${R_OUT} 0 0 0 ${toPoint(500, R_OUT).x} ${toPoint(500, R_OUT).y}`}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"
        />

        {/* Tick labels */}
        {LABELS.map(l => {
          const pt = toPoint(l.aqi, R_OUT + 18);
          return (
            <text key={l.aqi} x={pt.x} y={pt.y} textAnchor="middle" dominantBaseline="middle"
              fontSize="9" fill="rgba(150,170,200,0.6)" fontFamily="system-ui">
              {l.sub}
            </text>
          );
        })}

        {/* Needle */}
        <line x1={CX} y1={CY} x2={nx} y2={ny}
          stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 4px rgba(200,220,255,0.4))' }} />
        <circle cx={CX} cy={CY} r={10} fill="#1e293b" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
        <circle cx={CX} cy={CY} r={4} fill={cat.color} />
      </svg>

      {/* AQI number */}
      <div className="text-center -mt-2">
        <div className="text-6xl font-black tracking-tight" style={{ color: cat.color }}>
          {Math.round(aqi)}
        </div>
        <div className="text-sm font-bold mt-1 tracking-widest uppercase" style={{ color: cat.color }}>
          {cat.label}
        </div>
      </div>
    </div>
  );
}
