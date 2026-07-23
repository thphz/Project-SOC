import { useGraphStore } from '../store/useGraphStore';
import { useSimulationStore } from '../store/useSimulationStore';
import { useTelemetryStore } from '../store/useTelemetryStore';
import { useUIStore } from '../store/useUIStore';
import { eventBus } from '../engine/eventBus';

/**
 * Scenario management services.
 */

/**
 * Select and load a scenario.
 */
export function selectScenario(scenarioId: string): void {
  useSimulationStore.getState().selectScenario(scenarioId);
  // Reset graph and telemetry WITHOUT resetting simulation state
  useGraphStore.getState().resetGraph();
  useTelemetryStore.getState().resetTelemetry();
  eventBus.emit('SCENARIO_STARTED', { scenarioId });
}

/**
 * Reset simulation to initial state.
 */
export function resetSimulation(): void {
  useSimulationStore.getState().reset();
  useGraphStore.getState().resetGraph();
  useTelemetryStore.getState().resetTelemetry();
}

/**
 * Register a custom scenario (from MitreMatrix builder).
 */
export function registerCustomScenario(scenario: {
  id: string;
  name: string;
  category: string;
  description: string;
  steps: any[];
}): void {
  useSimulationStore.getState().registerScenario(scenario);
}

/**
 * Execute a custom scenario from the MitreMatrix builder.
 * Registers it, selects it, resets, and auto-starts simulation.
 */
export function executeCustomScenario(scenario: {
  id: string;
  name: string;
  category: string;
  description: string;
  steps: any[];
}): void {
  registerCustomScenario(scenario);
  useSimulationStore.getState().selectScenario(scenario.id);
  resetSimulation();
  // Auto-start after a brief delay to let the graph re-render
  setTimeout(() => {
    useSimulationStore.getState().setSimulating(true);
    useUIStore.getState().setScreenMode('canvas');
  }, 100);
}
