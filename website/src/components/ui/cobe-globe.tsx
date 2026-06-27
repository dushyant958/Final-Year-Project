import { useEffect, useRef, useCallback } from 'react';
import createGlobe from 'cobe';

export interface GlobeProps {
  markerColor?: [number, number, number];
  size?: number;
}

// Pimpri, Pune coordinates
const PIMPRI: [number, number] = [18.6298, 73.7997];

export function CobGlobe({ markerColor = [0.0, 0.8, 0.9], size = 650 }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerDown = useRef(false);
  const pointerX = useRef(0);
  const pointerY = useRef(0);
  const velocityX = useRef(0);
  const velocityY = useRef(0);
  const phiRef = useRef(1.8); // rotated to show India
  const thetaRef = useRef(-0.2);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    pointerDown.current = true;
    pointerX.current = e.clientX;
    pointerY.current = e.clientY;
    velocityX.current = 0;
    velocityY.current = 0;
  }, []);

  const onPointerUp = useCallback(() => {
    pointerDown.current = false;
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!pointerDown.current) return;
    const dx = e.clientX - pointerX.current;
    const dy = e.clientY - pointerY.current;
    pointerX.current = e.clientX;
    pointerY.current = e.clientY;
    velocityX.current = dx * 0.003;
    velocityY.current = dy * 0.003;
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    let rafId: number;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: size * 2,
      height: size * 2,
      phi: phiRef.current,
      theta: thetaRef.current,
      dark: 1,
      diffuse: 1.4,
      mapSamples: 24000,
      mapBrightness: 12,
      baseColor: [0.05, 0.08, 0.18],
      markerColor,
      glowColor: [0.05, 0.15, 0.35],
      markers: [{ location: PIMPRI, size: 0.07 }],
    });

    const tick = () => {
      if (pointerDown.current) {
        // Apply pointer velocity directly
        phiRef.current += velocityX.current;
        thetaRef.current -= velocityY.current;
      } else {
        // Inertia decay
        velocityX.current *= 0.94;
        velocityY.current *= 0.94;
        phiRef.current += velocityX.current;
        thetaRef.current -= velocityY.current;
        // Slow auto-rotate when not interacting
        if (Math.abs(velocityX.current) < 0.0001 && Math.abs(velocityY.current) < 0.0001) {
          phiRef.current += 0.002;
        }
      }

      // Constrain theta between -PI/2 and PI/2
      thetaRef.current = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, thetaRef.current));

      globe.update({ phi: phiRef.current, theta: thetaRef.current, markerColor });
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
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerUp}
      style={{
        width: size,
        height: size,
        maxWidth: '100%',
        aspectRatio: '1',
        cursor: pointerDown.current ? 'grabbing' : 'grab',
        filter: 'drop-shadow(0 0 40px rgba(30, 80, 180, 0.35))',
      }}
    />
  );
}
