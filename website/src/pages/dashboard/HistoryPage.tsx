import { motion } from 'motion/react';
import { useOutletContext } from 'react-router-dom';
import { ClockCounterClockwise } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { TrendChart } from '../../components/dashboard/TrendChart';
import { getAQICategory } from '../../lib/aqi';

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

export default function HistoryPage() {
  const { history } = useOutletContext<DashboardContext>();

  const recentEntries = history.slice(-20).reverse();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2">
        <ClockCounterClockwise weight="thin" className="h-5 w-5 text-primary" />
        <h2 className="text-[11px] font-mono font-semibold uppercase tracking-widest text-primary">
          Historical Data
        </h2>
      </div>

      {/* Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <TrendChart history={history} />
      </motion.div>

      {/* History Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'bg-ds border border-dotted border-db',
          'hover:-translate-y-px transition-transform overflow-hidden'
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
        <div className="px-6 py-4 border-b border-dotted border-db">
          <p className="text-[11px] font-mono font-semibold uppercase tracking-widest text-primary">
            Last 20 Readings
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dotted border-db">
                <th className="text-left px-6 py-3 text-[10px] font-bold text-dsc uppercase tracking-wider font-mono">
                  Timestamp
                </th>
                <th className="text-left px-6 py-3 text-[10px] font-bold text-dsc uppercase tracking-wider font-mono">
                  AQI
                </th>
                <th className="text-left px-6 py-3 text-[10px] font-bold text-dsc uppercase tracking-wider font-mono">
                  Category
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dotted divide-db">
              {recentEntries.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-sm font-mono text-dm">
                    No history data available yet.
                  </td>
                </tr>
              ) : (
                recentEntries.map((entry: any, idx: number) => {
                  const cat = getAQICategory(entry.aqi ?? 0);
                  return (
                    <motion.tr
                      key={idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 + idx * 0.02, duration: 0.3 }}
                      className="hover:bg-de transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-mono text-dbd">
                        {entry.time ?? entry.timestamp ?? '\u2014'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="font-display font-bold text-sm"
                          style={{ color: cat.color }}
                        >
                          {entry.aqi ?? '\u2014'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-1"
                          style={{
                            color: cat.color,
                            backgroundColor: `${cat.color}15`,
                          }}
                        >
                          {cat.label}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
