import React, { useEffect, useRef, useState } from 'react';

export interface DecorEffectConfig {
  butterflyCount?: number;
  goldfishCount?: number;
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

interface GoldfishData {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  size: number;
  colorType: 'gold' | 'kohaku' | 'sunburst' | 'ruby';
  tailSpeed: number;
  tailPhase: number;
  finPhase: number;
  heading: number;
  targetHeading: number;
  opacity: number;
  depthScale: number;
  swimTurnAngle: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
  type: 'sparkle' | 'bubble';
  vy?: number;
}

const BUTTERFLY_PRESETS = {
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

const GOLDFISH_PRESETS = {
  gold: {
    nameKh: 'ត្រីមាសហុងស៊ុយ',
    primary: '#FF9500',
    secondary: '#FFD700',
    accent: '#FFF176',
    fin: 'rgba(255, 215, 0, 0.65)',
    glow: 'rgba(255, 193, 7, 0.4)',
    scaleSpot: '#FF6F00',
  },
  kohaku: {
    nameKh: 'ត្រីកយក្រហម-ស',
    primary: '#FF2A55',
    secondary: '#FFFFFF',
    accent: '#FF8A80',
    fin: 'rgba(255, 255, 255, 0.75)',
    glow: 'rgba(255, 82, 82, 0.35)',
    scaleSpot: '#D50000',
  },
  sunburst: {
    nameKh: 'ត្រីមាសពន្លឺព្រះអាទិត្យ',
    primary: '#FF5722',
    secondary: '#FFB300',
    accent: '#FFE082',
    fin: 'rgba(255, 179, 0, 0.6)',
    glow: 'rgba(255, 112, 67, 0.35)',
    scaleSpot: '#E64A19',
  },
  ruby: {
    nameKh: 'ត្រីមាសទទឹមសំណាង',
    primary: '#E91E63',
    secondary: '#FFA000',
    accent: '#FFD54F',
    fin: 'rgba(255, 160, 0, 0.6)',
    glow: 'rgba(233, 30, 99, 0.35)',
    scaleSpot: '#C2185B',
  },
};

export const ButterflyEffect: React.FC<{
  enabled?: boolean;
  count?: number;
}> = ({ enabled = true, count = 14 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const butterfliesRef = useRef<ButterflyData[]>([]);
  const goldfishRef = useRef<GoldfishData[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: -1000, y: -1000, active: false });
  const animFrameRef = useRef<number>(0);

  const isMobile =
    typeof window !== 'undefined' &&
    (window.innerWidth < 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));

  // Increased counts for phone: 8 butterflies & 5 swimming lucky goldfish
  const butterflyCount = isMobile ? 8 : count;
  const goldfishCount = isMobile ? 5 : 7;

  const [, setRenderTrigger] = useState(0);

  // Initialize Butterflies
  useEffect(() => {
    if (!enabled) return;

    const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const height = typeof window !== 'undefined' ? window.innerHeight : 800;

    const colors: ButterflyData['colorType'][] = ['monarch', 'blue', 'pink', 'emerald', 'purple', 'gold'];

    const initialButterflies: ButterflyData[] = Array.from({ length: butterflyCount }).map((_, i) => {
      const heading = Math.random() * Math.PI * 2;
      const speed = 1.0 + Math.random() * 1.4;
      const size = (isMobile ? 24 : 28) + Math.random() * 16;
      const depthScale = 0.8 + Math.random() * 0.4;

      return {
        id: i,
        x: Math.random() * width,
        y: Math.random() * (height * 0.75), // flutter mostly in mid-to-upper atmosphere
        vx: Math.cos(heading) * speed,
        vy: Math.sin(heading) * speed,
        size,
        colorType: colors[i % colors.length],
        flapSpeed: 0.12 + Math.random() * 0.08,
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
  }, [enabled, butterflyCount, isMobile]);

  // Initialize Lucky Goldfish (Swimming gracefully across the lower-to-middle screen)
  useEffect(() => {
    if (!enabled) return;

    const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const height = typeof window !== 'undefined' ? window.innerHeight : 800;

    const fishTypes: GoldfishData['colorType'][] = ['gold', 'kohaku', 'sunburst', 'ruby'];

    const initialGoldfish: GoldfishData[] = Array.from({ length: goldfishCount }).map((_, i) => {
      // Alternate swimming mostly left-to-right or right-to-left
      const isHeadingRight = i % 2 === 0;
      const baseAngle = isHeadingRight ? 0 : Math.PI;
      const heading = baseAngle + (Math.random() - 0.5) * 0.5;
      const speed = 0.7 + Math.random() * 0.8; // graceful gentle swimming
      const size = (isMobile ? 42 : 54) + Math.random() * (isMobile ? 18 : 26);
      const depthScale = 0.8 + Math.random() * 0.35;

      // Position across the lower 65% of the screen where a serene pond would be
      const y = height * 0.35 + Math.random() * (height * 0.6);

      return {
        id: i,
        x: Math.random() * width,
        y,
        vx: Math.cos(heading) * speed,
        vy: Math.sin(heading) * speed,
        speed,
        size,
        colorType: fishTypes[i % fishTypes.length],
        tailSpeed: 0.28 + Math.random() * 0.12,
        tailPhase: Math.random() * Math.PI * 2,
        finPhase: Math.random() * Math.PI * 2,
        heading,
        targetHeading: heading,
        opacity: 0.88 + Math.random() * 0.12,
        depthScale,
        swimTurnAngle: 0,
      };
    });

    goldfishRef.current = initialGoldfish;
  }, [enabled, goldfishCount, isMobile]);

  // Track cursor / touch for interactive water ripples and butterfly avoidance
  useEffect(() => {
    if (!enabled) return;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      mouseRef.current = { x: clientX, y: clientY, active: true };
    };

    const handlePointerEnd = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('mouseleave', handlePointerEnd);
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerEnd);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseleave', handlePointerEnd);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerEnd);
    };
  }, [enabled]);

  // Main 30-40 FPS Optimized Animation Loop
  useEffect(() => {
    if (!enabled) return;

    let lastSparkleTime = Date.now();
    let lastBubbleTime = Date.now();
    let lastRenderTime = 0;

    const update = () => {
      if (typeof document !== 'undefined' && document.hidden) {
        animFrameRef.current = requestAnimationFrame(update);
        return;
      }

      const now = Date.now();
      // Cap at ~35 FPS for silky-smooth visuals while keeping CPU/battery consumption near zero
      if (now - lastRenderTime < 28) {
        animFrameRef.current = requestAnimationFrame(update);
        return;
      }
      lastRenderTime = now;

      const width = window.innerWidth;
      const height = window.innerHeight;

      const shouldSpawnSparkles = now - lastSparkleTime > 300;
      if (shouldSpawnSparkles) lastSparkleTime = now;

      const shouldSpawnBubbles = now - lastBubbleTime > 400;
      if (shouldSpawnBubbles) lastBubbleTime = now;

      // 1. Update Butterflies
      butterfliesRef.current.forEach((b) => {
        if (Math.random() < 0.03) {
          b.targetHeading += (Math.random() - 0.5) * 1.5;
        }

        // Mouse/Finger avoidance
        if (mouseRef.current.active) {
          const dx = b.x - mouseRef.current.x;
          const dy = b.y - mouseRef.current.y;
          const distSq = dx * dx + dy * dy;
          const avoidDist = 110;

          if (distSq < avoidDist * avoidDist && distSq > 0) {
            const angleAway = Math.atan2(dy, dx);
            b.targetHeading = angleAway;
            b.vx += Math.cos(angleAway) * 0.45;
            b.vy += Math.sin(angleAway) * 0.45;
          }
        }

        let diff = b.targetHeading - b.heading;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        b.heading += diff * 0.05;

        b.wobblePhase += b.wobbleSpeed;
        const wobble = Math.sin(b.wobblePhase) * b.wobbleAmp;

        const baseSpeed = 1.25 * b.depthScale;
        const targetVx = Math.cos(b.heading + wobble) * baseSpeed;
        const targetVy = Math.sin(b.heading + wobble) * baseSpeed;

        b.vx += (targetVx - b.vx) * 0.08;
        b.vy += (targetVy - b.vy) * 0.08;

        b.x += b.vx;
        b.y += b.vy;

        const pad = 60;
        if (b.x < -pad) b.x = width + pad;
        if (b.x > width + pad) b.x = -pad;
        if (b.y < -pad) b.y = height + pad;
        if (b.y > height + pad) b.y = -pad;

        if (shouldSpawnSparkles && Math.random() < 0.6) {
          const preset = BUTTERFLY_PRESETS[b.colorType];
          particlesRef.current.push({
            id: Math.random(),
            x: b.x - b.vx * 3 + (Math.random() - 0.5) * 6,
            y: b.y - b.vy * 3 + (Math.random() - 0.5) * 6,
            size: 2 + Math.random() * 3,
            opacity: 0.9,
            color: preset.sparkle,
            type: 'sparkle',
          });
        }
      });

      // 2. Update Lucky Goldfish (Smooth undulating aquatic motion)
      goldfishRef.current.forEach((fish) => {
        // Subtle organic depth steering: swim mostly horizontal with gentle sine dips
        if (Math.random() < 0.02) {
          // Keep heading mostly between -35deg to +35deg (facing right) or 145deg to 215deg (facing left)
          const isFacingRight = Math.cos(fish.heading) >= 0;
          const targetBase = isFacingRight ? 0 : Math.PI;
          fish.targetHeading = targetBase + (Math.random() - 0.5) * 0.6;
        }

        // Screen boundary rebound: turn gently back into screen
        const margin = 80;
        if (fish.x < margin && Math.cos(fish.heading) < 0) {
          fish.targetHeading = (Math.random() - 0.5) * 0.4; // turn right
        } else if (fish.x > width - margin && Math.cos(fish.heading) > 0) {
          fish.targetHeading = Math.PI + (Math.random() - 0.5) * 0.4; // turn left
        }

        // Vertical boundary cushion (keep fish swimming in graceful pond area)
        if (fish.y < height * 0.25) {
          fish.vy += 0.08;
        } else if (fish.y > height - 70) {
          fish.vy -= 0.08;
        }

        // Pointer reaction: curious lucky fish gently swirl near or steer slightly
        if (mouseRef.current.active) {
          const dx = fish.x - mouseRef.current.x;
          const dy = fish.y - mouseRef.current.y;
          const distSq = dx * dx + dy * dy;
          const reactDist = 90;
          if (distSq < reactDist * reactDist && distSq > 0) {
            const angleAway = Math.atan2(dy, dx);
            fish.vx += Math.cos(angleAway) * 0.3;
            fish.vy += Math.sin(angleAway) * 0.3;
          }
        }

        let diff = fish.targetHeading - fish.heading;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        fish.heading += diff * 0.04;

        // Undulating swimming speed
        const swimSpeed = fish.speed * fish.depthScale;
        fish.vx += (Math.cos(fish.heading) * swimSpeed - fish.vx) * 0.06;
        fish.vy += (Math.sin(fish.heading) * swimSpeed * 0.6 - fish.vy) * 0.06;

        fish.x += fish.vx;
        fish.y += fish.vy;

        // Wrap boundaries
        const pad = 90;
        if (fish.x < -pad) fish.x = width + pad;
        if (fish.x > width + pad) fish.x = -pad;
        if (fish.y < -pad) fish.y = height + pad;
        if (fish.y > height + pad) fish.y = -pad;

        // Spawn occasional lucky air bubbles behind the fish tail
        if (shouldSpawnBubbles && Math.random() < 0.45) {
          particlesRef.current.push({
            id: Math.random(),
            x: fish.x - Math.cos(fish.heading) * (fish.size * 0.5) + (Math.random() - 0.5) * 6,
            y: fish.y - Math.sin(fish.heading) * (fish.size * 0.5) + (Math.random() - 0.5) * 6,
            size: 3 + Math.random() * 4,
            opacity: 0.75,
            color: 'rgba(255, 255, 255, 0.7)',
            type: 'bubble',
            vy: -0.8 - Math.random() * 0.6, // float upward
          });
        }
      });

      // 3. Update Sparkles & Bubbles
      particlesRef.current = particlesRef.current
        .map((p) => {
          if (p.type === 'bubble') {
            return {
              ...p,
              y: p.y + (p.vy || -1),
              x: p.x + Math.sin(p.y * 0.05) * 0.4, // gentle wobble upward
              opacity: p.opacity - 0.015,
            };
          } else {
            return {
              ...p,
              y: p.y + 0.3,
              opacity: p.opacity - 0.035,
            };
          }
        })
        .filter((p) => p.opacity > 0 && p.y > -20);

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
      className="fixed inset-0 pointer-events-none z-[42] overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Sparkle Dust & Water Bubbles */}
      {particlesRef.current.map((p) => (
        <div
          key={p.id}
          style={{
            transform: `translate3d(${p.x}px, ${p.y}px, 0)`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.type === 'bubble' ? 'rgba(255, 255, 255, 0.25)' : p.color,
            border: p.type === 'bubble' ? '1px solid rgba(255, 255, 255, 0.85)' : 'none',
            opacity: p.opacity,
            boxShadow:
              p.type === 'bubble'
                ? '0 0 5px rgba(255, 255, 255, 0.6), inset 0 0 3px rgba(255, 255, 255, 0.8)'
                : `0 0 5px ${p.color}`,
          }}
          className="absolute rounded-full pointer-events-none transition-opacity duration-150"
        />
      ))}

      {/* 2. Swimming Lucky Goldfish (ត្រីមាសហែលនាំសំណាង) */}
      {goldfishRef.current.map((fish) => {
        const preset = GOLDFISH_PRESETS[fish.colorType];
        // Calculate swimming orientation
        const isFacingLeft = Math.cos(fish.heading) < 0;
        const angleDeg = (fish.heading * 180) / Math.PI;

        return (
          <div
            key={`fish-${fish.id}`}
            style={{
              transform: `translate3d(${fish.x}px, ${fish.y}px, 0) scale(${fish.depthScale}) rotate(${angleDeg}deg)`,
              width: `${fish.size * 1.5}px`,
              height: `${fish.size * 0.8}px`,
              opacity: fish.opacity,
              filter: `drop-shadow(0 6px 12px ${preset.glow})`,
            }}
            className="absolute -top-6 -left-10 pointer-events-none will-change-transform"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <svg
                viewBox="0 0 160 80"
                className="w-full h-full transform-gpu"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* Body Shimmer Gradient */}
                  <linearGradient id={`fish-body-${fish.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={preset.primary} />
                    <stop offset="45%" stopColor={preset.secondary} />
                    <stop offset="85%" stopColor={preset.accent} />
                    <stop offset="100%" stopColor="#FFFFFF" />
                  </linearGradient>

                  {/* Translucent Flowing Tail Gradient */}
                  <linearGradient id={`fish-fin-${fish.id}`} x1="0%" y1="50%" x2="100%" y2="50%">
                    <stop offset="0%" stopColor={preset.primary} stopOpacity="0.8" />
                    <stop offset="60%" stopColor={preset.secondary} stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.2" />
                  </linearGradient>
                </defs>

                {/* Animated Flowing Tail Fin (Caudal Fin) with Smooth Undulation */}
                <g className="origin-left" style={{ animation: `fishTailUndulate ${fish.tailSpeed}s ease-in-out infinite alternate` }}>
                  {/* Upper Tail Petal */}
                  <path
                    d="M38 40 C20 25, 0 10, -5 2 C-2 18, 12 32, 32 38 Z"
                    fill={`url(#fish-fin-${fish.id})`}
                    filter="blur(0.4px)"
                  />
                  {/* Lower Tail Petal (Longer Graceful Veil) */}
                  <path
                    d="M38 40 C15 50, -8 65, -15 78 C-5 60, 10 46, 32 42 Z"
                    fill={`url(#fish-fin-${fish.id})`}
                    filter="blur(0.4px)"
                  />
                  {/* Main Flowing Veil Tail */}
                  <path
                    d="M36 40 C12 32, -18 36, -30 48 C-18 56, 8 48, 36 41 Z"
                    fill={`url(#fish-fin-${fish.id})`}
                    opacity="0.85"
                  />
                  {/* Delicate tail fin rays */}
                  <path
                    d="M36 40 Q8 30 -20 20 M36 40 Q5 44 -25 50 M36 40 Q10 58 -10 70"
                    stroke="rgba(255, 255, 255, 0.45)"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                  />
                </g>

                {/* Ventral & Anal Fins */}
                <path
                  d="M65 48 C52 60, 42 66, 38 68 C44 58, 55 52, 65 48 Z"
                  fill={`url(#fish-fin-${fish.id})`}
                  style={{ animation: `fishFinFlutter 0.35s ease-in-out infinite alternate` }}
                />

                {/* Main Torpedo-shaped Koi/Goldfish Body */}
                <path
                  d="M142 40 C138 28, 115 18, 85 20 C56 22, 36 34, 34 40 C36 46, 56 58, 85 60 C115 62, 138 52, 142 40 Z"
                  fill={`url(#fish-body-${fish.id})`}
                  stroke="rgba(255, 215, 0, 0.3)"
                  strokeWidth="0.8"
                />

                {/* Lucky Spot Markings (Kohaku / Koi Spots) */}
                <ellipse cx="108" cy="34" rx="10" ry="6" fill={preset.scaleSpot} opacity="0.65" />
                <ellipse cx="78" cy="45" rx="14" ry="7" fill={preset.scaleSpot} opacity="0.55" />
                <circle cx="54" cy="38" r="4.5" fill={preset.scaleSpot} opacity="0.6" />

                {/* Dorsal Fin (Spine fin) */}
                <path
                  d="M102 20 C88 12, 70 12, 58 18 C70 16, 88 16, 102 20 Z"
                  fill={`url(#fish-fin-${fish.id})`}
                  opacity="0.9"
                />

                {/* Top Pectoral Fin (Fluttering with swimming strokes) */}
                <g style={{ animation: `fishFinFlutter ${fish.tailSpeed * 0.9}s ease-in-out infinite alternate`, transformOrigin: '115px 32px' }}>
                  <path
                    d="M115 30 C125 15, 138 8, 148 4 C138 16, 126 26, 115 30 Z"
                    fill={`url(#fish-fin-${fish.id})`}
                  />
                </g>

                {/* Bottom Pectoral Fin */}
                <g style={{ animation: `fishFinFlutter ${fish.tailSpeed * 0.9}s ease-in-out infinite alternate-reverse`, transformOrigin: '115px 48px' }}>
                  <path
                    d="M115 50 C125 65, 138 72, 148 76 C138 64, 126 54, 115 50 Z"
                    fill={`url(#fish-fin-${fish.id})`}
                  />
                </g>

                {/* Head, Cute Eyes & Whiskers (Barbels) */}
                <circle cx="134" cy="34" r="2.8" fill="#1A1A1A" />
                <circle cx="134.8" cy="33.2" r="1.1" fill="#FFFFFF" />
                <circle cx="134" cy="46" r="2.8" fill="#1A1A1A" />
                <circle cx="134.8" cy="45.2" r="1.1" fill="#FFFFFF" />

                {/* Golden Mouth & Whisker */}
                <path
                  d="M142 40 Q146 38 149 39 M142 40 Q146 42 149 41"
                  stroke="#FFA000"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />

                {/* Light Reflection Belly Shimmer */}
                <path
                  d="M125 38 Q90 28 55 38"
                  stroke="rgba(255, 255, 255, 0.65)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        );
      })}

      {/* 3. Fluttering 3D Butterflies */}
      {butterfliesRef.current.map((b) => {
        const preset = BUTTERFLY_PRESETS[b.colorType];
        const rotDeg = (b.heading * 180) / Math.PI + 90;

        return (
          <div
            key={`butterfly-${b.id}`}
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

      {/* Global CSS for 3D Wing Flapping & Aquatic Undulation */}
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
        @keyframes fishTailUndulate {
          0% {
            transform: skewY(-16deg) rotateZ(-12deg);
          }
          100% {
            transform: skewY(16deg) rotateZ(12deg);
          }
        }
        @keyframes fishFinFlutter {
          0% {
            transform: rotateZ(-8deg) scaleX(0.92);
          }
          100% {
            transform: rotateZ(14deg) scaleX(1.08);
          }
        }
      `}</style>
    </div>
  );
};
