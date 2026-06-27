// Mock data that ends at the current time — no gaps on the chart
function generateHistory() {
  const points = [];
  const now = Date.now();
  for (let i = 95; i >= 0; i--) {
    const t = new Date(now - i * 30 * 60 * 1000);
    const hour = t.getHours();
    const base = 75;
    const rush1 = Math.exp(-0.5 * Math.pow((hour - 8) / 2, 2)) * 55;
    const rush2 = Math.exp(-0.5 * Math.pow((hour - 18) / 2, 2)) * 45;
    const night = Math.exp(-0.5 * Math.pow((hour - 3) / 3, 2)) * -25;
    const noise = (Math.random() - 0.5) * 18;
    const aqi = Math.max(20, Math.min(300, Math.round(base + rush1 + rush2 + night + noise)));
    points.push({
      timestamp: t.toISOString(),
      aqi,
      time: t.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    });
  }
  return points;
}

function generateSensor(base: number, variance: number) {
  const points: { timestamp: string; value: number; time: string }[] = [];
  const now = Date.now();
  for (let i = 95; i >= 0; i--) {
    const t = new Date(now - i * 30 * 60 * 1000);
    const hour = t.getHours();
    const rush = Math.exp(-0.5 * Math.pow((hour - 8) / 2, 2)) * variance * 0.4
      + Math.exp(-0.5 * Math.pow((hour - 18) / 2, 2)) * variance * 0.3;
    const val = base + rush + (Math.random() - 0.5) * variance * 0.25;
    points.push({
      timestamp: t.toISOString(),
      value: Math.round(val * 10) / 10,
      time: t.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    });
  }
  return points;
}

export const MOCK_HISTORY = generateHistory();
export const MOCK_CO_HISTORY = generateSensor(2800, 800);
export const MOCK_TEMP_HISTORY = generateSensor(28, 8);
export const MOCK_HUMIDITY_HISTORY = generateSensor(55, 20);
export const MOCK_NH3_HISTORY = generateSensor(25, 15);
