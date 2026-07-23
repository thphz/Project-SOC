import { telemetryTick } from './systems/telemetrySystem';
import { trafficTick } from './systems/trafficSystem';
import { processTick } from './systems/processSystem';
import { serviceTick } from './systems/serviceSystem';
import { userTick } from './systems/userSystem';
import { logTick } from './systems/logSystem';
import { alertTick } from './systems/alertSystem';
import { Scheduler, type ChannelDef } from './scheduler';

import type { DeviceNodeData } from '../types/soc';
import type { SystemContext } from '../types/engine';

/**
 * Re-export eventBus from the engine module for convenience.
 */
export { eventBus } from './eventBus';
export { Scheduler } from './scheduler';
export type { ChannelDef } from './scheduler';

/**
 * SimulationEngine orchestrates all systems and connects to Zustand stores.
 * It is NOT a React component — it's a plain TypeScript class.
 */
export class SimulationEngine {
  private scheduler: Scheduler;
  private tickCounter: number = 0;
  private simTime: string = '09:35:00';
  private simSpeed: number = 1;
  private isRunning: boolean = false;

  // Store references (set externally after store creation)
  private getNodes: () => { id: string; data: DeviceNodeData }[] = () => [];
  private getEdges: () => { id: string; source: string; target: string; data?: Record<string, any> }[] = () => [];
  private updateNodes: (patches: Array<{ nodeId: string; data: Partial<DeviceNodeData> }>) => void = () => {};
  private updateEdges: (updates: Array<{ edgeId: string; data: Record<string, any> }>) => void = () => {};
  private appendLogs: (logs: any[]) => void = () => {};
  private appendToasts: (toasts: any[]) => void = () => {};

  constructor() {
    this.scheduler = new Scheduler();
  }

  /**
   * Connect store actions to the engine.
   * Called once after stores are created.
   */
  connectStores(stores: {
    getNodes: () => { id: string; data: DeviceNodeData }[];
    getEdges: () => { id: string; source: string; target: string; data?: Record<string, any> }[];
    updateNodes: (patches: Array<{ nodeId: string; data: Partial<DeviceNodeData> }>) => void;
    updateEdges: (updates: Array<{ edgeId: string; data: Record<string, any> }>) => void;
    appendLogs: (logs: any[]) => void;
    appendToasts: (toasts: any[]) => void;
  }): void {
    this.getNodes = stores.getNodes;
    this.getEdges = stores.getEdges;
    this.updateNodes = stores.updateNodes;
    this.updateEdges = stores.updateEdges;
    this.appendLogs = stores.appendLogs;
    this.appendToasts = stores.appendToasts;
  }

  /**
   * Register all default channels with the scheduler.
   */
  private registerChannels(): void {
    const channels: ChannelDef[] = [
      {
        name: 'telemetry',
        intervalMs: 2000,
        callback: () => this.runSystem('telemetry'),
      },
      {
        name: 'traffic',
        intervalMs: 1000,
        callback: () => this.runSystem('traffic'),
      },
      {
        name: 'process',
        intervalMs: 3000,
        callback: () => this.runSystem('process'),
      },
      {
        name: 'service',
        intervalMs: 5000,
        callback: () => this.runSystem('service'),
      },
      {
        name: 'user',
        intervalMs: 4000,
        callback: () => this.runSystem('user'),
      },
      {
        name: 'log',
        intervalMs: 3000,
        callback: () => this.runSystem('log'),
      },
      {
        name: 'alert',
        intervalMs: 2000,
        callback: () => this.runSystem('alert'),
      },
    ];

    for (const ch of channels) {
      this.scheduler.register(ch);
    }
  }

  /**
   * Start the engine.
   */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.registerChannels();
    this.scheduler.start();
  }

  /**
   * Stop the engine.
   */
  stop(): void {
    this.isRunning = false;
    this.scheduler.stop();
  }

  /**
   * Set speed multiplier.
   */
  setSpeed(speed: number): void {
    this.simSpeed = speed;
    this.scheduler.setSpeed(speed);
  }

  get isEngineRunning(): boolean {
    return this.isRunning;
  }

  get currentSimTime(): string {
    return this.simTime;
  }

  /**
   * Advance simTime by one tick (minute).
   */
  private advanceTime(): void {
    const [h, m] = this.simTime.split(':').map(Number);
    const totalMinutes = h * 60 + m + 1;
    const newH = Math.floor(totalMinutes / 60) % 24;
    const newM = totalMinutes % 60;
    this.simTime = `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}:00`;
  }

  /**
   * Run a specific system by name.
   */
  private runSystem(systemName: string): void {
    const nodes = this.getNodes();
    const edges = this.getEdges();

    this.tickCounter++;

    const ctx: SystemContext = {
      tick: this.tickCounter,
      simTime: this.simTime,
      simSpeed: this.simSpeed,
    };

    switch (systemName) {
      case 'telemetry': {
        const patches = telemetryTick(nodes, edges, ctx);
        if (patches.length > 0) this.updateNodes(patches);
        this.advanceTime();
        break;
      }
      case 'traffic': {
        const { edgeUpdates, nodePatches } = trafficTick(nodes, edges, ctx);
        if (edgeUpdates.length > 0) this.updateEdges(edgeUpdates);
        if (nodePatches.length > 0) this.updateNodes(nodePatches);
        break;
      }
      case 'process': {
        const patches = processTick(nodes, edges, ctx);
        if (patches.length > 0) this.updateNodes(patches);
        break;
      }
      case 'service': {
        const patches = serviceTick(nodes, edges, ctx);
        if (patches.length > 0) this.updateNodes(patches);
        break;
      }
      case 'user': {
        const patches = userTick(nodes, edges, ctx);
        if (patches.length > 0) this.updateNodes(patches);
        break;
      }
      case 'log': {
        const logs = logTick(nodes, edges, ctx);
        if (logs.length > 0) this.appendLogs(logs);
        break;
      }
      case 'alert': {
        const { nodePatches, newToasts } = alertTick(nodes, edges, ctx);
        if (nodePatches.length > 0) this.updateNodes(nodePatches);
        if (newToasts.length > 0) this.appendToasts(newToasts);
        break;
      }
    }
  }

  /**
   * Cleanup.
   */
  destroy(): void {
    this.stop();
  }
}

/** Singleton simulation engine instance. */
export const simulationEngine = new SimulationEngine();
