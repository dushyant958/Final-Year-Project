import { useState } from 'react';
import { motion } from 'motion/react';
import { useOutletContext } from 'react-router-dom';
import { ClockCounterClockwise } from '@phosphor-icons/react';
import { TrendChart } from '../../components/dashboard/TrendChart';
import { getAQICategory } from '../../lib/aqi';
import { MOCK_HISTORY } from '../../lib/mockData';

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

type FilterRange = 12 | 24 | 48;

function getStatus(aqi: number): { label: string; color: string } {
  if (aqi > 200) return { label: 'Critical', color: '#ef4444' };
  if (aqi > 100) return { label: 'Warning', color: '#f59e0b' };
  return { label: 'Normal', color: '#22c55e' };
}

export default function HistoryPage() {
  const { history } = useOutletContext<DashboardContext>();
  const [range, setRange] = useState<FilterRange>(48);

  // Merge mock with real history
  const allHistory = [...MOCK_HISTORY];
  if (history.length > 0) {
    history.forEach((h: any) => {
      if (h.aqi != null) {
        allHistory.push({ timestamp: h.timestamp, aqi: h.aqi, time: h.time });
      }
    });
  }

  // Filter by range: each entry is 30min, so 12h = 24 entries, 24h = 48, 48h = 96
  const entriesCount = range * 2;
  const filteredHistory = allHistory.slice(-entriesCount);
  const tableEntries = [...filteredHistory].reverse();

  const toggleOptions: { label: string; value: FilterRange }[] = [
    { label: 'Last 12h', value: 12 },
    { label: 'Last 24h', value: 24 },
    { label: 'Last 48h', value: 48 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClockCounterClockwise weight="thin" className="h-5 w-5 text-primary" />
          <h2 className="text-[11px] font-mono font-semibold uppercase tracking-widest text-primary">
            Historical Data
          </h2>
        </div>

        {/* Toggle buttons */}
        <div className="flex gap-2">
          {toggleOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className={`px-3 py-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider border border-dotted transition-colors ${
                range === opt.value
                  ? 'bg-de border-primary text-dh'
                  : 'bg-ds border-db text-dm hover:text-dh'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <TrendChart history={filteredHistory} />
      </motion.div>

      {/* History Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="bg-ds border border-dotted border-db overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-dotted border-db">
          <p className="text-[11px] font-mono font-semibold uppercase tracking-widest text-primary">
            {filteredHistory.length} Readings
          </p>
        </div>
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-ds">
              <tr className="border-b border-dotted border-db">
                <th className="text-left px-6 py-3 text-[10px] font-bold text-dsc uppercase tracking-wider font-mono">
                  Time
                </th>
                <th className="text-left px-6 py-3 text-[10px] font-bold text-dsc uppercase tracking-wider font-mono">
                  AQI
                </th>
                <th className="text-left px-6 py-3 text-[10px] font-bold text-dsc uppercase tracking-wider font-mono">
                  Category
                </th>
                <th className="text-left px-6 py-3 text-[10px] font-bold text-dsc uppercase tracking-wider font-mono">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dotted divide-db">
              {tableEntries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm font-mono text-dm">
                    No history data available yet.
                  </td>
                </tr>
              ) : (
                tableEntries.map((entry: any, idx: number) => {
                  const cat = getAQICategory(entry.aqi ?? 0);
                  const status = getStatus(entry.aqi ?? 0);
                  return (
                    <motion.tr
                      key={idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(0.1 + idx * 0.01, 1), duration: 0.3 }}
                      className="hover:bg-de transition-colors"
                    >
                      <td className="px-6 py-3 text-sm font-mono text-dbd">
                        {entry.time ?? entry.timestamp ?? '\u2014'}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className="font-display font-bold text-sm"
                          style={{ color: cat.color }}
                        >
                          {entry.aqi ?? '\u2014'}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className="text-[10px] font-mono font-semibold uppercase tracking-wider"
                          style={{ color: cat.color }}
                        >
                          {cat.label}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-1"
                          style={{
                            color: status.color,
                            backgroundColor: `${status.color}15`,
                          }}
                        >
                          {status.label}
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
