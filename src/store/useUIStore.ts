import { create } from 'zustand';
import type { ViewOverlayMode, ScreenMode } from '../types/soc';

export interface UIState {
  viewMode: ViewOverlayMode;
  darkMode: boolean;
  screenMode: ScreenMode;
  muted: boolean;
  isConnecting: boolean;
  isAttackerToolboxOpen: boolean;
  isLeftSidebarOpen: boolean;
  isDrawerOpen: boolean;
  drawerHeight: number;
}

export interface UIActions {
  setViewMode: (mode: ViewOverlayMode) => void;
  toggleDarkMode: () => void;
  setScreenMode: (mode: ScreenMode) => void;
  setMuted: (muted: boolean) => void;
  toggleMute: () => void;
  setConnecting: (connecting: boolean) => void;
  toggleConnecting: () => void;
  setAttackerToolboxOpen: (open: boolean) => void;
  toggleAttackerToolbox: () => void;
  setLeftSidebarOpen: (open: boolean) => void;
  setDrawerOpen: (open: boolean) => void;
  setDrawerHeight: (height: number) => void;
  resetUI: () => void;
}

export type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>((set) => ({
  viewMode: 'logical',
  darkMode: true,
  screenMode: 'canvas',
  muted: false,
  isConnecting: false,
  isAttackerToolboxOpen: false,
  isLeftSidebarOpen: true,
  isDrawerOpen: true,
  drawerHeight: 200,

  setViewMode: (mode) => set({ viewMode: mode }),

  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

  setScreenMode: (mode) => set({ screenMode: mode }),

  setMuted: (muted) => set({ muted }),

  toggleMute: () => set((state) => ({ muted: !state.muted })),

  setConnecting: (connecting) => set({ isConnecting: connecting }),

  toggleConnecting: () => set((state) => ({ isConnecting: !state.isConnecting })),

  setAttackerToolboxOpen: (open) => set({ isAttackerToolboxOpen: open }),

  toggleAttackerToolbox: () =>
    set((state) => ({ isAttackerToolboxOpen: !state.isAttackerToolboxOpen })),

  setLeftSidebarOpen: (open) => set({ isLeftSidebarOpen: open }),

  setDrawerOpen: (open) => set({ isDrawerOpen: open }),

  setDrawerHeight: (height) => set({ drawerHeight: height }),

  resetUI: () =>
    set({
      viewMode: 'logical',
      screenMode: 'canvas',
      isConnecting: false,
      isAttackerToolboxOpen: false,
      isLeftSidebarOpen: true,
      isDrawerOpen: true,
      drawerHeight: 200,
    }),
}));
