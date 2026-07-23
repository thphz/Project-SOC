import React from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  type Node,
  useReactFlow,
  ReactFlowProvider,
  MiniMap,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { SocNode } from './components/SocNode';
import { SocEdge } from './components/SocEdge';
import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { RightInspector } from './components/RightInspector';
import { ToolbarOverlay } from './components/ToolbarOverlay';
import { BottomDrawer } from './components/BottomDrawer';
import { LogExplorer } from './components/LogExplorer';
import { MitreMatrix } from './components/MitreMatrix';
import { ExecutiveReport } from './components/ExecutiveReport';
import { AttackerToolboxModal } from './components/AttackerToolboxModal';
import { ToastNotificationStack } from './components/ToastNotificationStack';
import type { AttackType } from './components/AttackerToolboxModal';

import { useGraphStore } from './store/useGraphStore';
import { useSimulationStore, getCurrentScenario } from './store/useSimulationStore';
import { useTelemetryStore } from './store/useTelemetryStore';
import { useUIStore } from './store/useUIStore';

import { useScheduler } from './hooks/useScheduler';
import { useDisplayEdges } from './hooks/useDisplayEdges';
import { useSelectedNode } from './hooks/useSelectedNode';

import * as incidentService from './services/incidentResponseService';
import * as scenarioService from './services/scenarioService';
import * as nodeService from './services/nodeService';
import { triggerManualAttack, advanceScenarioStep } from './services/attackService';

import type { DeviceNodeData } from './types/soc';
import type { PaletteItem } from './data/mockData';

const nodeTypes = { socNode: SocNode };
const edgeTypes = { socEdge: SocEdge };

