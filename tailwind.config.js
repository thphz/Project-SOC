/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        soc: {
          bg: '#0B1220',
          dark: '#070B14',
          panel: '#111827',
          panelLight: '#1F2937',
          border: '#374151',
          borderHighlight: '#4B5563',
          text: '#F3F4F6',
          muted: '#9CA3AF',
          primary: '#3B82F6',
          primaryGlow: 'rgba(59, 130, 246, 0.5)',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          dangerGlow: 'rgba(239, 68, 68, 0.6)',
          scanning: '#F97316',
          purple: '#8B5CF6',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'radarSweep 4s linear infinite',
        'dash-flow': 'dashFlow 1s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 1, boxShadow: '0 0 15px rgba(239, 68, 68, 0.8)' },
          '50%': { opacity: 0.5, boxShadow: '0 0 5px rgba(239, 68, 68, 0.2)' },
        },
        dashFlow: {
          from: { strokeDashoffset: '24' },
          to: { strokeDashoffset: '0' },
        }
      }
    },
  },
  plugins: [],
}
