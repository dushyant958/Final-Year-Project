import { ArrowsClockwise } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface Props {
  online: boolean;
  lastUpdated: Date | null;
  onRefresh: () => void;
  spikeMode: boolean;
  onToggleSpike: (on: boolean) => void;
}

export function DashHeader({ online, lastUpdated, onRefresh, spikeMode, onToggleSpike }: Props) {
  const time = lastUpdated
    ? lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '--:--:--';
  const date = lastUpdated
    ? lastUpdated.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '---';

  return (
    <header className="h-14 sticky top-0 z-40 flex items-center justify-between bg-dbg border-b border-dotted border-db px-6">
      <div>
        <h1 className="font-display font-bold text-lg text-dh leading-none">Live Air Quality Dashboard</h1>
        <p className="text-[10px] font-mono text-dm uppercase tracking-widest mt-0.5">Real-time monitoring · Pimpri, Pune</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Mode dots */}
        <div className="flex items-center gap-2">
          <button onClick={() => { onToggleSpike(false); onRefresh(); }} title="Normal"
            className={cn('w-3 h-3 rounded-full transition-all', !spikeMode ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-green-500/30 hover:bg-green-500/50')} />
          <button onClick={() => { onToggleSpike(true); onRefresh(); }} title="Elevated"
            className={cn('w-3 h-3 rounded-full transition-all', spikeMode ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-red-500/30 hover:bg-red-500/50')} />
        </div>

        <div className="flex items-center gap-2">
          <span className={cn('rounded-full h-1.5 w-1.5', online ? 'bg-green-500 animate-pulse' : 'bg-red-400')} />
          <span className="text-[10px] font-mono text-dm">{online ? 'Online' : 'Offline'}</span>
        </div>

        <div className="text-right">
          <div className="text-[11px] font-mono text-dsc">{date}</div>
          <div className="text-[10px] font-mono text-dm">{time}</div>
        </div>

        <button onClick={onRefresh} className="w-8 h-8 border border-dotted border-db flex items-center justify-center text-dm hover:text-dh transition-colors" title="Refresh">
          <ArrowsClockwise weight="thin" className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
