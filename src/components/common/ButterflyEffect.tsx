import React, { useEffect, useRef, useState } from 'react';

export interface ButterflyConfig {
  count?: number;
  interactive?: boolean;
  showSparkles?: boolean;
}

interface ButterflyData {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  colorType: 'monarch' | 'blue' | 'pink' | 'emerald' | 'purple' | 'gold';
  flapSpeed: number; // in seconds
  flapPhase: number;
  heading: number; // in radians
  targetHeading: number;
  wobbleSpeed: number;
  wobbleAmp: number;
  wobblePhase: number;
  opacity: number;
  depthScale: number;
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
}

const COLOR_PRESETS = {
  monarch: {
    primary: '#FF4500',
    secondary: '#FFA500',
    accent: '#FFD700',
    border: '#1A0802',
    sparkle: '#FFE082',
  },
  blue: {
    primary: '#0072FF',
    secondary: '#00C6FF',
    accent: '#B3E5FC',
    border: '#001A33',
    sparkle: '#80D8FF',
  },
  pink: {
    primary: '#E91E63',
    secondary: '#FF69B4',
    accent: '#FCE4EC',
    border: '#2E0014',
    sparkle: '#F8BBD0',
  },
  emerald: {
    primary: '#00B074',
    secondary: '#00E676',
    accent: '#B9F6CA',
    border: '#002B18',
    sparkle: '#A7FFEB',
  },
  purple: {
    primary: '#7E57C2',
    secondary: '#B388FF',
    accent: '#EDE7F6',
    border: '#1A0033',
    sparkle: '#EA80FC',
  },
  gold: {
    primary: '#FF9800',
    secondary: '#FFC107',
    accent: '#FFF9C4',
    border: '#331A00',
    sparkle: '#FFF176',
  },
};

