import { query } from '../db';
import { EmailNotificationConfig, EmailDispatchLog } from './types';

// In-memory fallback
let memoryConfig: EmailNotificationConfig = {
  recipientEmail: '',
  enabled: false,
  frequency: '1h',
  provider: 'preview',
  lastStatus: 'INITIALIZED',
  updatedAt: new Date().toISOString(),
};

let memoryLogs: EmailDispatchLog[] = [];

// Initialize PostgreSQL table for notifications if available
let tablesInitialized = false;

async function ensureTables() {
  if (tablesInitialized) return;
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS email_notification_configs (
        id VARCHAR(64) PRIMARY KEY,
        recipient_email VARCHAR(255) NOT NULL,
        enabled BOOLEAN NOT NULL DEFAULT false,
        frequency VARCHAR(32) NOT NULL DEFAULT '1h',
        provider VARCHAR(32) NOT NULL DEFAULT 'preview',
        api_key TEXT,
        smtp_host VARCHAR(255),
        smtp_port INTEGER,
        smtp_user VARCHAR(255),
        smtp_pass TEXT,
        smtp_from VARCHAR(255),
        last_sent_at TIMESTAMPTZ,
        last_status VARCHAR(64),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS email_dispatch_logs (
        id VARCHAR(64) PRIMARY KEY,
        timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        recipient VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        provider VARCHAR(32) NOT NULL,
        status VARCHAR(32) NOT NULL,
        btc_score NUMERIC(5,2),
        spy_score NUMERIC(5,2),
        error TEXT,
        html_content TEXT
      );
    `);
    tablesInitialized = true;
  } catch (err: any) {
    // Database might be in read-only or offline; fallback to memory
    console.warn('Notifications table init warning:', err?.message);
  }
}

export async function getEmailConfig(): Promise<EmailNotificationConfig> {
  await ensureTables();
  try {
    const res = await query('SELECT * FROM email_notification_configs WHERE id = $1 LIMIT 1', ['default']);
    if (res.rows && res.rows.length > 0) {
      const r = res.rows[0];
      return {
        id: r.id,
        recipientEmail: r.recipient_email,
        enabled: Boolean(r.enabled),
        frequency: '1h',
        provider: (r.provider as any) || 'preview',
        apiKey: r.api_key || undefined,
        smtpHost: r.smtp_host || undefined,
        smtpPort: r.smtp_port ? Number(r.smtp_port) : undefined,
        smtpUser: r.smtp_user || undefined,
        smtpPass: r.smtp_pass || undefined,
        smtpFrom: r.smtp_from || undefined,
        lastSentAt: r.last_sent_at ? new Date(r.last_sent_at).toISOString() : undefined,
        lastStatus: r.last_status || undefined,
        updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
      };
    }
  } catch (err) {
    // Fallback to memory
  }
  return memoryConfig;
}

export async function saveEmailConfig(
  newConfig: Partial<EmailNotificationConfig>
): Promise<EmailNotificationConfig> {
  await ensureTables();
  const current = await getEmailConfig();
  const updated: EmailNotificationConfig = {
    ...current,
    ...newConfig,
    updatedAt: new Date().toISOString(),
  };

  memoryConfig = updated;

  try {
    await query(
      `
      INSERT INTO email_notification_configs (
        id, recipient_email, enabled, frequency, provider, api_key, smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from, last_sent_at, last_status, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      ON CONFLICT (id) DO UPDATE SET
        recipient_email = EXCLUDED.recipient_email,
        enabled = EXCLUDED.enabled,
        provider = EXCLUDED.provider,
        api_key = EXCLUDED.api_key,
        smtp_host = EXCLUDED.smtp_host,
        smtp_port = EXCLUDED.smtp_port,
        smtp_user = EXCLUDED.smtp_user,
        smtp_pass = EXCLUDED.smtp_pass,
        smtp_from = EXCLUDED.smtp_from,
        last_sent_at = EXCLUDED.last_sent_at,
        last_status = EXCLUDED.last_status,
        updated_at = NOW();
    `,
      [
        'default',
        updated.recipientEmail,
        updated.enabled,
        '1h',
        updated.provider,
        updated.apiKey || null,
        updated.smtpHost || null,
        updated.smtpPort || null,
        updated.smtpUser || null,
        updated.smtpPass || null,
        updated.smtpFrom || null,
        updated.lastSentAt ? new Date(updated.lastSentAt) : null,
        updated.lastStatus || 'SAVED',
      ]
    );
  } catch (err) {
    // Memory fallback retained
  }

  return updated;
}

export async function recordDispatchLog(log: EmailDispatchLog): Promise<void> {
  memoryLogs.unshift(log);
  if (memoryLogs.length > 50) memoryLogs.pop();

  await ensureTables();
  try {
    await query(
      `
      INSERT INTO email_dispatch_logs (
        id, timestamp, recipient, subject, provider, status, btc_score, spy_score, error, html_content
      ) VALUES ($1, NOW(), $2, $3, $4, $5, $6, $7, $8, $9)
    `,
      [
        log.id,
        log.recipient,
        log.subject,
        log.provider,
        log.status,
        log.btcScore,
        log.spyScore,
        log.error || null,
        log.htmlContent || null,
      ]
    );
  } catch (err) {
    // Memory fallback
  }
}

export async function getDispatchLogs(): Promise<EmailDispatchLog[]> {
  await ensureTables();
  try {
    const res = await query(
      'SELECT * FROM email_dispatch_logs ORDER BY timestamp DESC LIMIT 20'
    );
    if (res.rows && res.rows.length > 0) {
      return res.rows.map((r) => ({
        id: r.id,
        timestamp: new Date(r.timestamp).toISOString(),
        recipient: r.recipient,
        subject: r.subject,
        provider: r.provider,
        status: r.status,
        btcScore: Number(r.btc_score),
        spyScore: Number(r.spy_score),
        error: r.error || undefined,
        htmlContent: r.html_content || undefined,
      }));
    }
  } catch (err) {
    // Fallback
  }
  return memoryLogs;
}
