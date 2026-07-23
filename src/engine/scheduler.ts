/**
 * Central Scheduler: manages multiple tick channels with configurable intervals.
 * All channels are scaled by simSpeed.
 * Provides pause/resume/setSpeed and can optionally pause when tab is hidden.
 */

export interface ChannelDef {
  name: string;
  intervalMs: number;
  callback: () => void;
}

export class Scheduler {
  private channels: Map<string, { def: ChannelDef; timer: ReturnType<typeof setInterval> | null }> = new Map();
  private speed: number = 1;
  private _isRunning: boolean = false;
  private visibilityHandler: (() => void) | null = null;

  /**
   * Register a channel. Does NOT start it; call start().
   */
  register(def: ChannelDef): void {
    if (this.channels.has(def.name)) {
      console.warn(`[Scheduler] Channel "${def.name}" already registered, skipping.`);
      return;
    }
    this.channels.set(def.name, { def, timer: null });
  }

  /**
   * Unregister a channel. Stops it first if running.
   */
  unregister(name: string): void {
    const entry = this.channels.get(name);
    if (entry?.timer) {
      clearInterval(entry.timer);
    }
    this.channels.delete(name);
  }

  /**
   * Start all channels.
   */
  start(): void {
    if (this._isRunning) return;
    this._isRunning = true;

    for (const [, entry] of this.channels) {
      const interval = this.adjustedInterval(entry.def.intervalMs);
      entry.timer = setInterval(entry.def.callback, interval);
    }

    // Listen for page visibility changes — pause when tab is hidden
    if (typeof document !== 'undefined') {
      this.visibilityHandler = () => {
        if (document.hidden) {
          this.pauseAll();
        } else if (this._isRunning) {
          this.resumeAll();
        }
      };
      document.addEventListener('visibilitychange', this.visibilityHandler);
    }
  }

  /**
   * Stop all channels.
   */
  stop(): void {
    this._isRunning = false;
    for (const [, entry] of this.channels) {
      if (entry.timer) {
        clearInterval(entry.timer);
        entry.timer = null;
      }
    }
    if (this.visibilityHandler && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }
  }

  /**
   * Pause all channels without stopping them.
   */
  private pauseAll(): void {
    for (const [, entry] of this.channels) {
      if (entry.timer) {
        clearInterval(entry.timer);
        entry.timer = null;
      }
    }
  }

  /**
   * Resume all channels.
   */
  private resumeAll(): void {
    for (const [, entry] of this.channels) {
      const interval = this.adjustedInterval(entry.def.intervalMs);
      entry.timer = setInterval(entry.def.callback, interval);
    }
  }

  /**
   * Set speed multiplier. Recreates all intervals.
   */
  setSpeed(speed: number): void {
    this.speed = Math.max(0.1, speed);
    if (this._isRunning) {
      this.pauseAll();
      this.resumeAll();
    }
  }

  getSpeed(): number {
    return this.speed;
  }

  get isRunning(): boolean {
    return this._isRunning;
  }

  private adjustedInterval(baseMs: number): number {
    return Math.max(50, baseMs / this.speed);
  }

  /**
   * Cleanup all channels and stop.
   */
  destroy(): void {
    this.stop();
    this.channels.clear();
  }
}
