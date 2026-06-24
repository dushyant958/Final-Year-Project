interface Props {
  online: boolean;
  lastUpdated: Date | null;
  onRefresh: () => void;
}

export function DashHeader({ online, lastUpdated, onRefresh }: Props) {
  const time = lastUpdated
    ? lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '--:--:--';
  const date = lastUpdated
    ? lastUpdated.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '---';

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
      <div>
        <h1 className="text-lg font-bold text-gray-900 leading-none">Live Air Quality Dashboard</h1>
        <p className="text-xs text-gray-400 mt-0.5">Real-time monitoring · Pimpri, Pune · XGBoost on-device inference</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${online ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`} />
          <span className={`text-xs font-semibold ${online ? 'text-green-600' : 'text-red-500'}`}>
            {online ? 'Online' : 'Offline'}
          </span>
        </div>

        <div className="text-right text-xs text-gray-400">
          <div className="font-medium text-gray-600">{date}</div>
          <div>{time}</div>
        </div>

        <button
          onClick={onRefresh}
          className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-300 transition-colors"
          title="Refresh now"
        >
          ↻
        </button>
      </div>
    </header>
  );
}
