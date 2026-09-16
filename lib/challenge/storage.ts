import fs from 'fs';
import path from 'path';
import { query } from '@/lib/db';

export interface ChallengeTradeRecord {
  id: number;
  step: number;
  asset: 'BTC' | 'SPY';
  result: 'WIN' | 'LOSS';
  balanceAfter: number;
  date: string;
  notes?: string;
}

export interface ActiveSimulatedTrade {
  id: number;
  date: string;
  asset: 'BTC' | 'SPY';
  step: number;
  entryPrice: number;
  targetPrice: number;
  stopLossPrice: number;
  openTime: number;
  status: 'OPEN' | 'WIN' | 'LOSS';
  targetPct: number;
  stopLossPct: number;
}

export interface ChallengeProfile {
  id: string;
  stepIndex: number;
  assetMode: 'hybrid' | 'btc' | 'spy';
  tradeHistory: ChallengeTradeRecord[];
  currentEquity: number;
  autoBotEnabled?: boolean;
  activeTrade?: ActiveSimulatedTrade | null;
  lastTradeDate?: string;
  updatedAt: string;
}

const IS_VERCEL = process.env.VERCEL === '1' || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = IS_VERCEL ? path.join('/tmp', 'peak-data') : path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'challenge_profile.json');

const DEFAULT_PROFILE: ChallengeProfile = {
  id: 'default',
  stepIndex: 0,
  assetMode: 'hybrid',
  tradeHistory: [],
  currentEquity: 100.0,
  autoBotEnabled: false,
  activeTrade: null,
  lastTradeDate: '',
  updatedAt: new Date().toISOString(),
};

let tableChecked = false;

async function ensureChallengeTable() {
  if (tableChecked) return;
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS user_challenges (
        id VARCHAR(64) PRIMARY KEY,
        step_index INTEGER NOT NULL DEFAULT 0,
        asset_mode VARCHAR(32) NOT NULL DEFAULT 'hybrid',
        trade_history JSONB NOT NULL DEFAULT '[]'::jsonb,
        current_equity NUMERIC(12, 2) NOT NULL DEFAULT 100.0,
        auto_bot_enabled BOOLEAN NOT NULL DEFAULT false,
        active_trade JSONB DEFAULT NULL,
        last_trade_date VARCHAR(32) DEFAULT '',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    // Attempt adding columns if table already existed without them
    await query(`
      ALTER TABLE user_challenges 
      ADD COLUMN IF NOT EXISTS auto_bot_enabled BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS active_trade JSONB DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS last_trade_date VARCHAR(32) DEFAULT '';
    `).catch(() => {});
    tableChecked = true;
  } catch (err) {
    // Database may be offline; fallback to filesystem
  }
}

export async function getChallengeProfile(): Promise<ChallengeProfile> {
  // 1. Try reading from PostgreSQL
  try {
    await ensureChallengeTable();
    const res = await query(
      'SELECT * FROM user_challenges WHERE id = $1 LIMIT 1',
      ['default']
    );
    if (res.rows && res.rows.length > 0) {
      const row = res.rows[0];
      return {
        id: row.id,
        stepIndex: Number(row.step_index) || 0,
        assetMode: row.asset_mode || 'hybrid',
        tradeHistory: Array.isArray(row.trade_history) ? row.trade_history : [],
        currentEquity: Number(row.current_equity) || 100.0,
        autoBotEnabled: Boolean(row.auto_bot_enabled),
        activeTrade: row.active_trade || null,
        lastTradeDate: row.last_trade_date || '',
        updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
      };
    }
  } catch {
    // Continue to file fallback
  }

  // 2. Fallback to local filesystem (data/challenge_profile.json)
  try {
    if (fs.existsSync(FILE_PATH)) {
      const fileData = fs.readFileSync(FILE_PATH, 'utf-8');
      const parsed = JSON.parse(fileData);
      return {
        ...DEFAULT_PROFILE,
        ...parsed,
      };
    }
  } catch (err) {
    console.warn('Failed to read challenge file profile:', err);
  }

  return DEFAULT_PROFILE;
}

export async function saveChallengeProfile(
  profile: Partial<ChallengeProfile>
): Promise<ChallengeProfile> {
  const current = await getChallengeProfile();
  const updated: ChallengeProfile = {
    ...current,
    ...profile,
    id: 'default',
    updatedAt: new Date().toISOString(),
  };

  // 1. Persist to local JSON file
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write challenge profile to filesystem:', err);
  }

  // 2. Persist to PostgreSQL if available
  try {
    await ensureChallengeTable();
    await query(
      `
      INSERT INTO user_challenges (id, step_index, asset_mode, trade_history, current_equity, auto_bot_enabled, active_trade, last_trade_date, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (id) DO UPDATE SET
        step_index = EXCLUDED.step_index,
        asset_mode = EXCLUDED.asset_mode,
        trade_history = EXCLUDED.trade_history,
        current_equity = EXCLUDED.current_equity,
        auto_bot_enabled = EXCLUDED.auto_bot_enabled,
        active_trade = EXCLUDED.active_trade,
        last_trade_date = EXCLUDED.last_trade_date,
        updated_at = NOW();
    `,
      [
        'default',
        updated.stepIndex,
        updated.assetMode,
        JSON.stringify(updated.tradeHistory),
        updated.currentEquity,
        updated.autoBotEnabled ?? false,
        updated.activeTrade ? JSON.stringify(updated.activeTrade) : null,
        updated.lastTradeDate ?? '',
      ]
    );
  } catch (err) {
    // File fallback already saved safely
  }

  return updated;
}
