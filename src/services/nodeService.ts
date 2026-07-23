import type { Node, Connection } from '@xyflow/react';
import type { PaletteItem } from '../data/mockData';
import { useGraphStore } from '../store/useGraphStore';
import { useUIStore } from '../store/useUIStore';
import { genId } from '../utils/id';

/**
 * Node management services — add, delete, connect, layout.
 */

/**
 * Create and add a new node at the drop position.
 */
export function addNodeFromDrop(
  paletteItem: PaletteItem,
  position: { x: number; y: number },
  _reactFlowInstance?: any
): void {
  const flowPos = position;
  const newNode: Node = {
    id: genId('node'),
    type: 'socNode',
    position: flowPos,
    data: {
      hostname: `${paletteItem.label.replace(/\s+/g, '-')}-${Math.floor(Math.random() * 89 + 10)}`,
      ip: `192.168.1.${Math.floor(Math.random() * 200 + 10)}`,
      deviceType: paletteItem.type,
      status: 'healthy',
      cpu: Math.floor(Math.random() * 15 + 5),
      ram: 4.0,
      maxRam: 16.0,
      disk: 30,
      temperature: 40,
      os: paletteItem.defaultOs,
      openPorts: paletteItem.defaultPorts,
      category: paletteItem.category,
      processes: [{ pid: 1001, name: 'system_daemon', cpu: 2, memoryMb: 150 }],
      alerts: [],
    },
  };

  useGraphStore.getState().addNode(newNode);
}

/**
 * Add a node at a random position (from LeftSidebar click).
 */
export function addNodeFromPalette(item: PaletteItem): void {
  const newNode: Node = {
    id: genId('node'),
    type: 'socNode',
    position: { x: 450 + Math.random() * 100, y: 350 + Math.random() * 100 },
    data: {
      hostname: `${item.label.replace(/\s+/g, '-')}-${Math.floor(Math.random() * 89 + 10)}`,
      ip: `192.168.1.${Math.floor(Math.random() * 200 + 10)}`,
      deviceType: item.type,
      status: 'healthy',
      cpu: Math.floor(Math.random() * 15 + 5),
      ram: 4.0,
      maxRam: 16.0,
      disk: 30,
      temperature: 40,
      os: item.defaultOs,
      openPorts: item.defaultPorts,
      category: item.category,
      processes: [{ pid: 1001, name: 'system_daemon', cpu: 2, memoryMb: 150 }],
      alerts: [],
    },
  };

  useGraphStore.getState().addNode(newNode);
}

/**
 * Auto-layout nodes in a 4-column grid.
 */
export function autoLayout(fitView?: (args: { padding: number }) => void): void {
  const { nodes } = useGraphStore.getState();
  const positioned = nodes.map((node, idx) => ({
    ...node,
    position: {
      x: 200 + (idx % 4) * 220,
      y: 100 + Math.floor(idx / 4) * 160,
    },
  }));
  useGraphStore.getState().setNodes(positioned);
  if (fitView) {
    setTimeout(() => fitView({ padding: 0.2 }), 100);
  }
}

/**
 * Delete selected nodes + their edges.
 */
export function deleteSelectedNodes(): void {
  useGraphStore.getState().deleteSelectedNodes();
}

/**
 * Handle drag-over on canvas.
 */
export function onDragOver(event: React.DragEvent): void {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
}

/**
 * Handle React Flow connect event.
 */
export function handleConnect(params: Connection): void {
  useGraphStore.getState().onConnect(params);
  // Update the just-added edge to include socEdge type
  const { edges } = useGraphStore.getState();
  const lastEdge = edges[edges.length - 1];
  if (lastEdge) {
    useGraphStore.getState().updateEdgeData(lastEdge.id, {
      type: 'socEdge',
    });
  }

  useUIStore.getState().setConnecting(false);
  useGraphStore.getState().setConnectSource(null);
}

/**
 * Handle node click in connect mode.
 */
export function handleNodeClickInConnectMode(nodeId: string): void {
  const { connectSourceId } = useGraphStore.getState();

  if (!connectSourceId) {
    useGraphStore.getState().setConnectSource(nodeId);
    useGraphStore.getState().setSelection(nodeId);
  } else if (connectSourceId !== nodeId) {
    handleConnect({ source: connectSourceId, target: nodeId, sourceHandle: null, targetHandle: null });
    useGraphStore.getState().setConnectSource(null);
    useUIStore.getState().setConnecting(false);
  } else {
    useGraphStore.getState().setConnectSource(null);
  }
}

/**
 * Toggle connect cable mode.
 */
export function toggleConnect(): void {
  const { isConnecting } = useUIStore.getState();
  if (isConnecting) {
    useGraphStore.getState().setConnectSource(null);
  }
  useUIStore.getState().toggleConnecting();
}
