import { genId } from '../utils/id';
import { useGraphStore } from '../store/useGraphStore';
import { useSimulationStore } from '../store/useSimulationStore';
import { useTelemetryStore } from '../store/useTelemetryStore';
import { eventBus } from '../engine/eventBus';
import { getProfile } from '../data/deviceProfiles';
import type { DeviceNodeData, EventLogItem } from '../types/soc';
import { PRESET_SCENARIOS } from '../data/mockData';

/**
 * Execute a single attack step from a scenario.
 */
export function executeAttackStep(stepIndex: number): void {
  const state = useSimulationStore.getState();
  const allScenarios = [...PRESET_SCENARIOS, ...state.customScenarios];
  const currentScenario = allScenarios.find((s) => s.id === state.currentScenarioId);
  if (!currentScenario || stepIndex > currentScenario.steps.length) return;

  const step = currentScenario.steps[stepIndex - 1];
  if (!step) return;

  const graphState = useGraphStore.getState();
  const sourceNode = graphState.nodes.find((n) => n.id === step.sourceNodeId);
  const targetNode = graphState.nodes.find((n) => n.id === step.targetNodeId);
  if (!sourceNode || !targetNode) return;

  const sourceData = sourceNode.data as DeviceNodeData;
  const targetData = targetNode.data as DeviceNodeData;

  // Isolation containment check
  const isSourceIsolated = sourceData.isIsolated || sourceData.status === 'offline';
  const isTargetIsolated = targetData.isIsolated || targetData.status === 'offline';

  if (isSourceIsolated || isTargetIsolated) {
    const blockedHost = isTargetIsolated ? targetData.hostname || step.targetNodeId : sourceData.hostname || step.sourceNodeId;
    useTelemetryStore.getState().addLog({
      id: genId('log'),
      timestamp: useTelemetryStore.getState().simTime,
      level: 'WARNING',
      sourceNodeId: step.sourceNodeId,
      message: `[ISOLATION CONTAINMENT] Attack propagation to/from isolated node "${blockedHost}" was blocked by SOC policy.`,
      mitrePhase: step.mitreTechnique,
    });
    return;
  }

  // Apply attack to target node
  const updates: Partial<DeviceNodeData> = {
    status: step.targetStatus,
    cpu: Math.min(targetData.cpu + 35, 99),
  };

  // Add malicious process
  const updatedProcesses = [...(targetData.processes || [])];
  if (step.maliciousProcess && !updatedProcesses.some((p) => p.name === step.maliciousProcess)) {
    updatedProcesses.unshift({
      pid: Math.floor(Math.random() * 8000 + 1000),
      name: step.maliciousProcess,
      cpu: 45,
      memoryMb: 850,
      isMalicious: true,
    });
  }
  updates.processes = updatedProcesses;

  // Add alert
  const updatedAlerts = [...(targetData.alerts || [])];
  if (step.alertTitle) {
    updatedAlerts.unshift({
      id: genId('alt'),
      title: step.alertTitle,
      severity: 'critical',
      timestamp: useTelemetryStore.getState().simTime,
      description: step.description,
    });
  }
  updates.alerts = updatedAlerts;

  // Apply behavior profile reaction
  const profile = getProfile(targetData.deviceType);
  const reaction = profile.reactToAttack(targetData, step.mitreTechnique);
  Object.assign(updates, reaction);

  useGraphStore.getState().updateNodeData(step.targetNodeId, updates);

  // Update edge animation
  useGraphStore.getState().updateEdgeData(`${step.sourceNodeId}_${step.targetNodeId}`, {
    isAttack: step.edgeAnimation === 'attack',
    className: step.edgeAnimation === 'attack' ? 'animated-attack-edge' : 'animated-warning-edge',
    stroke: step.edgeAnimation === 'attack' ? '#EF4444' : '#D97706',
  });

  // Append log
  const newLog: EventLogItem = {
    id: genId('log'),
    timestamp: useTelemetryStore.getState().simTime,
    level: step.logLevel,
    sourceNodeId: step.sourceNodeId,
    sourceHost: sourceData.hostname,
    message: step.logMessage,
    mitrePhase: step.mitreTechnique,
    details: step.description,
  };
  useTelemetryStore.getState().addLog(newLog);

  // Advance MITRE phase
  if (step.mitrePhaseId) {
    useTelemetryStore.getState().advanceMitre(step.mitrePhaseId, 'active');
  }

  // Push traffic sample
  const alertCount = useTelemetryStore.getState().toastAlerts.length;
  useTelemetryStore.getState().pushTraffic({
    time: useTelemetryStore.getState().simTime,
    mbps: Math.floor(Math.random() * 200 + 700 + stepIndex * 80),
    alerts: alertCount + 1,
  });

  // Emit event
  eventBus.emit('ATTACK_TRIGGERED', { nodeId: step.targetNodeId, attackType: step.mitreTechnique });
  if (step.targetStatus === 'compromised') {
    eventBus.emit('NODE_COMPROMISED', { nodeId: step.targetNodeId });
  }
}

