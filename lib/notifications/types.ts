export type EmailProviderType = 'preview' | 'resend' | 'sendgrid' | 'smtp';

export interface EmailNotificationConfig {
  id?: string;
  recipientEmail: string;
  enabled: boolean;
  frequency: '1h';
  provider: EmailProviderType;
  // Resend or SendGrid API Key
  apiKey?: string;
  // SMTP settings (Gmail, custom relay, etc.)
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpFrom?: string;
  lastSentAt?: string;
  lastStatus?: string;
  updatedAt?: string;
}

export interface EmailDispatchLog {
  id: string;
  timestamp: string;
  recipient: string;
  subject: string;
  provider: EmailProviderType;
  status: 'SUCCESS' | 'ERROR' | 'PREVIEW_ONLY';
  btcScore: number;
  spyScore: number;
  error?: string;
  htmlContent?: string;
}

export interface MarketDigestData {
  generatedAt: string;
  btc: {
    price: number;
    change24h: number;
    score: number;
    signalLabel: string;
    signalColor: string;
    rsi14: number;
    sma200: number;
    dist200Pct: number;
    drawdownZScore: number;
    sentimentVal: number;
    sentimentLabel: string;
    dayOfWeek: string;
    isFavorableWindow: boolean;
    regime: string;
    winProb14d: number;
    expectedReturn14d: number;
    activeTriggersCount: number;
    verdict: string;
    action: string;
    stopLossPrice: number;
    stopLossPct: number;
  };
  spy: {
    price: number;
    change24h: number;
    score: number;
    signalLabel: string;
    signalColor: string;
    rsi14: number;
    sma200: number;
    dist200Pct: number;
    drawdownZScore: number;
    sentimentVal: number;
    sentimentLabel: string;
    dayOfWeek: string;
    isFavorableWindow: boolean;
    regime: string;
    winProb14d: number;
    expectedReturn14d: number;
    activeTriggersCount: number;
    verdict: string;
    action: string;
    stopLossPrice: number;
    stopLossPct: number;
  };
}
