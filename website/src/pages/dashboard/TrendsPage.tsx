import { motion } from 'motion/react';
import { useOutletContext } from 'react-router-dom';
import { TrendUp } from '@phosphor-icons/react';
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

export default function TrendsPage() {
  const { history } = useOutletContext<DashboardContext>();

  const aqiValues = history.map((h: any) => h.aqi).filter((v: any) => v != null) as number[];
  const minAqi = aqiValues.length > 0 ? Math.min(...aqiValues) : 0;
  const maxAqi = aqiValues.length > 0 ? Math.max(...aqiValues) : 0;
  const avgAqi = aqiValues.length > 0
    ? Math.round((aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length) * 10) / 10
    : 0;

  // Distribution
  const distribution = AQI_CATEGORIES.map((cat) => {
    const count = aqiValues.filter((v) => v >= cat.min && v <= cat.max).length;
    return { ...cat, count };
  });
  const totalReadings = aqiValues.length || 1;
  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  const summaryCards = [
    { label: 'Min AQI', value: minAqi },
    { label: 'Max AQI', value: maxAqi },
    { label: 'Average AQI', value: avgAqi },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2">
        <TrendUp weight="thin" className="h-5 w-5 text-primary" />
        <h2 className="text-[11px] font-mono font-semibold uppercase tracking-widest text-primary">
          Trends & Analytics
        </h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {summaryCards.map((card, idx) => (
          <motion.div
            key={card.label}
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
            <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-dm mb-3">
              {card.label}
            </p>
            <p className="font-display text-4xl font-bold text-dh tracking-tight">
              {card.value}
            </p>
            <p className="text-[10px] font-mono text-dsc mt-1">
              from {aqiValues.length} readings
            </p>
          </motion.div>
        ))}
      </div>

      {/* Distribution Chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.34, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
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
        <p className="text-[11px] font-mono font-semibold uppercase tracking-widest text-primary mb-6">
          Category Distribution
        </p>
        <div className="space-y-4">
          {distribution.map((cat, idx) => {
            const pct = ((cat.count / totalReadings) * 100).toFixed(1);
            const barWidth = `${(cat.count / maxCount) * 100}%`;
            return (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.06, duration: 0.3 }}
                className="flex items-center gap-4"
              >
                <span className="w-28 text-[11px] font-mono text-dbd shrink-0">
                  {cat.label}
                </span>
                <div className="flex-1 h-6 bg-de relative" style={{ borderRadius: 0 }}>
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: barWidth,
                      backgroundColor: cat.color,
                      opacity: 0.8,
                      borderRadius: 0,
                    }}
                  />
                </div>
                <span className="w-16 text-right text-[11px] font-mono text-dsc shrink-0">
                  {cat.count} ({pct}%)
                </span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
