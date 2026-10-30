import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { getPriorityAlerts } from '../lib/alerts';
import { playAlarm } from '../lib/alarmSound';
import { useStore } from '../lib/store';

const CHECK_INTERVAL_MS = 15_000;

export default function PriorityAlertBanner() {
  const [, setTick] = useState(0);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const seenIds = useRef<Set<string>>(new Set());
  // Re-renders straight away when something is added, paid or taken.
  useStore();
  const alerts = getPriorityAlerts();

  // Alerts already showing count as seen, so adding a bill due today does not ring:
  // the person just made that change themselves.
  useEffect(() => {
    alerts.forEach((a) => seenIds.current.add(a.id));
  });

  useEffect(() => {
    const id = setInterval(() => {
      const current = getPriorityAlerts();
      if (current.some((a) => !seenIds.current.has(a.id))) playAlarm(5000);
      seenIds.current = new Set(current.map((a) => a.id));
      setTick((t) => t + 1);
    }, CHECK_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const visible = alerts.filter((a) => !dismissedIds.has(a.id));
  if (visible.length === 0) return null;

  return (
    <div className="mb-6 flex flex-col gap-2">
      {visible.map((alert) => (
        <div
          key={alert.id}
          className="flex items-start gap-3 bg-[#FBECEA] border border-[#E3A79C] rounded-xl px-4 py-3 animate-pulse-once"
        >
          <AlertTriangle size={18} className="text-[var(--ds-risk)] shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#7A2E22]">{alert.title}</p>
            <p className="text-xs text-[#7A2E22]/80 mt-0.5">{alert.detail}</p>
          </div>
          <button
            onClick={() => setDismissedIds((prev) => new Set(prev).add(alert.id))}
            className="text-[#7A2E22]/60 hover:text-[#7A2E22]"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
