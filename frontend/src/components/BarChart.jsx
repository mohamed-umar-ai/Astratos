import { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function BarChart({ data, height = 200, color = '#06b6d4', labelText = 'Value' }) {
  const { maxVal, bars } = useMemo(() => {
    if (!data || data.length === 0) return { maxVal: 0, bars: [] };

    const values = data.map(d => d.value);
    const maxVal = Math.max(...values, 1);

    const svgWidth = 1000;
    const paddingX = 30;
    const paddingTop = 55;
    const paddingBottom = 52;
    const chartH = height - paddingTop - paddingBottom;

    const count = data.length;
    const totalSpace = svgWidth - paddingX * 2;
    const barW = Math.min(100, (totalSpace / count) * 0.55);
    const slotW = totalSpace / count;

    const bars = data.map((d, i) => {
      const barH = Math.max(2, (d.value / maxVal) * chartH);
      const x = paddingX + i * slotW + slotW / 2 - barW / 2;
      const y = paddingTop + chartH - barH;
      return { x, y, barW, barH, ...d };
    });

    return { maxVal, bars };
  }, [data, height]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-slate-500 font-mono text-xs" style={{ height }}>
        [NO DATA]
      </div>
    );
  }

  const safeColor = color.replace('#', '');
  const filterId = `bglow-${safeColor}`;
  const gradId = `bgrad-${safeColor}`;
  const baselineY = height - 52;

  return (
    <div className="relative w-full" style={{ height }}>
      <svg viewBox={`0 0 1000 ${height}`} className="w-full h-full overflow-visible">
        <defs>
          <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.25" />
          </linearGradient>
        </defs>

        {/* Y-axis label */}
        <text
          x="14" y={height / 2}
          fill="rgba(255,255,255,0.35)" fontSize="11"
          fontFamily="monospace" textAnchor="middle" letterSpacing="1"
          transform={`rotate(-90 14 ${height / 2})`}
        >
          {labelText.toUpperCase()}
        </text>

        {/* Baseline */}
        <line x1="30" y1={baselineY} x2="970" y2={baselineY} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

        {/* Bars */}
        {bars.map((bar, i) => (
          <g key={`${bar.label}-${i}`}>
            {/* Glow halo behind bar */}
            <motion.rect
              x={bar.x - 3}
              width={bar.barW + 6}
              initial={{ height: 0, y: baselineY }}
              animate={{ height: bar.barH + 4, y: bar.y - 2 }}
              transition={{ duration: 0.65, delay: i * 0.07, ease: [0.34, 1.56, 0.64, 1] }}
              fill={color}
              opacity={0.18}
              rx="6"
              filter={`url(#${filterId})`}
            />

            {/* Main bar */}
            <motion.rect
              x={bar.x}
              width={bar.barW}
              initial={{ height: 0, y: baselineY }}
              animate={{ height: bar.barH, y: bar.y }}
              transition={{ duration: 0.65, delay: i * 0.07, ease: [0.34, 1.56, 0.64, 1] }}
              fill={`url(#${gradId})`}
              rx="5"
            />

            {/* Top highlight strip */}
            <motion.rect
              x={bar.x}
              width={bar.barW}
              height={4}
              initial={{ y: baselineY, opacity: 0 }}
              animate={{ y: bar.y, opacity: 1 }}
              transition={{ duration: 0.65, delay: i * 0.07 + 0.05, ease: [0.34, 1.56, 0.64, 1] }}
              fill={color}
              rx="5"
            />

            {/* Value label above bar — only animate opacity, NOT y (framer adds translateY on top of SVG y causing double offset) */}
            <motion.text
              x={bar.x + bar.barW / 2}
              y={bar.y - 10}
              textAnchor="middle"
              fill={color}
              fontSize="15"
              fontFamily="monospace"
              fontWeight="bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.07 }}
            >
              {bar.value}
            </motion.text>

            {/* Category label below baseline */}
            <text
              x={bar.x + bar.barW / 2}
              y={baselineY + 18}
              textAnchor="middle"
              fill="rgba(255,255,255,0.45)"
              fontSize="11"
              fontFamily="monospace"
            >
              {bar.label.length > 7 ? bar.label.substring(0, 7) + '..' : bar.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
