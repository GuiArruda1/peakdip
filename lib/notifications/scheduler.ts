import { getEmailConfig } from './config';
import { sendMarketDigestEmail } from './emailService';

declare global {
  var peakEmailSchedulerTimer: NodeJS.Timeout | undefined;
  var peakEmailSchedulerStarted: boolean | undefined;
}

const HOURLY_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

export function initHourlyScheduler() {
  if (global.peakEmailSchedulerStarted) {
    return;
  }

  global.peakEmailSchedulerStarted = true;
  console.log('[PEAK Scheduler] Initializing automated hourly email notification job...');

  // Set recurring interval
  global.peakEmailSchedulerTimer = setInterval(async () => {
    try {
      const config = await getEmailConfig();
      if (config.enabled && config.recipientEmail) {
        console.log(`[PEAK Scheduler] Running hourly dispatch for ${config.recipientEmail}...`);
        await sendMarketDigestEmail(config);
      }
    } catch (err: any) {
      console.error('[PEAK Scheduler] Hourly dispatch job error:', err?.message);
    }
  }, HOURLY_INTERVAL_MS);
}
