import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldAlert, X, BellOff } from 'lucide-react';
import { playSiren, stopSiren, isMuted } from '../utils/audio';
import type { ToastAlert } from '../types/soc';

interface ToastNotificationStackProps {
  alerts: ToastAlert[];
  onDismiss: (id: string) => void;
  onClearAll?: () => void;
}

export const ToastNotificationStack: React.FC<ToastNotificationStackProps> = ({
  alerts,
  onDismiss,
  onClearAll,
}) => {
  const hasCritical = alerts.some((a) => a.severity === 'critical');

  // Trigger/stop audio siren based on critical alerts
  React.useEffect(() => {
    if (hasCritical && !isMuted()) {
      playSiren();
    } else if (!hasCritical) {
      stopSiren();
    }
  }, [hasCritical]);

  // Filter to show CRITICAL and HIGH alerts as requested in specs
  // Limit to max 3 visible toasts to reduce screen clutter
  const visibleAlerts = alerts
    .filter((a) => a.severity === 'critical' || a.severity === 'high')
    .slice(0, 3);

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      <div className="flex justify-end pointer-events-auto mb-1">
        {onClearAll && visibleAlerts.length > 1 && (
          <button
            onClick={onClearAll}
            className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-gray-300 border border-slate-700 backdrop-blur-xs transition flex items-center gap-1"
          >
            <BellOff className="w-3 h-3 text-gray-400" />
            Clear All Alerts ({visibleAlerts.length})
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {visibleAlerts.map((alert) => {
          const isCritical = alert.severity === 'critical';
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: 80, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`pointer-events-auto p-3.5 rounded-xl border shadow-xl backdrop-blur-md flex flex-col gap-1.5 transition-all ${
                isCritical
                  ? 'bg-red-950/90 border-red-500/80 text-red-100 shadow-red-950/50'
                  : 'bg-amber-950/90 border-amber-500/80 text-amber-100 shadow-amber-950/50'
              }`}
            >
              {/* Header row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {isCritical ? (
                    <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                  )}
                  <span
                    className={`text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded border whitespace-nowrap ${
                      isCritical
                        ? 'bg-red-600/30 text-red-300 border-red-400/50 animate-pulse'
                        : 'bg-amber-600/30 text-amber-300 border-amber-400/50'
                    }`}
                  >
                    {alert.severity.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[10px] font-mono text-gray-300/80 hidden sm:inline">
                    {alert.timestamp}
                  </span>
                  {/* Mute siren button — only on critical alerts */}
                  {isCritical && (
                    <button
                      onClick={() => stopSiren()}
                      className="p-1 rounded-md hover:bg-red-600/30 text-red-300 hover:text-red-200 transition"
                      title="Tắt âm báo"
                    >
                      <BellOff className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onDismiss(alert.id)}
                    className="p-1 rounded-md hover:bg-black/30 text-gray-300 hover:text-white transition"
                    title="Dismiss notification"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Title & Message */}
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide">
                  {alert.title}
                </h4>
                <p className="text-[11px] text-gray-200 mt-0.5 leading-snug">
                  {alert.message}
                </p>
              </div>

              {/* Host details if available */}
              {(alert.hostName || alert.hostIp) && (
                <div className="flex items-center gap-2 pt-1 border-t border-white/10 text-[10px] font-mono text-gray-300">
                  {alert.hostName && (
                    <span>
                      HOST:{' '}
                      <strong className="text-white">{alert.hostName}</strong>
                    </span>
                  )}
                  {alert.hostIp && (
                    <span>
                      IP:{' '}
                      <strong className="text-cyan-300">{alert.hostIp}</strong>
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
