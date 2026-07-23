import React, { memo } from 'react';
import { 
  BaseEdge, 
  EdgeLabelRenderer, 
  getBezierPath, 
  type EdgeProps 
} from '@xyflow/react';
import { Radio, Zap } from 'lucide-react';
import type { ViewOverlayMode } from '../types/soc';

export interface SocEdgeData {
  viewMode?: ViewOverlayMode;
  mbps?: number;
  pps?: number;
  isAttack?: boolean;
  isIsolated?: boolean;
  [key: string]: any;
}

export const SocEdge = memo((props: EdgeProps) => {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data = {},
    animated = false,
  } = props;
  const className = (props as any).className || '';
  const edgeData = (data || {}) as SocEdgeData;
  const viewMode = edgeData.viewMode || 'logical';

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isDisconnected = edgeData.isIsolated || style?.stroke === '#64748B' || style?.strokeDasharray === '4 4';
  const isAttackEdge = className.includes('attack') || edgeData.isAttack || style?.stroke === '#EF4444';
  const isThreatMode = viewMode === 'threat';
  const isTrafficMode = viewMode === 'traffic';

  // Calculate Throughput Metrics
  const mbps = edgeData.mbps ?? (animated ? 450 : 120);
  const pps = edgeData.pps ?? (animated ? 1200 : 350);

  // Dynamic Stroke Width for Traffic Mode
  let computedStrokeWidth = typeof style.strokeWidth === 'number' ? style.strokeWidth : 2;
  if (isTrafficMode && !isDisconnected) {
    computedStrokeWidth = Math.min(Math.max(2, Math.round(mbps / 100)), 7);
  }

  // Dynamic Stroke Color
  let computedStroke = style.stroke || '#3B82F6';
  if (isDisconnected) {
    computedStroke = '#64748B';
  } else if (isThreatMode || isAttackEdge) {
    computedStroke = '#EF4444';
  } else if (isTrafficMode) {
    computedStroke = mbps > 400 ? '#EF4444' : mbps > 250 ? '#F59E0B' : '#10B981';
  }

  // Handle markerEnd
  let finalMarkerEnd = markerEnd;
  if ((isThreatMode || isAttackEdge) && !isDisconnected) {
    finalMarkerEnd = typeof markerEnd === 'string' ? markerEnd : `url(#soc-attack-arrow-${id})`;
  }

  const computedStyle: React.CSSProperties = {
    ...style,
    stroke: computedStroke,
    strokeWidth: computedStrokeWidth,
    ...(isDisconnected ? { strokeDasharray: '4 4' } : {}),
  };

  const isAnimated = (animated || isThreatMode || isAttackEdge || isTrafficMode) && !isDisconnected;

  return (
    <>
      <svg style={{ height: 0, width: 0, position: 'absolute', pointerEvents: 'none' }}>
        <defs>
          <marker
            id={`soc-attack-arrow-${id}`}
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#EF4444" />
          </marker>
        </defs>
      </svg>

      <BaseEdge
        id={id}
        path={edgePath}
        style={computedStyle}
        markerEnd={finalMarkerEnd}
        className={`${isAnimated ? 'animated-attack-edge' : ''} ${className}`}
      />

      {/* Bandwidth Text Label Overlay in Traffic View Mode */}
      {isTrafficMode && !isDisconnected && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-900/90 text-emerald-400 border border-emerald-500/40 shadow-lg backdrop-blur-xs flex items-center gap-1.5 z-10 select-none"
          >
            {mbps > 400 ? (
              <Zap className="w-3 h-3 text-red-400 animate-bounce" />
            ) : (
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            )}
            <span className={mbps > 400 ? 'text-red-400' : 'text-emerald-400'}>
              {mbps} Mbps | {pps} pps
            </span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

SocEdge.displayName = 'SocEdge';
