import type { DeviceNodeData } from '../../types/soc';
import type { Patch, SystemContext, RoutingMetrics } from '../../types/engine';
import { getProfile } from '../../data/deviceProfiles';
import { jitterClamped, randFloat } from '../../utils/random';

interface EdgeInfo {
  id: string;
  source: string;
  target: string;
  data?: Record<string, any>;
}

interface TrafficResult {
  edgeUpdates: Array<{ edgeId: string; data: Partial<RoutingMetrics> }>;
  nodePatches: Patch[];
}

/**
 * Compute shortest-path topology ordering from internet-facing nodes.
 * Distributes traffic proportionally downstream.
 */
/**
 * TrafficSystem: compute bandwidth/latency/packetLoss/congestion for every edge.
 * Updates node throughputMbps/pps as well.
 */
export function trafficTick(
  nodes: { id: string; data: DeviceNodeData }[],
  edges: EdgeInfo[],
  _ctx: SystemContext
): TrafficResult {
  const edgeUpdates: TrafficResult['edgeUpdates'] = [];
  const nodePatches: Patch[] = [];

  const nodeThroughput = new Map<string, number>();

  // Assign base throughput from internet sources
  for (const node of nodes) {
    const profile = getProfile(node.data.deviceType);
    const base = node.data.throughputMbps ?? profile.baseThroughputMbps;
    nodeThroughput.set(node.id, jitterClamped(base, profile.throughputJitter, 0, 99999));
  }

  // For each edge, compute metrics
  for (const edge of edges) {
    const sourceData = nodes.find(n => n.id === edge.source)?.data;
    const targetData = nodes.find(n => n.id === edge.target)?.data;
    if (!sourceData || !targetData) continue;

    const srcThroughput = nodeThroughput.get(edge.source) ?? 100;
    const tgtThroughput = nodeThroughput.get(edge.target) ?? 100;
    const avgThroughput = (srcThroughput + tgtThroughput) / 2;

    // Distribute: an edge carries a share of the source's traffic
    const sourceDegree = edges.filter(e => e.source === edge.source).length || 1;
    const mbps = avgThroughput / sourceDegree;

    // PPS = Mbps * 250 (rough avg packet size 500 bytes)
    const pps = Math.round(mbps * 250);

    // Latency: base 0.5ms + distance factor + congestion
    const baseLatency = 0.5 + (sourceData.deviceType === 'internet' ? 15 : 0);
    const latency = baseLatency + randFloat(0.1, 1.0);

    // Packet loss: 0-0.5% baseline, higher if congested
    const packetLoss = randFloat(0, 0.5);

    // Congestion: 0-0.3 baseline, scales with CPU of source node
    const congestion = Math.min(0.3, (sourceData.cpu / 200) + randFloat(0, 0.1));

    edgeUpdates.push({
      edgeId: edge.id,
      data: {
        mbps: Math.round(mbps),
        pps,
        latency: Math.round(latency * 10) / 10,
        packetLoss: Math.round(packetLoss * 10) / 10,
        congestion: Math.round(congestion * 100) / 100,
      },
    });
  }

  // Update node throughputMbps and pps from the computed averages
  for (const [nodeId, mbps] of nodeThroughput) {
    nodePatches.push({
      nodeId,
      data: {
        throughputMbps: Math.round(mbps),
        pps: Math.round(mbps * 250),
      },
    });
  }

  return { edgeUpdates, nodePatches };
}
