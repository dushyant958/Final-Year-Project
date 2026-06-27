import { ArrowsClockwise } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface Props {
  online: boolean;
  lastUpdated: Date | null;
  onRefresh: () => void;
}

export function DashHeader({ online, lastUpdated, onRefresh }: Props) {
  const time = lastUpdated
    ? lastUpdated.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '--:--:--';
  const date = lastUpdated
    ? lastUpdated.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '---';

  return (
    <header className="h-14 sticky top-0 z-40 flex items-center justify-between bg-dbg border-b border-dotted border-db px-6">
      {/* Left: Title */}
      <div>
        <h1 className="font-display font-bold text-lg text-dh leading-none">
          Live Air Quality Dashboard
        </h1>
        <p className="text-[10px] font-mono text-dm uppercase tracking-widest mt-0.5">
          Real-time monitoring &middot; Pimpri, Pune
        </p>
      </div>

      {/* Right: Status + Date + Refresh */}
      <div className="flex items-center gap-4">
        {/* Online status */}
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'rounded-full h-1.5 w-1.5',
              online ? 'bg-green-500 animate-pulse' : 'bg-red-400'
            )}
          />
          <span className="text-[10px] font-mono text-dm">
            {online ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Date / Time */}
        <div className="text-right">
          <div className="text-[11px] font-mono text-dsc">{date}</div>
          <div className="text-[10px] font-mono text-dm">{time}</div>
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          className="w-8 h-8 rounded-none border border-dotted border-db flex items-center justify-center text-dm hover:text-primary hover:border-primary transition-colors cursor-pointer"
          title="Refresh now"
        >
          <ArrowsClockwise weight="thin" className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
