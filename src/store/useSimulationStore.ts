import { create } from 'zustand';
import type { AttackScenario } from '../types/soc';
import { PRESET_SCENARIOS } from '../data/mockData';

export interface AttackSlice {
  activeAttacks: Array<{
    id: string;
    targetNodeId: string;
    attackType: string;
    startedAt: string;
  }>;
}

export interface SimulationState {
  isSimulating: boolean;
  simSpeed: number;
  currentStepIndex: number;
  currentScenarioId: string;
  customScenarios: AttackScenario[];
  attack: AttackSlice;
}

export interface SimulationActions {
  toggle: () => void;
  setSimulating: (simulating: boolean) => void;
  setSpeed: (speed: number) => void;
  advanceStep: () => number; // returns new step index
  resetStep: () => void;
  selectScenario: (id: string) => void;
  registerScenario: (scenario: AttackScenario) => void;
  reset: () => void;
  triggerAttack: (targetNodeId: string, attackType: string) => void;
  clearAttack: (attackId: string) => void;
}

export type SimulationStore = SimulationState & SimulationActions;

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  isSimulating: false,
  simSpeed: 1,
  currentStepIndex: 0,
  currentScenarioId: 'scenario-1-ransomware',
  customScenarios: [],
  attack: {
    activeAttacks: [],
  },

  toggle: () => set((state) => ({ isSimulating: !state.isSimulating })),

  setSimulating: (simulating) => set({ isSimulating: simulating }),

  setSpeed: (speed) => set({ simSpeed: speed }),

  advanceStep: () => {
    const next = get().currentStepIndex + 1;
    set({ currentStepIndex: next });
    return next;
  },

  resetStep: () => set({ currentStepIndex: 0 }),

  selectScenario: (id) => set({ currentScenarioId: id, currentStepIndex: 0, isSimulating: false }),

  registerScenario: (scenario) => {
    set((state) => ({
      customScenarios: [...state.customScenarios, scenario],
    }));
  },

  reset: () =>
    set({
      isSimulating: false,
      simSpeed: 1,
      currentStepIndex: 0,
      currentScenarioId: 'scenario-1-ransomware',
      customScenarios: [],
      attack: { activeAttacks: [] },
    }),

  triggerAttack: (targetNodeId, attackType) => {
    set((state) => ({
      attack: {
        activeAttacks: [
          ...state.attack.activeAttacks,
          {
            id: `attack_${Date.now()}`,
            targetNodeId,
            attackType,
            startedAt: new Date().toISOString(),
          },
        ],
      },
    }));
  },

  clearAttack: (attackId) => {
    set((state) => ({
      attack: {
        activeAttacks: state.attack.activeAttacks.filter((a) => a.id !== attackId),
      },
    }));
  },
}));

/** Helper: get current scenario (preset or custom). */
export function getCurrentScenario(state: SimulationState): AttackScenario | undefined {
  const allScenarios = [...PRESET_SCENARIOS, ...state.customScenarios];
  return allScenarios.find((s) => s.id === state.currentScenarioId);
}
