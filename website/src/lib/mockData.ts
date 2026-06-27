import { type AQIData } from './aqi';

// Generate 96 mock history points (48 hours at 30min intervals) with realistic diurnal pattern
function generateHistory() {
  const points = [];
  const now = new Date();
  for (let i = 95; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 30 * 60 * 1000);
    const hour = t.getHours();
    // Diurnal: peaks at 8am and 6pm (rush hours), lowest at 3am
    const base = 80;
    const rushMorning = Math.exp(-0.5 * Math.pow((hour - 8) / 2, 2)) * 60;
    const rushEvening = Math.exp(-0.5 * Math.pow((hour - 18) / 2, 2)) * 50;
    const nightDip = Math.exp(-0.5 * Math.pow((hour - 3) / 3, 2)) * -30;
    const noise = (Math.random() - 0.5) * 20;
    const aqi = Math.max(15, Math.min(350, base + rushMorning + rushEvening + nightDip + noise));
    points.push({
      timestamp: t.toISOString(),
      aqi: Math.round(aqi),
      time: t.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    });
  }
  return points;
}

// Generate CO history (correlates with AQI)
function generateSensorHistory(baseVal: number, variance: number) {
  const points = [];
  const now = new Date();
  for (let i = 95; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 30 * 60 * 1000);
    const hour = t.getHours();
    const rush = Math.exp(-0.5 * Math.pow((hour - 8) / 2, 2)) * variance * 0.5 + Math.exp(-0.5 * Math.pow((hour - 18) / 2, 2)) * variance * 0.4;
    const val = baseVal + rush + (Math.random() - 0.5) * variance * 0.3;
    points.push({
      timestamp: t.toISOString(),
      value: Math.round(val * 10) / 10,
      time: t.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    });
  }
  return points;
}

export const MOCK_HISTORY = generateHistory();
export const MOCK_CO_HISTORY = generateSensorHistory(2800, 800);
export const MOCK_TEMP_HISTORY = generateSensorHistory(28, 8);
