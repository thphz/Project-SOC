import { useMemo } from 'react';
import { useGraphStore } from '../store/useGraphStore';
import { useUIStore } from '../store/useUIStore';

/**
 * Memoize display edges: inject viewMode into edge data.
 * This is all that's needed — nodes handle their own subscriptions via useNodeTelemetry.
 */
export function useDisplayEdges() {
  const edges = useGraphStore((s) => s.edges);
  const viewMode = useUIStore((s) => s.viewMode);

  const displayEdges = useMemo(() => {
    return edges.map((edge) => ({
      ...edge,
      type: edge.type || 'socEdge',
      data: {
        ...(edge.data || {}),
        viewMode,
      },
    }));
  }, [edges, viewMode]);

  return displayEdges;
}