/**
 * Execute the next step in the current scenario.
 * Returns false if scenario is complete.
 */
export function advanceScenarioStep(): boolean {
  const simState = useSimulationStore.getState();
  const nextStep = simState.currentStepIndex + 1;
  const allScenarios = [...PRESET_SCENARIOS, ...simState.customScenarios];
  const scenario = allScenarios.find((s) => s.id === simState.currentScenarioId);

  if (!scenario || nextStep > scenario.steps.length) {
    useSimulationStore.getState().setSimulating(false);
    eventBus.emit('SCENARIO_COMPLETED', { scenarioId: simState.currentScenarioId });
    return false;
  }

  executeAttackStep(nextStep);
  useSimulationStore.getState().advanceStep();
  return true;
}

/**
 * 5 manual attack vectors. Each performs a different set of mutations.
 */
export function triggerManualAttack(targetNodeId: string, attackType: string): void {
  const graphState = useGraphStore.getState();
  const targetNode = graphState.nodes.find((n) => n.id === targetNodeId);
  if (!targetNode) return;

  const targetData = targetNode.data as DeviceNodeData;
  const hostname = targetData.hostname;
  const ip = targetData.ip;
  const simTime = useTelemetryStore.getState().simTime;
  const telemetry = useTelemetryStore.getState();

  switch (attackType) {
    case 'nmap': {
      const scannedPorts = [22, 80, 445, 3389, 8080];
      const newPorts = Array.from(new Set([...(targetData.openPorts || []), ...scannedPorts]));
      useGraphStore.getState().updateNodeData(targetNodeId, { status: 'scanning', openPorts: newPorts });

      telemetry.addLog({
        id: genId('log'),
        timestamp: simTime,
        level: 'INFO',
        sourceNodeId: targetNodeId,
        sourceHost: hostname,
        message: `[NMAP SCAN] Active port scan executed on ${hostname} (${ip}). Discovered open listening ports: ${newPorts.join(', ')}.`,
        mitrePhase: 'T1595 - Active Scanning',
      });
      telemetry.advanceMitre('recon', 'active');
      telemetry.addToast({
        id: genId('toast'),
        title: 'Nmap Port Scan Executed',
        severity: 'high',
        hostName: hostname,
        hostIp: ip,
        timestamp: simTime,
        message: `Active Nmap reconnaissance scan targeted host ${hostname} (${ip}).`,
      });
      break;
    }
    case 'brute_force': {
      useGraphStore.getState().updateNodeData(targetNodeId, {
        status: 'warning',
        cpu: Math.min((targetData.cpu || 0) + 45, 88),
        alerts: [
          {
            id: genId('alt'),
            title: 'SSH/RDP Brute Force Attack',
            severity: 'high',
            timestamp: simTime,
            description: '500+ failed authentication requests from remote host.',
          },
          ...(targetData.alerts || []),
        ],
      });
      telemetry.addLog({
        id: genId('log'),
        timestamp: simTime,
        level: 'WARNING',
        sourceNodeId: targetNodeId,
        sourceHost: hostname,
        message: `[BRUTE FORCE] Massive brute force attack detected on ${hostname} (${ip}) — 500+ failed authentication attempts.`,
        mitrePhase: 'T1110 - Brute Force',
      });
      telemetry.advanceMitre('credential-access', 'active');
      telemetry.addToast({
        id: genId('toast'),
        title: 'Brute Force Attack in Progress',
        severity: 'high',
        hostName: hostname,
        hostIp: ip,
        timestamp: simTime,
        message: `Brute force attack detected on ${hostname}. 500+ failed SSH/RDP attempts.`,
      });
      break;
    }
    case 'ransomware': {
      const updatedProcesses = [...(targetData.processes || [])];
      updatedProcesses.unshift({
        pid: Math.floor(Math.random() * 8000 + 1000),
        name: 'encryptor.exe',
        cpu: 75,
        memoryMb: 900,
        isMalicious: true,
      });
      useGraphStore.getState().updateNodeData(targetNodeId, {
        status: 'compromised',
        cpu: 99,
        processes: updatedProcesses,
        alerts: [
          {
            id: genId('alt'),
            title: '⚠️ RANSOMWARE INFECTION',
            severity: 'critical',
            timestamp: simTime,
            description: `File encryption process detected on ${hostname}! Immediate response required.`,
          },
          ...(targetData.alerts || []),
        ],
      });
      telemetry.addLog({
        id: genId('log'),
        timestamp: simTime,
        level: 'CRITICAL',
        sourceNodeId: targetNodeId,
        sourceHost: hostname,
        message: `[INCIDENT] Ransomware payload executed on ${hostname} (${ip}) — file system encryption in progress on all mount points.`,
        mitrePhase: 'T1486 - Data Encrypted for Impact',
      });
      telemetry.advanceMitre('impact', 'active');
      telemetry.addToast({
        id: genId('toast'),
        title: '🚨 RANSOMWARE DETECTED',
        severity: 'critical',
        hostName: hostname,
        hostIp: ip,
        timestamp: simTime,
        message: `Ransomware outbreak on ${hostname}! Files being encrypted. Deploy containment immediately.`,
      });
      eventBus.emit('ATTACK_TRIGGERED', { nodeId: targetNodeId, attackType: 'ransomware' });
      eventBus.emit('NODE_COMPROMISED', { nodeId: targetNodeId });
      break;
    }
    case 'ddos': {
      useGraphStore.getState().updateNodeData(targetNodeId, {
        status: 'compromised',
        cpu: 100,
        throughputMbps: 980,
        pps: 85000,
        congestion: 0.95,
        alerts: [
          {
            id: genId('alt'),
            title: '🚨 VOLUMETRIC DDoS SYNC FLOOD',
            severity: 'critical',
            timestamp: simTime,
            description: `Massive DDoS volume detected on ${hostname} — 980 Mbps / 85 Kpps inbound. Service disruption imminent.`,
          },
          ...(targetData.alerts || []),
        ],
      });
      telemetry.pushTraffic({ time: simTime, mbps: 980, alerts: (targetData.alerts?.length || 0) + 1 });
      telemetry.addLog({
        id: genId('log'),
        timestamp: simTime,
        level: 'CRITICAL',
        sourceNodeId: targetNodeId,
        sourceHost: hostname,
        message: `[DDoS] Volumetric SYN flood targeting ${hostname} (${ip}) — 980 Mbps / 85 Kpps — C2 infrastructure engaged.`,
        mitrePhase: 'T1498 - Network Denial of Service',
      });
      telemetry.advanceMitre('impact', 'active');
      telemetry.addToast({
        id: genId('toast'),
        title: '🚨 VOLUMETRIC DDoS SYNC FLOOD',
        severity: 'critical',
        hostName: hostname,
        hostIp: ip,
        timestamp: simTime,
        message: `DDoS SYN flood detected on ${hostname}! 980 Mbps / 85 Kpps inbound traffic.`,
      });
      eventBus.emit('ATTACK_TRIGGERED', { nodeId: targetNodeId, attackType: 'ddos' });
      eventBus.emit('NODE_COMPROMISED', { nodeId: targetNodeId });
      break;
    }
    case 'exfiltration': {
      const updatedProcs = [...(targetData.processes || [])];
      updatedProcs.unshift({
        pid: Math.floor(Math.random() * 8000 + 1000),
        name: 'exfil_agent.exe',
        cpu: 35,
        memoryMb: 450,
        isMalicious: true,
      });
      useGraphStore.getState().updateNodeData(targetNodeId, {
        status: 'warning',
        cpu: Math.min((targetData.cpu || 0) + 30, 85),
        processes: updatedProcs,
        throughputMbps: (targetData.throughputMbps || 250) * 3,
        alerts: [
          {
            id: genId('alt'),
            title: '⚠️ DATA EXFILTRATION DETECTED',
            severity: 'critical',
            timestamp: simTime,
            description: `Large outbound data transfer detected from ${hostname} (${ip}) to external Tor exit node.`,
          },
          ...(targetData.alerts || []),
        ],
      });
      telemetry.addLog({
        id: genId('log'),
        timestamp: simTime,
        level: 'CRITICAL',
        sourceNodeId: targetNodeId,
        sourceHost: hostname,
        message: `[EXFIL] 4.8 GB exfiltrated from ${hostname} (${ip}) to external Tor exit node 185.220.101.5 via C2 tunnel.`,
        mitrePhase: 'T1041 - Exfiltration Over C2',
      });
      telemetry.advanceMitre('exfiltration', 'active');
      telemetry.addToast({
        id: genId('toast'),
        title: '🚨 DATA EXFILTRATION',
        severity: 'critical',
        hostName: hostname,
        hostIp: ip,
        timestamp: simTime,
        message: `Data exfiltration detected on ${hostname}! 4.8 GB transferred to external C2 endpoint.`,
      });
      eventBus.emit('ATTACK_TRIGGERED', { nodeId: targetNodeId, attackType: 'exfiltration' });
      break;
    }
  }
}
