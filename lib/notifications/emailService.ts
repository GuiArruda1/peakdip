import nodemailer from 'nodemailer';
import { ensureDataReady } from '../dataProvider';
import { MarketDigestData, EmailNotificationConfig, EmailDispatchLog } from './types';
import { renderMarketDigestHTML } from './template';
import { getEmailConfig, saveEmailConfig, recordDispatchLog } from './config';

export async function compileMarketDigest(): Promise<MarketDigestData> {
  const [btcData, spyData] = await Promise.all([
    ensureDataReady('BTCUSDT'),
    ensureDataReady('SPY'),
  ]);

  const btcConv = btcData.conviction;
  const spyConv = spyData.conviction;
  const btcBacktest = btcData.backtest;
  const spyBacktest = spyData.backtest;

  const btcPrice = btcConv?.currentPrice || 0;
  const spyPrice = spyConv?.currentPrice || 0;

  const btcStopDist = Math.abs((btcBacktest?.maxDrawdownAvg || -14.0) * 1.5);
  const spyStopDist = Math.abs((spyBacktest?.maxDrawdownAvg || -5.5) * 1.5);

  const btcStopPrice = btcPrice * (1 - btcStopDist / 100);
  const spyStopPrice = spyPrice * (1 - spyStopDist / 100);

  const btcScore = btcConv?.compositeScore || 50;
  const spyScore = spyConv?.compositeScore || 50;

  const determineVerdict = (score: number) => {
    if (score >= 70) return 'STRONG CAPITULATION DIP BUY';
    if (score >= 50) return 'VALUE RETRACEMENT (MODERATE DIP)';
    if (score < 30) return 'EXTENDED — WAIT FOR PULLBACK';
    return 'NEUTRAL — REGULAR DCA';
  };

  const determineAction = (score: number, symbol: string) => {
    if (score >= 70) return `Optimal asymmetrical window to scale in using 3 tranches (40% market, 35% limit, 25% reserve).`;
    if (score >= 50) return `Stagger limit orders towards key 200-SMA support. Do not deploy lump sum yet.`;
    if (score < 30) return `Price is stretched above moving averages. Avoid FOMO chasing; wait for healthy pullback to 50/200 SMA.`;
    return `Maintain automated DCA schedule. Keep dry powder ready for dip signals.`;
  };

  return {
    generatedAt: new Date().toISOString(),
    btc: {
      price: btcPrice,
      change24h: btcConv?.priceChange24h || 0,
      score: btcScore,
      signalLabel: btcConv?.signalLabel || 'NEUTRAL',
      signalColor: btcConv?.signalColor || '#94A3B8',
      rsi14: btcConv?.indicators.rsi14 || 50,
      sma200: btcConv?.indicators.sma200 || btcPrice,
      dist200Pct: btcConv?.indicators.distToSma200Pct || 0,
      drawdownZScore: btcConv?.indicators.drawdownZScore || 0,
      sentimentVal: btcConv?.indicators.fearGreedOrVix.value || 50,
      sentimentLabel: btcConv?.indicators.fearGreedOrVix.label || 'Neutral',
      dayOfWeek: btcConv?.indicators.calendarStatus.dayOfWeek || 'Today',
      isFavorableWindow: btcConv?.indicators.calendarStatus.isFavorableWindow || false,
      regime: btcConv?.ml.regime || 'VOLATILE_CHOP',
      winProb14d: Math.round((btcConv?.ml.dipSuccessProb14d || 0.5) * 100),
      expectedReturn14d: btcConv?.ml.expectedFwdReturn14d || 1.0,
      activeTriggersCount: btcConv?.triggers.filter((t) => t.active).length || 0,
      verdict: determineVerdict(btcScore),
      action: determineAction(btcScore, 'BTC'),
      stopLossPrice: btcStopPrice,
      stopLossPct: btcStopDist,
    },
    spy: {
      price: spyPrice,
      change24h: spyConv?.priceChange24h || 0,
      score: spyScore,
      signalLabel: spyConv?.signalLabel || 'NEUTRAL',
      signalColor: spyConv?.signalColor || '#94A3B8',
      rsi14: spyConv?.indicators.rsi14 || 50,
      sma200: spyConv?.indicators.sma200 || spyPrice,
      dist200Pct: spyConv?.indicators.distToSma200Pct || 0,
      drawdownZScore: spyConv?.indicators.drawdownZScore || 0,
      sentimentVal: spyConv?.indicators.fearGreedOrVix.value || 15,
      sentimentLabel: spyConv?.indicators.fearGreedOrVix.label || 'Normal',
      dayOfWeek: spyConv?.indicators.calendarStatus.dayOfWeek || 'Today',
      isFavorableWindow: spyConv?.indicators.calendarStatus.isFavorableWindow || false,
      regime: spyConv?.ml.regime || 'VOLATILE_CHOP',
      winProb14d: Math.round((spyConv?.ml.dipSuccessProb14d || 0.5) * 100),
      expectedReturn14d: spyConv?.ml.expectedFwdReturn14d || 1.0,
      activeTriggersCount: spyConv?.triggers.filter((t) => t.active).length || 0,
      verdict: determineVerdict(spyScore),
      action: determineAction(spyScore, 'SPY'),
      stopLossPrice: spyStopPrice,
      stopLossPct: spyStopDist,
    },
  };
}

