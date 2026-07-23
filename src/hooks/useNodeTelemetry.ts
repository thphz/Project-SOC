import { useSyncExternalStore, useCallback, useRef } from 'react';
import { useGraphStore } from '../store/useGraphStore';
import type { DeviceNodeData } from '../types/soc';

/**
 * Performance-critical hook: subscribes SocNode to ONLY its own data slice.
 * Uses useSyncExternalStore to minimize re-renders.
 * The node re-renders ONLY when its own data changes, not when other nodes change.
 */
export function useNodeTelemetry(
  nodeId: string
): DeviceNodeData | undefined {
  const snapshotRef = useRef<DeviceNodeData | undefined>(undefined);

  const subscribe = useCallback(
    (callback: () => void) => {
      return useGraphStore.subscribe((_state, prevState) => {
        const prevNode = prevState.nodes.find((n) => n.id === nodeId);
        const currNode = useGraphStore.getState().nodes.find((n) => n.id === nodeId);
        if (prevNode?.data !== currNode?.data) {
          callback();
        }
      });
    },
    [nodeId],
  );

  const getSnapshot = useCallback((): DeviceNodeData | undefined => {
    const data = useGraphStore.getState().nodes.find((n) => n.id === nodeId)?.data as
      | DeviceNodeData
      | undefined;
    const prev = snapshotRef.current;
    if (prev && data && isShallowEqual(prev, data)) {
      return prev; // return stable reference when data hasn't materially changed
    }
    snapshotRef.current = data;
    return data;
  }, [nodeId]);

  return useSyncExternalStore(subscribe, getSnapshot);
}

/**
 * Shallow comparison for objects.
 */
function isShallowEqual(a: Record<string, any>, b: Record<string, any>): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!Object.is(a[key], b[key])) {
      if (Array.isArray(a[key]) && Array.isArray(b[key])) {
        if (a[key].length !== b[key].length) return false;
        if (a[key] !== b[key]) return false;
      } else {
        return false;
      }
    }
  }
  return true;
}
