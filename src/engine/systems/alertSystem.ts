import type { DeviceNodeData, DeviceAlert, ToastAlert } from '../../types/soc';
import type { Patch, SystemContext } from '../../types/engine';
import { genId } from '../../utils/id';

interface AlertResult {
  nodePatches: Patch[];
  newAlerts: DeviceAlert[];
  newToasts: ToastAlert[];
}

/**
 * AlertSystem: evaluate telemetry thresholds for every node.
 * Raises alerts when CPU, RAM, disk, temperature, or other metrics exceed thresholds.
 */
export function alertTick(
  nodes: { id: string; data: DeviceNodeData }[],
  _edges: any[],
  ctx: SystemContext
): AlertResult {
  const nodePatches: Patch[] = [];
  const newAlerts: DeviceAlert[] = [];
  const newToasts: ToastAlert[] = [];

  for (const node of nodes) {
    const data = node.data;
    const alerts: DeviceAlert[] = [];
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let title = '';

    // CPU overload
    if (data.cpu > 90) {
      alerts.push({
        id: genId('alert'),
        title: `CPU Overload: ${data.cpu}%`,
        severity: 'critical',
        timestamp: ctx.simTime,
        description: `Node ${data.hostname} CPU at ${data.cpu}% — possible resource exhaustion or malicious activity.`,
      });
      title = `🚨 CPU critical on ${data.hostname}`;
      severity = 'critical';
    } else if (data.cpu > 75) {
      alerts.push({
        id: genId('alert'),
        title: `CPU High: ${data.cpu}%`,
        severity: 'high',
        timestamp: ctx.simTime,
        description: `Node ${data.hostname} CPU at ${data.cpu}%.`,
      });
      title = `⚠️ CPU high on ${data.hostname}`;
      severity = 'high';
    }

    // Disk near full
    if (data.disk > 90) {
      alerts.push({
        id: genId('alert'),
        title: `Disk Near Full: ${data.disk}%`,
        severity: 'high',
        timestamp: ctx.simTime,
        description: `Node ${data.hostname} disk at ${data.disk}%.`,
      });
      if (!title) {
        title = `💾 Disk critical on ${data.hostname}`;
        severity = 'high';
      }
    }

    // Temperature
    const temp = data.temperature ?? 40;
    if (temp > 80) {
      alerts.push({
        id: genId('alert'),
        title: `Overheating: ${temp}°C`,
        severity: 'high',
        timestamp: ctx.simTime,
        description: `Node ${data.hostname} temperature at ${temp}°C.`,
      });
      if (severity !== 'critical') {
        title = `🌡️ Overheat on ${data.hostname}`;
        severity = 'high';
      }
    }

    // Malicious process present
    const hasMalicious = data.processes?.some(p => p.isMalicious);
    if (hasMalicious) {
      alerts.push({
        id: genId('alert'),
        title: 'Malicious Process Detected',
        severity: 'critical',
        timestamp: ctx.simTime,
        description: `Node ${data.hostname} has a known malicious process running.`,
      });
      title = `☠️ Malware on ${data.hostname}`;
      severity = 'critical';
    }

    if (alerts.length > 0) {
      const existingAlertIds = new Set(data.alerts?.map(a => a.title) ?? []);
      const newNodeAlerts = alerts.filter(a => !existingAlertIds.has(a.title));
      if (newNodeAlerts.length > 0) {
        nodePatches.push({
          nodeId: node.id,
          data: {
            alerts: [...(data.alerts ?? []), ...newNodeAlerts],
          },
        });
        newAlerts.push(...newNodeAlerts);

        newToasts.push({
          id: genId('toast'),
          title,
          severity,
          hostName: data.hostname,
          hostIp: data.ip,
          message: title,
          timestamp: ctx.simTime,
        });
      }
    }
  }

  return { nodePatches, newAlerts, newToasts };
}
