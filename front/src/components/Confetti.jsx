import { useEffect, useMemo } from "react";
import { motion } from "motion/react";

// Cores da propria marca (o triangulo do logo), pra ficar consistente com o
// resto do app em vez de um confete generico multicolorido.
const CONFETTI_COLORS = ["#00c030", "#facc15", "#ec4899", "#38bdf8"];
const PIECE_COUNT = 28;
const BURST_DURATION_MS = 1400;

function createPieces() {
  return Array.from({ length: PIECE_COUNT }, (_, index) => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 70 + Math.random() * 110;

    return {
      id: `${Date.now()}-${index}`,
      color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
      x: Math.cos(angle) * distance,
      fallY: Math.sin(angle) * distance * 0.4 + 160,
      rotate: (Math.random() - 0.5) * 720,
      delay: Math.random() * 0.15,
      duration: 0.8 + Math.random() * 0.5,
      width: 5 + Math.random() * 5,
      height: 8 + Math.random() * 6,
    };
  });
}

export default function Confetti({ isActive, onComplete }) {
  const pieces = useMemo(() => (isActive ? createPieces() : []), [isActive]);

  useEffect(() => {
    if (!isActive) return undefined;

    const timer = window.setTimeout(() => onComplete?.(), BURST_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-visible">
      {pieces.map((piece) => (
        <motion.span
          animate={{
            x: piece.x,
            y: piece.fallY,
            rotate: piece.rotate,
            opacity: 0,
          }}
          className="absolute left-1/2 top-1/2 rounded-sm"
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          key={piece.id}
          style={{
            backgroundColor: piece.color,
            width: piece.width,
            height: piece.height,
          }}
          transition={{
            delay: piece.delay,
            duration: piece.duration,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}
