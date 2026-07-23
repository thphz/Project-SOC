import { create } from 'zustand';
import {
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Connection,
} from '@xyflow/react';
import type { DeviceNodeData } from '../types/soc';
import { INITIAL_NODES, INITIAL_EDGES } from '../data/mockData';

export interface GraphState {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  selectedNodeIds: Set<string>;
  connectSourceId: string | null;
}

export interface GraphActions {
  /** Replace entire nodes array (for batch updates from engine). */
  setNodes: (nodes: Node[]) => void;
  /** React Flow node changes handler (drag, select, remove). */
  onNodesChange: (changes: NodeChange[]) => void;
  /** React Flow edge changes handler. */
  onEdgesChange: (changes: EdgeChange[]) => void;
  /** React Flow connect handler. */
  onConnect: (connection: Connection) => void;
  /** Batch-update multiple nodes' data slices. Only creates new objects for changed nodes. */
  updateNodeDataBatch: (patches: Array<{ nodeId: string; data: Partial<DeviceNodeData> }>) => void;
  /** Update a single node's data. */
  updateNodeData: (nodeId: string, data: Partial<DeviceNodeData>) => void;
  /** Add a new node. */
  addNode: (node: Node) => void;
  /** Delete a single node by id (also removes connected edges). */
  deleteNode: (nodeId: string) => void;
  /** Delete selected nodes + their edges. */
  deleteSelectedNodes: () => void;
  /** Update an edge's data (for traffic/latency metrics). */
  updateEdgeData: (edgeId: string, data: Record<string, any>) => void;
  /** Batch-update edges' data (for traffic system). */
  updateEdgesBatch: (updates: Array<{ edgeId: string; data: Record<string, any> }>) => void;
  /** Set selection. */
  setSelection: (nodeId: string | null, nodeIds?: Set<string>) => void;
  /** Connect cable mode — set the source node id for click-to-connect. */
  setConnectSource: (sourceId: string | null) => void;
  /** Reset to initial state. */
  resetGraph: () => void;
}

export type GraphStore = GraphState & GraphActions;

export const useGraphStore = create<GraphStore>((set, get) => ({
  nodes: INITIAL_NODES as Node[],
  edges: INITIAL_EDGES as Edge[],
  selectedNodeId: null,
  selectedNodeIds: new Set<string>(),
  connectSourceId: null,

  setNodes: (nodes) => set({ nodes }),

  onNodesChange: (changes) => {
    set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) }));
  },

  onEdgesChange: (changes) => {
    set((state) => ({ edges: applyEdgeChanges(changes, state.edges) }));
  },

  onConnect: (connection) => {
    set((state) => ({ edges: addEdge(connection, state.edges) }));
  },

  updateNodeDataBatch: (patches) => {
    set((state) => {
      const patchMap = new Map(patches.map((p) => [p.nodeId, p.data]));
      const newNodes = state.nodes.map((node) => {
        const patch = patchMap.get(node.id);
        if (!patch) return node;
        return {
          ...node,
          data: { ...node.data, ...patch },
        };
      });
      return { nodes: newNodes };
    });
  },

  updateNodeData: (nodeId, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      ),
    }));
  },

  addNode: (node) => {
    set((state) => ({ nodes: [...state.nodes, node] }));
  },

  deleteNode: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
    }));
  },

  deleteSelectedNodes: () => {
    const { selectedNodeIds } = get();
    set((state) => ({
      nodes: state.nodes.filter((n) => !selectedNodeIds.has(n.id)),
      edges: state.edges.filter(
        (e) => !selectedNodeIds.has(e.source) && !selectedNodeIds.has(e.target)
      ),
      selectedNodeId: null,
      selectedNodeIds: new Set(),
    }));
  },

  updateEdgeData: (edgeId, data) => {
    set((state) => ({
      edges: state.edges.map((edge) =>
        edge.id === edgeId
          ? { ...edge, data: { ...(edge.data || {}), ...data } }
          : edge
      ),
    }));
  },

  updateEdgesBatch: (updates) => {
    set((state) => {
      const updateMap = new Map(updates.map((u) => [u.edgeId, u.data]));
      return {
        edges: state.edges.map((edge) => {
          const upd = updateMap.get(edge.id);
          if (!upd) return edge;
          return { ...edge, data: { ...(edge.data || {}), ...upd } };
        }),
      };
    });
  },

  setSelection: (nodeId, nodeIds) => {
    set({
      selectedNodeId: nodeId,
      selectedNodeIds: nodeIds ?? (nodeId ? new Set([nodeId]) : new Set()),
    });
  },

  setConnectSource: (sourceId) => set({ connectSourceId: sourceId }),

  resetGraph: () =>
    set({
      nodes: INITIAL_NODES as Node[],
      edges: INITIAL_EDGES as Edge[],
      selectedNodeId: null,
      selectedNodeIds: new Set(),
      connectSourceId: null,
    }),
}));
