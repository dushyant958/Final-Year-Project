import { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

export interface GlobeProps {
  markerColor?: [number, number, number];
  size?: number;
}

// Pimpri, Pune coordinates
const PIMPRI: [number, number] = [18.6298, 73.7997];

export function CobGlobe({ markerColor = [0.18, 0.8, 0.4], size = 550 }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    let phi = 1.8; // rotated to show India
    let rafId: number;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: size * 2,
      height: size * 2,
      phi,
      theta: -0.2,
      dark: 1,
      diffuse: 1.4,
      mapSamples: 20000,
      mapBrightness: 4,
      baseColor: [0.08, 0.1, 0.14],
      markerColor,
      glowColor: [0.05, 0.25, 0.15],
      markers: [{ location: PIMPRI, size: 0.06 }],
    });

    const tick = () => {
      phi += 0.0025;
      globe.update({ phi, markerColor });
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      globe.destroy();
    };
  }, [markerColor, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size, maxWidth: '100%', aspectRatio: '1' }}
    />
  );
}
