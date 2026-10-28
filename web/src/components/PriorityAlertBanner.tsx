import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { getPriorityAlerts, type PriorityAlert } from '../lib/alerts';
import { playAlarm } from '../lib/alarmSound';

const CHECK_INTERVAL_MS = 15_000;

export default function PriorityAlertBanner() {
  const [alerts, setAlerts] = useState<PriorityAlert[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const seenIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    function check() {
      const current = getPriorityAlerts();
      const newOnes = current.filter((a) => !seenIds.current.has(a.id));
      if (newOnes.length > 0) {
        playAlarm(5000);
      }
      seenIds.current = new Set(current.map((a) => a.id));
      setAlerts(current);
    }
    check();
    const id = setInterval(check, CHECK_INTERVAL_MS);
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
