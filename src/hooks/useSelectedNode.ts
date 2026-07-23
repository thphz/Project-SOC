import { useMemo } from 'react';
import { useGraphStore } from '../store/useGraphStore';
import type { DeviceNodeData } from '../types/soc';

/**
 * Subscribe to the selected node from graph store.
 * Returns { id, data } or null — memoized for stable reference.
 */
export function useSelectedNode(): { id: string; data: DeviceNodeData } | null {
  const selectedNodeId = useGraphStore((s) => s.selectedNodeId);
  const nodes = useGraphStore((s) => s.nodes);

  return useMemo(() => {
    if (!selectedNodeId) return null;
    const found = nodes.find((n) => n.id === selectedNodeId);
    return found ? { id: found.id, data: found.data as DeviceNodeData } : null;
  }, [selectedNodeId, nodes]);
}
