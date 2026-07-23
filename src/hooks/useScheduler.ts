import { useEffect, useRef } from 'react';
import { useGraphStore } from '../store/useGraphStore';
import { useSimulationStore } from '../store/useSimulationStore';
import { useTelemetryStore } from '../store/useTelemetryStore';
import { simulationEngine } from '../engine/simulationEngine';

/**
 * Mount and manage the simulation engine lifecycle.
 * Connect stores to engine, start/stop based on isSimulating.
 */
export function useScheduler(): void {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Connect stores to the engine
    simulationEngine.connectStores({
      getNodes: () => useGraphStore.getState().nodes.map((n) => ({
        id: n.id,
        data: n.data as any,
      })),
      getEdges: () => useGraphStore.getState().edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        data: e.data,
      })),
      updateNodes: (patches) => {
        useGraphStore.getState().updateNodeDataBatch(patches);
      },
      updateEdges: (updates) => {
        useGraphStore.getState().updateEdgesBatch(updates);
      },
      appendLogs: (logs) => {
        useTelemetryStore.getState().addLogs(logs);
      },
      appendToasts: (toasts) => {
        useTelemetryStore.getState().addToasts(toasts);
      },
    });
  }, []);

  // Sync simSpeed changes to engine
  useEffect(() => {
    const unsub = useSimulationStore.subscribe((state, prev) => {
      if (state.simSpeed !== prev.simSpeed) {
        simulationEngine.setSpeed(state.simSpeed);
      }
    });
    return unsub;
  }, []);

  // Start/stop engine based on isSimulating
  useEffect(() => {
    const unsub = useSimulationStore.subscribe((state, prev) => {
      if (state.isSimulating && !prev.isSimulating) {
        simulationEngine.start();
      } else if (!state.isSimulating && prev.isSimulating) {
        simulationEngine.stop();
      }
    });
    return unsub;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      simulationEngine.destroy();
    };
  }, []);
}