export const ButterflyEffect: React.FC<{
  enabled?: boolean;
  count?: number;
}> = ({ enabled = true, count = 14 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const butterfliesRef = useRef<ButterflyData[]>([]);
  const sparklesRef = useRef<Sparkle[]>([]);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: -1000, y: -1000, active: false });
  const animFrameRef = useRef<number>(0);

  const [, setRenderTrigger] = useState(0);

  // Initialize butterflies with natural varied parameters
  useEffect(() => {
    if (!enabled) return;

    const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const height = typeof window !== 'undefined' ? window.innerHeight : 800;

    const colors: ButterflyData['colorType'][] = ['monarch', 'blue', 'pink', 'emerald', 'purple', 'gold'];

    const initialButterflies: ButterflyData[] = Array.from({ length: count }).map((_, i) => {
      const heading = Math.random() * Math.PI * 2;
      const speed = 1.0 + Math.random() * 1.5;
      const size = 26 + Math.random() * 18; // 26px to 44px
      const depthScale = 0.75 + Math.random() * 0.45;

      return {
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.cos(heading) * speed,
        vy: Math.sin(heading) * speed,
        size,
        colorType: colors[i % colors.length],
        flapSpeed: 0.12 + Math.random() * 0.08, // Rapid 3D flutter
        flapPhase: Math.random() * Math.PI * 2,
        heading,
        targetHeading: heading,
        wobbleSpeed: 0.04 + Math.random() * 0.05,
        wobbleAmp: 0.8 + Math.random() * 0.8,
        wobblePhase: Math.random() * 10,
        opacity: 0.85 + Math.random() * 0.15,
        depthScale,
      };
    });

    butterfliesRef.current = initialButterflies;
  }, [enabled, count]);

  // Track cursor movement for interactive butterfly avoidance
  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [enabled]);

  // Animation Loop: updates positions, handles screen wrapping, mouse repulsion, and sparkle spawning
  useEffect(() => {
    if (!enabled) return;

    let lastSparkleTime = Date.now();

    const update = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const now = Date.now();

      // Spawn subtle magic sparkles every 180ms
      const shouldSpawnSparkles = now - lastSparkleTime > 180;
      if (shouldSpawnSparkles) {
        lastSparkleTime = now;
      }

      butterfliesRef.current.forEach((b) => {
        // Randomly adjust target heading periodically for natural fluttering paths
        if (Math.random() < 0.03) {
          b.targetHeading += (Math.random() - 0.5) * 1.5;
        }

        // Mouse avoidance: gently flutter away when cursor approaches
        if (mouseRef.current.active) {
          const dx = b.x - mouseRef.current.x;
          const dy = b.y - mouseRef.current.y;
          const distSq = dx * dx + dy * dy;
          const avoidDist = 120;

          if (distSq < avoidDist * avoidDist && distSq > 0) {
            const angleAway = Math.atan2(dy, dx);
            b.targetHeading = angleAway;
            b.vx += Math.cos(angleAway) * 0.4;
            b.vy += Math.sin(angleAway) * 0.4;
          }
        }

        // Smoothly steer heading toward targetHeading
        let diff = b.targetHeading - b.heading;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        b.heading += diff * 0.05;

        // Flutter wobble (sine wave perpendicular to flight)
        b.wobblePhase += b.wobbleSpeed;
        const wobble = Math.sin(b.wobblePhase) * b.wobbleAmp;

        const baseSpeed = 1.2 * b.depthScale;
        const targetVx = Math.cos(b.heading + wobble) * baseSpeed;
        const targetVy = Math.sin(b.heading + wobble) * baseSpeed;

        b.vx += (targetVx - b.vx) * 0.08;
        b.vy += (targetVy - b.vy) * 0.08;

        b.x += b.vx;
        b.y += b.vy;

        // Screen boundary wrap with comfortable margins
        const pad = 60;
        if (b.x < -pad) b.x = width + pad;
        if (b.x > width + pad) b.x = -pad;
        if (b.y < -pad) b.y = height + pad;
        if (b.y > height + pad) b.y = -pad;

        // Spawn sparkle particle behind butterfly
        if (shouldSpawnSparkles && Math.random() < 0.6) {
          const preset = COLOR_PRESETS[b.colorType];
          sparklesRef.current.push({
            id: Math.random(),
            x: b.x - b.vx * 3 + (Math.random() - 0.5) * 6,
            y: b.y - b.vy * 3 + (Math.random() - 0.5) * 6,
            size: 2 + Math.random() * 3,
            opacity: 0.9,
            color: preset.sparkle,
          });
        }
      });

      // Update existing sparkles
      sparklesRef.current = sparklesRef.current
        .map((s) => ({
          ...s,
          y: s.y + 0.3, // slow gentle drift downward
          opacity: s.opacity - 0.035, // fade out
        }))
        .filter((s) => s.opacity > 0);

      setRenderTrigger((prev) => (prev + 1) % 1000);
      animFrameRef.current = requestAnimationFrame(update);
    };

    animFrameRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-[45] overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Sparkle Dust Particles */}
      {sparklesRef.current.map((s) => (
        <div
          key={s.id}
          style={{
            transform: `translate3d(${s.x}px, ${s.y}px, 0)`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            backgroundColor: s.color,
            opacity: s.opacity,
            boxShadow: `0 0 4px ${s.color}`,
          }}
          className="absolute rounded-full pointer-events-none transition-opacity duration-150"
        />
      ))}

      {/* 2. Fluttering 3D Butterflies */}
      {butterfliesRef.current.map((b) => {
        const preset = COLOR_PRESETS[b.colorType];
        const rotDeg = (b.heading * 180) / Math.PI + 90; // Align SVG upright to flight direction

        return (
          <div
            key={b.id}
            style={{
              transform: `translate3d(${b.x}px, ${b.y}px, 0) scale(${b.depthScale}) rotate(${rotDeg}deg)`,
              width: `${b.size}px`,
              height: `${b.size}px`,
              opacity: b.opacity,
              filter: `drop-shadow(0 4px 10px rgba(0, 0, 0, 0.18))`,
              transformStyle: 'preserve-3d',
              perspective: '600px',
            }}
            className="absolute -top-4 -left-4 pointer-events-none will-change-transform"
          >
            {/* 3D Butterfly Wrapper */}
            <div className="relative w-full h-full flex items-center justify-center transform-gpu">
              {/* Left Wing (3D Flapping) */}
              <div
                style={{
                  animation: `butterflyFlapLeft ${b.flapSpeed}s ease-in-out infinite alternate`,
                  transformOrigin: '100% 50%',
                }}
                className="w-1/2 h-full absolute right-1/2"
              >
                <svg
                  viewBox="0 0 50 80"
                  className="w-full h-full transform-gpu"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id={`grad-left-${b.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={preset.primary} />
                      <stop offset="50%" stopColor={preset.secondary} />
                      <stop offset="100%" stopColor={preset.accent} />
                    </linearGradient>
                  </defs>
                  {/* Forewing */}
                  <path
                    d="M50 40 C40 10, 10 0, 0 15 C-5 25, 5 45, 30 48 C42 49, 48 45, 50 40 Z"
                    fill={`url(#grad-left-${b.id})`}
                    stroke={preset.border}
                    strokeWidth="1.2"
                  />
                  {/* Hindwing */}
                  <path
                    d="M50 42 C40 45, 12 50, 5 62 C-2 72, 12 80, 28 75 C40 70, 48 55, 50 42 Z"
                    fill={`url(#grad-left-${b.id})`}
                    stroke={preset.border}
                    strokeWidth="1.2"
                  />
                  {/* Wing veins & glow dots */}
                  <path
                    d="M50 40 Q25 25 10 20 M50 40 Q28 35 15 40 M50 45 Q26 58 18 70"
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                  />
                  <circle cx="6" cy="18" r="1.5" fill="#FFFFFF" opacity="0.9" />
                  <circle cx="12" cy="70" r="1.2" fill="#FFFFFF" opacity="0.9" />
                </svg>
              </div>

              {/* Right Wing (3D Flapping) */}
              <div
                style={{
                  animation: `butterflyFlapRight ${b.flapSpeed}s ease-in-out infinite alternate`,
                  transformOrigin: '0% 50%',
                }}
                className="w-1/2 h-full absolute left-1/2"
              >
                <svg
                  viewBox="0 0 50 80"
                  className="w-full h-full transform-gpu"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id={`grad-right-${b.id}`} x1="100%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={preset.primary} />
                      <stop offset="50%" stopColor={preset.secondary} />
                      <stop offset="100%" stopColor={preset.accent} />
                    </linearGradient>
                  </defs>
                  {/* Forewing */}
                  <path
                    d="M0 40 C10 10, 40 0, 50 15 C55 25, 45 45, 20 48 C8 49, 2 45, 0 40 Z"
                    fill={`url(#grad-right-${b.id})`}
                    stroke={preset.border}
                    strokeWidth="1.2"
                  />
                  {/* Hindwing */}
                  <path
                    d="M0 42 C10 45, 38 50, 45 62 C52 72, 38 80, 22 75 C10 70, 2 55, 0 42 Z"
                    fill={`url(#grad-right-${b.id})`}
                    stroke={preset.border}
                    strokeWidth="1.2"
                  />
                  {/* Wing veins & glow dots */}
                  <path
                    d="M0 40 Q25 25 40 20 M0 40 Q22 35 35 40 M0 45 Q24 58 32 70"
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                  />
                  <circle cx="44" cy="18" r="1.5" fill="#FFFFFF" opacity="0.9" />
                  <circle cx="38" cy="70" r="1.2" fill="#FFFFFF" opacity="0.9" />
                </svg>
              </div>

              {/* Slender Body & Antennae */}
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <svg viewBox="0 0 20 80" className="w-[20%] h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Antennae */}
                  <path
                    d="M9 25 Q4 10 1 8 M11 25 Q16 10 19 8"
                    stroke="#2D1810"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  <circle cx="1" cy="8" r="1" fill="#FFC107" />
                  <circle cx="19" cy="8" r="1" fill="#FFC107" />
                  {/* Torso & Abdomen */}
                  <ellipse cx="10" cy="27" rx="2.5" ry="3.5" fill="#1E1B18" />
                  <ellipse cx="10" cy="46" rx="2.2" ry="14" fill="#2E1810" />
                </svg>
              </div>
            </div>
          </div>
        );
      })}

      {/* Global CSS for 3D Wing Flapping Animation */}
      <style>{`
        @keyframes butterflyFlapLeft {
          0% {
            transform: rotateY(0deg) rotateZ(0deg);
          }
          100% {
            transform: rotateY(74deg) rotateZ(-6deg);
          }
        }
        @keyframes butterflyFlapRight {
          0% {
            transform: rotateY(0deg) rotateZ(0deg);
          }
          100% {
            transform: rotateY(-74deg) rotateZ(6deg);
          }
        }
      `}</style>
    </div>
  );
};
