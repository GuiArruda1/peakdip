'use client';

import { useEffect, useRef } from 'react';
import { sendBrowserDecisionNotification } from '@/lib/notifications/browserAlerts';

const THIRTY_MINUTES_MS = 30 * 60 * 1000;

export default function BrowserAlertEngine() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const runCheckAndNotify = async () => {
      try {
        const isEnabled = localStorage.getItem('peak_browser_alerts_enabled') === 'true';
        if (!isEnabled) return;

        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          const res = await fetch('/api/signals/cockpit');
          if (res.ok) {
            const data = await res.json();
            await sendBrowserDecisionNotification(data);
            localStorage.setItem('peak_browser_last_alert_at', new Date().toISOString());
          }
        }
      } catch (err) {
        console.warn('Browser alert background check failed:', err);
      }
    };

    // Initialize 30-minute interval
    timerRef.current = setInterval(runCheckAndNotify, THIRTY_MINUTES_MS);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return null;
}
