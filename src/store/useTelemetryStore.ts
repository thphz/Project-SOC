import { create } from 'zustand';
import type { EventLogItem, MitrePhase, ToastAlert } from '../types/soc';
import { INITIAL_LOGS, MITRE_STAGES } from '../data/mockData';

/**
 * TrafficHistorySample: one point on the traffic chart.
 */
export interface TrafficSample {
  time: string;
  mbps: number;
  alerts: number;
}

export interface TelemetryState {
  logs: EventLogItem[];
  mitrePhases: MitrePhase[];
  trafficHistory: TrafficSample[];
  toastAlerts: ToastAlert[];
  simTime: string;
}

export interface TelemetryActions {
  // Logs slice
  addLog: (log: EventLogItem) => void;
  addLogs: (logs: EventLogItem[]) => void;
  clearLogs: () => void;

  // MITRE slice
  advanceMitre: (phaseId: string, status: 'active' | 'completed' | 'failed') => void;

  // Traffic slice
  pushTraffic: (sample: TrafficSample) => void;
  clearTraffic: () => void;

  // Toast/Alerts slice
  addToast: (toast: ToastAlert) => void;
  addToasts: (toasts: ToastAlert[]) => void;
  dismissToast: (id: string) => void;
  clearToasts: () => void;

  // Time slice
  tickTime: () => void;

  // Full reset
  resetTelemetry: () => void;
}

export type TelemetryStore = TelemetryState & TelemetryActions;

const INITIAL_TRAFFIC: TrafficSample[] = [
  { time: '09:30', mbps: 120, alerts: 0 },
  { time: '09:31', mbps: 145, alerts: 0 },
  { time: '09:32', mbps: 190, alerts: 1 },
  { time: '09:33', mbps: 340, alerts: 2 },
  { time: '09:34', mbps: 580, alerts: 4 },
  { time: '09:35', mbps: 820, alerts: 7 },
];

export const useTelemetryStore = create<TelemetryStore>((set, get) => ({
  logs: INITIAL_LOGS as EventLogItem[],
  mitrePhases: MITRE_STAGES as MitrePhase[],
  trafficHistory: INITIAL_TRAFFIC,
  toastAlerts: [],
  simTime: '09:35:00',

  // ── Logs slice ──
  addLog: (log) => set((state) => ({ logs: [log, ...state.logs] })),

  addLogs: (logs) =>
    set((state) => ({ logs: [...logs, ...state.logs] })),

  clearLogs: () => set({ logs: [] }),

  // ── MITRE slice ──
  advanceMitre: (phaseId, status) =>
    set((state) => ({
      mitrePhases: state.mitrePhases.map((p) =>
        p.id === phaseId ? { ...p, status } : p
      ),
    })),

  // ── Traffic slice ──
  pushTraffic: (sample) =>
    set((state) => ({
      trafficHistory: [...state.trafficHistory.slice(-20), sample],
    })),

  clearTraffic: () => set({ trafficHistory: [] }),

  // ── Toast/Alerts slice ──
  addToast: (toast) => {
    set((state) => ({ toastAlerts: [...state.toastAlerts, toast] }));
    // Auto-dismiss after 3 seconds to reduce spam
    setTimeout(() => {
      get().dismissToast(toast.id);
    }, 3000);
  },

  addToasts: (toasts) => {
    set((state) => ({ toastAlerts: [...state.toastAlerts, ...toasts] }));
    // Auto-dismiss each toast after 3 seconds
    for (const t of toasts) {
      setTimeout(() => {
        get().dismissToast(t.id);
      }, 3000);
    }
  },

  dismissToast: (id) =>
    set((state) => ({
      toastAlerts: state.toastAlerts.filter((t) => t.id !== id),
    })),

  clearToasts: () => set({ toastAlerts: [] }),

  // ── Time slice ──
  tickTime: () => {
    const current = get().simTime;
    const [h, m] = current.split(':').map(Number);
    const total = h * 60 + m + 1;
    const newH = Math.floor(total / 60) % 24;
    const newM = total % 60;
    set({ simTime: `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}:00` });
  },

  // ── Full reset ──
  resetTelemetry: () =>
    set({
      logs: INITIAL_LOGS as EventLogItem[],
      mitrePhases: MITRE_STAGES as MitrePhase[],
      trafficHistory: INITIAL_TRAFFIC,
      toastAlerts: [],
      simTime: '09:35:00',
    }),
}));

/** ── Selectors ── */

/** Return logs filtered by level. */
export const selectLogsByLevel = (level: string) => (state: TelemetryStore) =>
  level === 'ALL' ? state.logs : state.logs.filter((l) => l.level === level);

/** Count alerts by severity. */
export const selectAlertCount = (state: TelemetryStore) => state.toastAlerts.length;

/** Get the latest N traffic samples. */
export const selectRecentTraffic =
  (n: number) =>
  (state: TelemetryStore): TrafficSample[] =>
    state.trafficHistory.slice(-n);
