/**
 * Lightweight typed publish/subscribe (Event Bus).
 * No external dependencies.
 */

type Handler<T = any> = (payload: T) => void;

export interface BusEvent {
  ATTACK_TRIGGERED: { nodeId: string; attackType: string };
  NODE_COMPROMISED: { nodeId: string };
  ALERT_RAISED: { nodeId: string; severity: string; title: string };
  NODE_ISOLATED: { nodeId: string; isolated: boolean };
  NODE_RECOVERED: { nodeId: string };
  SIMULATION_TICK: { tick: number; simTime: string };
  SCENARIO_STARTED: { scenarioId: string };
  SCENARIO_COMPLETED: { scenarioId: string };
  PROCESS_KILLED: { nodeId: string; pid: number; name: string };
}

export type BusEventMap = {
  [K in keyof BusEvent]: Handler<BusEvent[K]>;
};

export interface EventBus {
  on<K extends keyof BusEvent>(event: K, handler: BusEventMap[K]): () => void;
  off<K extends keyof BusEvent>(event: K, handler: BusEventMap[K]): void;
  emit<K extends keyof BusEvent>(event: K, payload: BusEvent[K]): void;
  clear(): void;
}

/**
 * Create a lightweight event bus instance.
 * Returns: { on, off, emit, clear }
 *
 * `on` returns an unsubscribe function for convenience.
 */
export function createEventBus(): EventBus {
  const listeners = new Map<string, Set<Function>>();

  const bus: EventBus = {
    on(event, handler) {
      if (!listeners.has(event)) {
        listeners.set(event, new Set());
      }
      listeners.get(event)!.add(handler);
      return () => bus.off(event, handler);
    },

    off(event, handler) {
      listeners.get(event)?.delete(handler);
    },

    emit(event, payload) {
      listeners.get(event)?.forEach((handler) => {
        try {
          handler(payload);
        } catch (err) {
          console.warn(`[EventBus] Error in handler for "${event}":`, err);
        }
      });
    },

    clear() {
      listeners.clear();
    },
  };

  return bus;
}

/** Singleton application-wide event bus. */
export const eventBus = createEventBus();
