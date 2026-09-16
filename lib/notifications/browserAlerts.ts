  export function checkNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return await Notification.requestPermission();
}

export interface CockpitDecisionSnapshot {
  btc?: {
    currentPrice: number;
    priceChange24h: number;
    compositeScore: number;
    signalLabel: string;
    indicators: {
      rsi14: number;
      distToSma200Pct: number;
      drawdownZScore: number;
    };
    ml: {
      regime: string;
      dipSuccessProb14d: number;
    };
  };
  spy?: {
    currentPrice: number;
    priceChange24h: number;
    compositeScore: number;
    signalLabel: string;
    indicators: {
      rsi14: number;
      distToSma200Pct: number;
      drawdownZScore: number;
    };
    ml: {
      regime: string;
      dipSuccessProb14d: number;
    };
  };
}

export function generateDecisionCopy(data: CockpitDecisionSnapshot) {
  const btcScore = data.btc?.compositeScore ?? 50;
  const spyScore = data.spy?.compositeScore ?? 50;
  const btcPrice = data.btc?.currentPrice ? `$${data.btc.currentPrice.toLocaleString()}` : '$0';
  const spyPrice = data.spy?.currentPrice ? `$${data.spy.currentPrice.toFixed(2)}` : '$0';

  // 1. If high conviction dip buy on either asset (Score >= 70)
  if (btcScore >= 70 || spyScore >= 70) {
    const isBtc = btcScore >= spyScore;
    const asset = isBtc ? 'Bitcoin' : 'S&P 500';
    const score = isBtc ? btcScore : spyScore;
    const price = isBtc ? btcPrice : spyPrice;
    return {
      title: `🎯 STRONG DIP BUY: ${asset} (${score}/100)`,
      body: `Price: ${price}. Multiple capitulation triggers fired! Favorable asymmetric entry for scaling in tranches. Tap to view stop-loss.`,
    };
  }

  // 2. If moderate value dip on either asset (Score >= 50)
  if (btcScore >= 50 || spyScore >= 50) {
    const isBtc = btcScore >= spyScore;
    const asset = isBtc ? 'Bitcoin' : 'S&P 500';
    const score = isBtc ? btcScore : spyScore;
    const price = isBtc ? btcPrice : spyPrice;
    return {
      title: `⚖️ VALUE DIP: ${asset} Retracement (${score}/100)`,
      body: `Price: ${price}. Pullback towards 200-SMA support. Recommended action: Place staggered limit orders.`,
    };
  }

  // 3. If market is extended (Score < 30)
  if (btcScore < 30 || spyScore < 30) {
    return {
      title: `⚠️ CAUTION: Market Extended (BTC ${btcScore} / SPY ${spyScore})`,
      body: `BTC: ${btcPrice} • SPY: ${spyPrice}. Price stretched above 200-SMA. Advice: Do NOT chase; wait for pullback.`,
    };
  }

  // 4. Neutral Regular DCA
  return {
    title: `📊 30-Min Market Timing Update`,
    body: `BTC: ${btcPrice} (${btcScore}/100) • SPY: ${spyPrice} (${spyScore}/100). Status: Neutral. Maintain standard automated DCA.`,
  };
}

export async function sendBrowserDecisionNotification(
  data: CockpitDecisionSnapshot
): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') return false;
  }

  const { title, body } = generateDecisionCopy(data);

  const options: NotificationOptions & { renotify?: boolean } = {
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'peak-decision-update',
    renotify: true,
  };

  try {
    // Try service worker notification first (for background handling & PWA)
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, options);
        return true;
      }
    }

    // Fallback to standard web notification
    new Notification(title, options);
    return true;
  } catch (err) {
    console.error('Failed to trigger browser notification:', err);
    try {
      new Notification(title, options);
      return true;
    } catch {
      return false;
    }
  }
}

export interface TradeCompletionAlertData {
  asset: 'BTC' | 'SPY';
  result: 'WIN' | 'LOSS';
  step: number;
  pnlDollar: number;
  pnlPct: number;
  newBalance: number;
  entryPrice?: number;
  exitPrice?: number;
}

/**
 * Web Audio synthesized audio chime for instant acoustic feedback on trade resolution
 */
export function playTradeCompletionAudio(isWin: boolean) {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (isWin) {
      // Triumphant ascending triad (C5 -> E5 -> G5)
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.18, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.36);
      });
    } else {
      // Gentle capital preservation chord
      const now = ctx.currentTime;
      [440, 349.23].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);
        gain.gain.setValueAtTime(0.15, now + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.15 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 0.42);
      });
    }
  } catch {
    // AudioContext blocked or not supported in this browser state
  }
}

/**
 * Dispatches a rich browser notification displaying exact earns/losses on trade completion
 */
export async function sendTradeCompletionNotification(
  data: TradeCompletionAlertData
): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // Trigger auditory feedback
  playTradeCompletionAudio(data.result === 'WIN');

  if (!('Notification' in window)) return false;

  if (Notification.permission !== 'granted') {
    return false;
  }

  const isWin = data.result === 'WIN';
  const assetName = data.asset === 'BTC' ? 'Bitcoin (BTC)' : 'S&P 500 (SPY)';
  const absDollar = Math.abs(data.pnlDollar).toFixed(2);
  const absPct = Math.abs(data.pnlPct).toFixed(2);

  const title = isWin
    ? `🎉 TRADE WON: +$${absDollar} (+${absPct}%) on ${assetName}`
    : `🛡️ STOP LOSS: -$${absDollar} (-${absPct}%) on ${assetName}`;

  const body = isWin
    ? `🎯 Step ${data.step} Complete! Compounded balance to $${data.newBalance.toFixed(2)}. 1.618R Golden Target hit.`
    : `⚠️ Step ${data.step} Stopped Out. Balance preserved at $${data.newBalance.toFixed(2)}. Hard stop protected capital.`;

  const options: NotificationOptions & { renotify?: boolean } = {
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: `peak-trade-${Date.now()}`,
    renotify: true,
  };

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, options);
        return true;
      }
    }
    new Notification(title, options);
    return true;
  } catch (err) {
    try {
      new Notification(title, options);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Dispatches an explicit system test alert that cannot be mistaken for real trade results
 */
export async function sendSystemTestNotification(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  playTradeCompletionAudio(true);

  if (!('Notification' in window) || Notification.permission !== 'granted') return false;

  const title = `🔔 [TEST] PEAK Alert Pipeline Active`;
  const body = `Audio chimes & push notification dispatch verified. Waiting for organic market execution.`;
  const options: NotificationOptions = {
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'peak-system-test',
  };

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, options);
        return true;
      }
    }
    new Notification(title, options);
    return true;
  } catch {
    return false;
  }
}