function SocCyberRangeApp() {
  // Mount the simulation scheduler (starts engine when isSimulating=true)
  useScheduler();

  // ── Store state selectors ──
  const nodes = useGraphStore((s) => s.nodes);
  const selectedNodeId = useGraphStore((s) => s.selectedNodeId);
  const isConnecting = useUIStore((s) => s.isConnecting);
  const viewMode = useUIStore((s) => s.viewMode);
  const isAttackerToolboxOpen = useUIStore((s) => s.isAttackerToolboxOpen);
  const darkMode = useUIStore((s) => s.darkMode);
  const screenMode = useUIStore((s) => s.screenMode);
  const isSimulating = useSimulationStore((s) => s.isSimulating);
  const simSpeed = useSimulationStore((s) => s.simSpeed);
  const currentScenarioId = useSimulationStore((s) => s.currentScenarioId);
  const logs = useTelemetryStore((s) => s.logs);
  const mitrePhases = useTelemetryStore((s) => s.mitrePhases);
  const trafficHistory = useTelemetryStore((s) => s.trafficHistory);
  const toastAlerts = useTelemetryStore((s) => s.toastAlerts);
  const simTime = useTelemetryStore((s) => s.simTime);
  const selectedNode = useSelectedNode();
  const isMuted = useUIStore((s) => s.muted);

  // Store actions
  const setViewMode = useUIStore((s) => s.setViewMode);
  const toggleDarkMode = useUIStore((s) => s.toggleDarkMode);
  const setScreenMode = useUIStore((s) => s.setScreenMode);
  const toggleMute = useUIStore((s) => s.toggleMute);
  const setAttackerToolboxOpen = useUIStore((s) => s.setAttackerToolboxOpen);
  const toggleSimulation = useSimulationStore((s) => s.toggle);
  const setSpeed = useSimulationStore((s) => s.setSpeed);
  const dismissToast = useTelemetryStore((s) => s.dismissToast);
  const clearToasts = useTelemetryStore((s) => s.clearToasts);

  // React Flow instance
  const { fitView, zoomIn, zoomOut, screenToFlowPosition } = useReactFlow();

  // Derived counts
  const healthyCount = nodes.filter((n) => (n.data as DeviceNodeData).status === 'healthy').length;
  const warningCount = nodes.filter(
    (n) => (n.data as DeviceNodeData).status === 'warning' || (n.data as DeviceNodeData).status === 'scanning',
  ).length;
  const compromisedCount = nodes.filter((n) => (n.data as DeviceNodeData).status === 'compromised').length;
  const alertCount = nodes.reduce((sum, n) => sum + ((n.data as DeviceNodeData).alerts?.length || 0), 0);
  const currentScenario = getCurrentScenario(useSimulationStore.getState());

  // ── Display edges (inject viewMode) ──
  const displayEdges = useDisplayEdges();

  // Display nodes (inject viewMode + connect highlight)
  const displayNodes = React.useMemo(() => {
    const { connectSourceId } = useGraphStore.getState();
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        viewMode,
        ...(connectSourceId && node.id === connectSourceId ? { status: 'selected' as const } : {}),
      },
    }));
  }, [nodes, viewMode]);

  // ── Derive multi-selection from React Flow's built-in selected property on nodes ──
  const selectedNodeIds = React.useMemo(
    () => new Set(nodes.filter((n) => n.selected).map((n) => n.id)),
    [nodes],
  );

  const onNodesChangeWrapped = React.useCallback(
    (changes: any) => useGraphStore.getState().onNodesChange(changes),
    [],
  );
  const onEdgesChangeWrapped = React.useCallback(
    (changes: any) => useGraphStore.getState().onEdgesChange(changes),
    [],
  );

  const onConnect = React.useCallback((params: any) => {
    nodeService.handleConnect(params);
  }, []);

  const onNodeClick = React.useCallback((_: React.MouseEvent, node: Node) => {
    const { connectSourceId: cId } = useGraphStore.getState();
    if (cId) {
      nodeService.handleNodeClickInConnectMode(node.id);
    } else {
      useGraphStore.getState().setSelection(node.id);
    }
  }, []);

  const onPaneClick = React.useCallback(() => {
    useGraphStore.getState().setSelection(null);
    if (useGraphStore.getState().connectSourceId) {
      useGraphStore.getState().setConnectSource(null);
    }
  }, []);

  const onDragOver = React.useCallback((event: React.DragEvent) => {
    nodeService.onDragOver(event);
  }, []);

  const onDrop = React.useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const raw = event.dataTransfer.getData('application/reactflow');
      if (!raw) return;
      const paletteItem: PaletteItem = JSON.parse(raw);
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      nodeService.addNodeFromDrop(paletteItem, position, { screenToFlowPosition } as any);
    },
    [screenToFlowPosition],
  );

  const handleAddNodeFromPalette = React.useCallback((item: PaletteItem) => {
    nodeService.addNodeFromPalette(item);
  }, []);

  const handleAutoLayout = React.useCallback(() => {
    nodeService.autoLayout(fitView as any);
  }, [fitView]);

  const handleDeleteSelected = React.useCallback(() => {
    nodeService.deleteSelectedNodes();
  }, []);

  const handleToggleConnect = React.useCallback(() => {
    nodeService.toggleConnect();
  }, []);

  const handleResetSimulation = React.useCallback(() => {
    scenarioService.resetSimulation();
  }, []);

  const handleSelectScenario = React.useCallback((scenarioId: string) => {
    scenarioService.selectScenario(scenarioId);
  }, []);

  const handleTriggerManualAttack = React.useCallback(
    (targetNodeId: string, attackType: AttackType) => {
      triggerManualAttack(targetNodeId, attackType);
    },
    [],
  );

  const handleExecuteConsoleCommand = React.useCallback(
    (cmd: string): string => {
      const parts = cmd.trim().split(/\s+/);
      const action = parts[0].toLowerCase();
      const target = parts[1];

      const makeResult = (): Record<string, string | (() => string)> => ({
        help: [
          'Available Commands:',
          '  ping <ip/host>        - Test network latency to target node',
          '  nmap <ip/host>        - Scan listening ports & OS services',
          '  isolate <host>        - Isolate target node from network',
          '  remediate <host>      - Remediate and clear malware from host',
          '  scenario <1|2|3>      - Load specific scenario preset',
          '  status                - View overall SOC threat summary',
          '  clear                 - Clear console history',
        ].join('\n'),
        status: [
          '[SOC OVERVIEW]',
          `Healthy Devices: ${healthyCount}`,
          `Warning/Scanning: ${warningCount}`,
          `Compromised: ${compromisedCount}`,
          `Active Alerts: ${alertCount}`,
          `Active Scenario: ${currentScenario?.name || 'Manual Sandbox'}`,
        ].join('\n'),
        ping: target
          ? [
              `PING ${target} 56(84) bytes of data.`,
              `64 bytes from ${target}: icmp_seq=1 ttl=64 time=0.42 ms`,
              `64 bytes from ${target}: icmp_seq=2 ttl=64 time=0.38 ms`,
              `--- ${target} ping statistics --- 2 packets transmitted, 0% packet loss`,
            ].join('\n')
          : 'Error: Please specify target host or IP (e.g., ping WEB-API-01)',
        nmap: target
          ? [
              `Starting Nmap 7.94 scan on ${target}...`,
              'PORT     STATE SERVICE',
              '22/tcp   open  ssh (OpenSSH 8.9p1)',
              '80/tcp   open  http (Nginx 1.24.0)',
              '443/tcp   open  https (TLS v1.3)',
              '445/tcp   open  microsoft-ds (SMBv3)',
              'Nmap done: 1 IP address scanned in 0.84 seconds.',
            ].join('\n')
          : 'Error: Please specify target host (e.g., nmap 192.168.1.20)',
        isolate: (() => {
          if (!target) return 'Error: Specify host to isolate';
          const tn = nodes.find(
            (n) =>
              (n.data as DeviceNodeData).hostname.toLowerCase() === target.toLowerCase() || n.id === target,
          );
          if (tn) {
            incidentService.isolateNode(tn.id);
            return `[CONTAINMENT] Node ${(tn.data as DeviceNodeData).hostname} successfully isolated from subnet.`;
          }
          return `Error: Host ${target} not found.`;
        })(),
        remediate: (() => {
          if (!target) return 'Error: Specify host to remediate';
          const tn = nodes.find(
            (n) =>
              (n.data as DeviceNodeData).hostname.toLowerCase() === target.toLowerCase() || n.id === target,
          );
          if (tn) {
            incidentService.clearInfections(tn.id);
            return `[REMEDIATION] Malware cleared and ${(tn.data as DeviceNodeData).hostname} restored to Healthy.`;
          }
          return `Error: Host ${target} not found.`;
        })(),
        scenario: (() => {
          if (!target || !['1', '2', '3'].includes(target)) return 'Usage: scenario <1|2|3>';
          const names: Record<string, string> = {
            '1': 'scenario-1-ransomware',
            '2': 'scenario-2-ddos',
            '3': 'scenario-3-apt',
          };
          handleSelectScenario(names[target]);
          return `Loaded Scenario ${target}.`;
        })(),
      });

      const results = makeResult();
      if (action === 'clear') return '';
      if (action in results) {
        const val = results[action];
        return typeof val === 'function' ? val() : val;
      }
      return `Command not recognized: "${cmd}". Type "help" for command list.`;
    },
    [healthyCount, warningCount, compromisedCount, alertCount, currentScenario, nodes, handleSelectScenario],
  );

  // ── Render ──
  return (
    <div
      className={`h-dvh w-screen flex flex-col overflow-hidden transition-colors ${
        darkMode ? 'dark bg-[#0B1220] text-gray-100' : 'bg-slate-100 text-slate-800'
      }`}
    >
      {/* Header Bar */}
      <Header
        currentScenarioId={currentScenarioId}
        onSelectScenario={handleSelectScenario}
        isSimulating={isSimulating}
        onToggleSimulation={toggleSimulation}
        onResetSimulation={handleResetSimulation}
        simSpeed={simSpeed}
        onChangeSpeed={setSpeed}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        alertCount={alertCount}
        totalEvents={logs.length}
        simTime={simTime}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        screenMode={screenMode}
        onSelectScreenMode={setScreenMode}
      />

      {/* Toast Notifications */}
      <ToastNotificationStack alerts={toastAlerts} onDismiss={dismissToast} onClearAll={clearToasts} />

      {/* Attacker Toolbox Modal */}
      <AttackerToolboxModal
        isOpen={isAttackerToolboxOpen}
        onClose={() => setAttackerToolboxOpen(false)}
        nodes={nodes as any}
        selectedNodeId={selectedNodeId || ''}
        onTriggerAttack={(targetId, type) => {
          handleTriggerManualAttack(targetId, type);
          setAttackerToolboxOpen(false);
        }}
      />

      {/* Main Screen Mode Views */}
      {screenMode === 'canvas' && (
        <div className="flex-1 flex overflow-hidden relative min-h-0">
          {/* Left Sidebar */}
          <LeftSidebar onAddNode={handleAddNodeFromPalette} nodeCount={nodes.length} />

          {/* Center Canvas */}
          <div
            className="flex-1 relative border-x-2 border-slate-300 dark:border-slate-700/80"
            onDragOver={onDragOver}
            onDrop={onDrop}
          >
            <ToolbarOverlay
              viewMode={viewMode}
              onChangeViewMode={setViewMode}
              onAutoLayout={handleAutoLayout}
              onZoomIn={() => zoomIn()}
              onZoomOut={() => zoomOut()}
              onFitView={() => fitView({ padding: 0.2 })}
              onClearCanvas={() => {
                useGraphStore.getState().setNodes([]);
                useGraphStore.getState().setSelection(null, new Set());
              }}
              onDeleteSelected={handleDeleteSelected}
              isConnecting={isConnecting}
              onToggleConnect={handleToggleConnect}
              onOpenAttackerToolbox={() => setAttackerToolboxOpen(true)}
            />

            <ReactFlow
              nodes={displayNodes}
              edges={displayEdges}
              onNodesChange={onNodesChangeWrapped}
              onEdgesChange={onEdgesChangeWrapped}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              multiSelectionKeyCode="Shift"
              selectionOnDrag
              panOnDrag={[2]}
              panOnScroll
              nodeTypes={nodeTypes as any}
              edgeTypes={edgeTypes as any}
              fitView
              attributionPosition="bottom-left"
              className={darkMode ? 'bg-[#0B1220]' : 'bg-slate-50'}
            >
              <Background
                id="minor-grid"
                variant={BackgroundVariant.Lines}
                gap={8}
                size={1}
                color={darkMode ? 'rgba(51, 65, 85, 0.22)' : 'rgba(203, 213, 225, 0.6)'}
              />
              <Background
                id="major-grid"
                variant={BackgroundVariant.Lines}
                gap={40}
                size={1}
                color={darkMode ? 'rgba(59, 130, 246, 0.22)' : 'rgba(59, 130, 246, 0.18)'}
              />
              <Controls />
              <MiniMap
                style={{
                  height: 100,
                  width: 140,
                  backgroundColor: darkMode ? '#070B14' : '#FFFFFF',
                  borderRadius: '8px',
                  border: darkMode ? '1px solid #374151' : '1px solid #E2E8F0',
                }}
                nodeColor={(node) => {
                  const status = (node.data as DeviceNodeData)?.status;
                  if (status === 'compromised') return '#EF4444';
                  if (status === 'warning') return '#F59E0B';
                  return '#3B82F6';
                }}
              />
            </ReactFlow>
          </div>

          {/* Right Inspector */}
          <RightInspector
            selectedNode={selectedNode}
            onClose={() => useGraphStore.getState().setSelection(null)}
            onIsolateNode={incidentService.isolateNode}
            onKillProcess={incidentService.killProcess}
            onPatchVulnerability={incidentService.patchVulnerability}
            onClearInfections={incidentService.clearInfections}
            onOpenAttackerToolbox={() => setAttackerToolboxOpen(true)}
            multiSelectedCount={selectedNodeIds.size > 1 ? selectedNodeIds.size : undefined}
          />
        </div>
      )}

      {/* Log Explorer */}
      {screenMode === 'logs' && (
        <LogExplorer
          onClearLogs={() => useTelemetryStore.getState().clearLogs()}
          onClose={() => setScreenMode('canvas')}
          logs={logs}
        />
      )}

      {/* MITRE Matrix */}
      {screenMode === 'mitre' && (
        <div className="flex-1 overflow-hidden relative">
          <MitreMatrix
            logs={logs}
            nodes={nodes}
            onExecuteCustomScenario={(scenario) => {
              scenarioService.executeCustomScenario(scenario);
            }}
            currentStepIndex={useSimulationStore.getState().currentStepIndex}
            onClose={() => setScreenMode('canvas')}
          />
        </div>
      )}

      {/* Executive Report */}
      {screenMode === 'report' && (
        <div className="flex-1 overflow-hidden relative">
          <ExecutiveReport
            nodes={nodes as any}
            logs={logs}
            alertCount={alertCount}
            onIsolateNode={incidentService.isolateNode}
            onClearInfections={incidentService.clearInfections}
            onClose={() => setScreenMode('canvas')}
          />
        </div>
      )}

      {/* Bottom Drawer */}
      {screenMode === 'canvas' && (
        <BottomDrawer
          logs={logs}
          mitrePhases={mitrePhases}
          currentStepIndex={useSimulationStore.getState().currentStepIndex}
          totalSteps={currentScenario?.steps.length || 0}
          onScrubStep={() => {
            advanceScenarioStep();
          }}
          onExecuteConsoleCommand={handleExecuteConsoleCommand}
          trafficHistory={trafficHistory}
          healthyCount={healthyCount}
          warningCount={warningCount}
          compromisedCount={compromisedCount}
          onOpenLogExplorer={() => setScreenMode('logs')}
          onOpenMitreMatrix={() => setScreenMode('mitre')}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <SocCyberRangeApp />
    </ReactFlowProvider>
  );
}