export async function sendMarketDigestEmail(
  targetConfig?: Partial<EmailNotificationConfig>
): Promise<{ success: boolean; log: EmailDispatchLog; message: string }> {
  const currentConfig = await getEmailConfig();
  const config = { ...currentConfig, ...targetConfig };

  const recipient = config.recipientEmail?.trim();
  if (!recipient) {
    throw new Error('Recipient email is required to dispatch notifications.');
  }

  // Compile real market data
  const digestData = await compileMarketDigest();
  const htmlContent = renderMarketDigestHTML(digestData);

  const subject = `[PEAK Digest] BTC $${digestData.btc.price.toLocaleString()} (${digestData.btc.score}/100) | SPY $${digestData.spy.price.toFixed(2)} (${digestData.spy.score}/100)`;
  const logId = Date.now().toString();

  const provider = config.provider || 'preview';
  const effectiveApiKey = config.apiKey || process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY;

  let sendStatus: 'SUCCESS' | 'ERROR' | 'PREVIEW_ONLY' = 'SUCCESS';
  let errorMessage: string | undefined;

  try {
    // 1. Resend API Dispatch
    if (provider === 'resend' && effectiveApiKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${effectiveApiKey}`,
        },
        body: JSON.stringify({
          from: config.smtpFrom || 'PEAK Alerts <alerts@resend.dev>',
          to: [recipient],
          subject,
          html: htmlContent,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Resend error (${res.status}): ${errText}`);
      }
    }
    // 2. SendGrid API Dispatch
    else if (provider === 'sendgrid' && effectiveApiKey) {
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${effectiveApiKey}`,
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: recipient }] }],
          from: { email: config.smtpFrom || 'alerts@peaktiming.com', name: 'PEAK Alerts' },
          subject,
          content: [{ type: 'text/html', value: htmlContent }],
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`SendGrid error (${res.status}): ${errText}`);
      }
    }
    // 3. SMTP Transport (Gmail or Custom relay)
    else if (provider === 'smtp' && config.smtpHost) {
      const transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: config.smtpPort || 587,
        secure: config.smtpPort === 465,
        auth: {
          user: config.smtpUser,
          pass: config.smtpPass,
        },
      });

      await transporter.sendMail({
        from: config.smtpFrom || config.smtpUser || 'alerts@peaktiming.com',
        to: recipient,
        subject,
        html: htmlContent,
      });
    }
    // 4. Preview / Simulation Mode (Works with Zero Setup)
    else {
      sendStatus = 'PREVIEW_ONLY';
      console.log(`[PEAK Email Dispatch Preview] To: ${recipient} | Subject: ${subject}`);
    }
  } catch (err: any) {
    sendStatus = 'ERROR';
    errorMessage = err?.message || 'Failed to dispatch email';
    console.error('Email dispatch error:', errorMessage);
  }

  const log: EmailDispatchLog = {
    id: logId,
    timestamp: new Date().toISOString(),
    recipient,
    subject,
    provider,
    status: sendStatus,
    btcScore: digestData.btc.score,
    spyScore: digestData.spy.score,
    error: errorMessage,
    htmlContent,
  };

  // Record dispatch log and update lastSent timestamp
  await recordDispatchLog(log);
  await saveEmailConfig({
    lastSentAt: new Date().toISOString(),
    lastStatus: sendStatus,
  });

  return {
    success: sendStatus !== 'ERROR',
    log,
    message:
      sendStatus === 'SUCCESS'
        ? `Hourly digest successfully dispatched to ${recipient}`
        : sendStatus === 'PREVIEW_ONLY'
        ? `Digest compiled and saved to preview log for ${recipient}. To send to an external inbox, select Resend, SendGrid, or SMTP in settings.`
        : `Email delivery failed: ${errorMessage}`,
  };
}
