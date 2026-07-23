import { genId } from '../utils/id';
import { useGraphStore } from '../store/useGraphStore';
import { useTelemetryStore } from '../store/useTelemetryStore';
import { eventBus } from '../engine/eventBus';

/**
 * Incident Response Services — isolate, kill process, patch, clear infections.
 */

/**
 * Toggle isolation state of a node and its connected edges.
 */
export function isolateNode(nodeId: string): void {
  const graphState = useGraphStore.getState();
  const node = graphState.nodes.find((n) => n.id === nodeId);
  if (!node) return;

  const data = node.data as any;
  const toggledIsIsolated = !data.isIsolated;
  const simTime = useTelemetryStore.getState().simTime;

  // Update the node's isolation state
  useGraphStore.getState().updateNodeData(nodeId, {
    isIsolated: toggledIsIsolated,
    status: toggledIsIsolated ? 'offline' : 'healthy',
  });

  // Update all connected edges
  graphState.edges.forEach((edge) => {
    if (edge.source === nodeId || edge.target === nodeId) {
      const otherId = edge.source === nodeId ? edge.target : edge.source;
      const otherNode = graphState.nodes.find((n) => n.id === otherId);
      const otherIsIsolated = (otherNode?.data as any)?.isIsolated;
      const shouldBeIsolated = toggledIsIsolated || otherIsIsolated;

      useGraphStore.getState().updateEdgeData(edge.id, {
        isIsolated: shouldBeIsolated,
        animated: !shouldBeIsolated,
        stroke: shouldBeIsolated ? '#64748B' : '#3B82F6',
        strokeDasharray: shouldBeIsolated ? '4 4' : undefined,
      });
    }
  });

  // Log the event
  useTelemetryStore.getState().addLog({
    id: genId('log'),
    timestamp: simTime,
    level: 'WARNING',
    message: `INCIDENT RESPONSE: Node ${nodeId} network interface toggled ${toggledIsIsolated ? 'ISOLATED' : 'RECONNECTED'}.`,
  });

  eventBus.emit('NODE_ISOLATED', { nodeId, isolated: toggledIsIsolated });
}

/**
 * Kill a process on a node by PID.
 */
export function killProcess(nodeId: string, pid: number): void {
  const graphState = useGraphStore.getState();
  const node = graphState.nodes.find((n) => n.id === nodeId);
  if (!node) return;

  const data = node.data as any;
  const filteredProcs = (data.processes || []).filter((p: any) => p.pid !== pid);
  const killedProc = (data.processes || []).find((p: any) => p.pid === pid);
  const simTime = useTelemetryStore.getState().simTime;

  useGraphStore.getState().updateNodeData(nodeId, {
    cpu: Math.max(data.cpu - 30, 15),
    processes: filteredProcs,
  });

  useTelemetryStore.getState().addLog({
    id: genId('log'),
    timestamp: simTime,
    level: 'INFO',
    sourceNodeId: nodeId,
    message: `SOC RESPONSE: Malicious process PID ${pid} (${killedProc?.name || 'unknown'}) terminated on ${nodeId}.`,
  });

  eventBus.emit('PROCESS_KILLED', { nodeId, pid, name: killedProc?.name || 'unknown' });
}

/**
 * Patch system vulnerabilities on a node.
 */
export function patchVulnerability(nodeId: string): void {
  const simTime = useTelemetryStore.getState().simTime;

  useGraphStore.getState().updateNodeData(nodeId, {
    isVulnerable: false,
    cves: [],
  });

  useTelemetryStore.getState().addLog({
    id: genId('log'),
    timestamp: simTime,
    level: 'INFO',
    sourceNodeId: nodeId,
    message: `PATCH MANAGEMENT: Critical security patches applied to ${nodeId}.`,
  });
}

/**
 * Clear infections from a node: remove malicious processes and alerts, set to healthy.
 */
export function clearInfections(nodeId: string): void {
  const graphState = useGraphStore.getState();
  const node = graphState.nodes.find((n) => n.id === nodeId);
  if (!node) return;

  const data = node.data as any;
  const simTime = useTelemetryStore.getState().simTime;

  useGraphStore.getState().updateNodeData(nodeId, {
    status: 'healthy',
    cpu: 18,
    processes: (data.processes || []).filter((p: any) => !p.isMalicious),
    alerts: [],
  });

  useTelemetryStore.getState().addLog({
    id: genId('log'),
    timestamp: simTime,
    level: 'INFO',
    sourceNodeId: nodeId,
    message: `REMEDIATION COMPLETE: Device ${nodeId} restored to healthy state.`,
  });

  eventBus.emit('NODE_RECOVERED', { nodeId });
}
