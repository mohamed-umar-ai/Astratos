import { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function LineChart({ data, height = 200, color = '#06b6d4', labelText = 'Value' }) {
  const { points, areaPoints, maxVal, minVal, pointsArray, renderData } = useMemo(() => {
    if (!data || data.length === 0) return { points: '', maxVal: 0, minVal: 0 };
    
    let renderData = data;
    if (data.length === 1) {
      renderData = [data[0], data[0]];
    }

    const values = renderData.map(d => d.value);
    
    let minVal = Math.min(...values);
    let maxVal = Math.max(...values, 10);
    
    if (maxVal === minVal) {
      maxVal = maxVal * 1.05;
      minVal = minVal * 0.95;
    } else {
      const p = (maxVal - minVal) * 0.2;
      maxVal += p;
      minVal = Math.max(0, minVal - p);
    }
    
    const width = 1000; 
    const paddingX = 55;
    const paddingY = 35;
    
    const xStep = (width - paddingX * 2) / Math.max(renderData.length - 1, 1);
    const heightRange = height - paddingY * 2;
    
    const pointsArray = renderData.map((d, i) => {
      const x = paddingX + i * xStep;
      const yTopRatio = (d.value - minVal) / (maxVal - minVal || 1);
      const y = height - paddingY - (yTopRatio * heightRange);
      return { x, y };
    });

    const points = pointsArray.map(p => `${p.x},${p.y}`).join(' ');
    
    // Build area fill path (line + bottom border)
    const firstX = pointsArray[0].x;
    const lastX = pointsArray[pointsArray.length - 1].x;
    const bottom = height - paddingY;
    const areaPoints = `${firstX},${bottom} ` + points + ` ${lastX},${bottom}`;
    
    return { points, areaPoints, pointsArray, maxVal, minVal, renderData };
  }, [data, height]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-slate-500 font-mono text-xs" style={{ height }}>
        [NO DATA]
      </div>
    );
  }

  // Derive a unique filter id from the color to avoid SVG filter conflicts
  const filterId = `glow-${color.replace('#', '')}`;
  const gradientId = `area-${color.replace('#', '')}`;
  const lastPoint = pointsArray?.[pointsArray.length - 1];

  return (
    <div className="relative w-full" style={{ height }}>
      <svg viewBox={`0 0 1000 ${height}`} className="w-full h-full overflow-visible">
        <defs>
          {/* Glow filter for the line */}
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Area gradient fill */}
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Axis Titles */}
        <text x="12" y={height / 2} fill="rgba(255,255,255,0.5)" fontSize="11" fontFamily="monospace" textAnchor="middle" letterSpacing="1" transform={`rotate(-90 12 ${height/2})`}>{labelText.toUpperCase()}</text>
        <text x="500" y={height - 8} fill="rgba(255,255,255,0.5)" fontSize="11" fontFamily="monospace" textAnchor="middle" letterSpacing="1">TIME (LOCAL)</text>

        {/* Grid lines & Y-axis */}
        <line x1="55" y1="35" x2="945" y2="35" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <text x="50" y="39" fill="rgba(255,255,255,0.3)" fontSize="10" fontFamily="monospace" textAnchor="end">{maxVal >= 1000 ? (maxVal/1000).toFixed(1)+'k' : maxVal.toFixed(0)}</text>
        
        <line x1="55" y1={height/2} x2="945" y2={height/2} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <text x="50" y={height/2 + 4} fill="rgba(255,255,255,0.3)" fontSize="10" fontFamily="monospace" textAnchor="end">{((maxVal + minVal) / 2) >= 1000 ? (((maxVal + minVal) / 2)/1000).toFixed(1)+'k' : ((maxVal + minVal) / 2).toFixed(0)}</text>
        
        <line x1="55" y1={height-35} x2="945" y2={height-35} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <text x="50" y={height-31} fill="rgba(255,255,255,0.3)" fontSize="10" fontFamily="monospace" textAnchor="end">{minVal >= 1000 ? (minVal/1000).toFixed(1)+'k' : minVal.toFixed(0)}</text>
        
        {/* X-axis labels */}
        {renderData.length > 0 && (
          <>
            <text x="55" y={height - 22} fill="rgba(255,255,255,0.3)" fontSize="10" fontFamily="monospace" textAnchor="start">{renderData[0].label}</text>
            <text x="945" y={height - 22} fill="rgba(255,255,255,0.3)" fontSize="10" fontFamily="monospace" textAnchor="end">{renderData[renderData.length - 1].label}</text>
          </>
        )}

        {/* Gradient area fill under the line */}
        <motion.polygon
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          points={areaPoints}
          fill={`url(#${gradientId})`}
        />

        {/* Glowing Data Line */}
        <motion.polyline
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${filterId})`}
        />
        {/* Solid line on top (no blur) for crispness */}
        <motion.polyline
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data Points */}
        {pointsArray.map((p, i) => (
          <motion.circle
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 + i * 0.04, duration: 0.2 }}
            cx={p.x}
            cy={p.y}
            r="3.5"
            fill={color}
          >
            <title>{renderData[i].label}: {renderData[i].value}</title>
          </motion.circle>
        ))}

        {/* Latest point — large pulsing beacon so the audience sees where the new value landed */}
        {lastPoint && (
          <>
            <motion.circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r="10"
              fill={color}
              initial={{ opacity: 0.6, scale: 1 }}
              animate={{ opacity: 0, scale: 2.5 }}
              transition={{ duration: 1.2, ease: 'easeOut', repeat: Infinity, repeatDelay: 0.8 }}
            />
            <motion.circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r="6"
              fill={color}
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
            />
            {/* Value label floating above the latest point */}
            <motion.text
              x={lastPoint.x}
              y={lastPoint.y - 14}
              textAnchor="middle"
              fill={color}
              fontSize="13"
              fontFamily="monospace"
              fontWeight="bold"
              initial={{ opacity: 0, y: lastPoint.y - 4 }}
              animate={{ opacity: 1, y: lastPoint.y - 14 }}
              transition={{ duration: 0.4 }}
            >
              {renderData[renderData.length - 1]?.value}
            </motion.text>
          </>
        )}
      </svg>
    </div>
  );
}
