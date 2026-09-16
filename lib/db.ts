import { Pool } from 'pg';

// Database configuration with environment variable support or local default
const connectionString = process.env.DATABASE_URL || `postgresql://${process.env.USER || 'gui'}@localhost:5432/postgres`;

let pool: Pool | null = null;
let isPgConnected = false;

export function getDbPool(): Pool | null {
  if (pool) return pool;
  try {
    pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 2000,
      max: 10,
    });

    pool.on('error', (err) => {
      console.warn('PostgreSQL Pool background error, fallback active:', err.message);
      isPgConnected = false;
    });

    return pool;
  } catch (err) {
    console.warn('Failed to initialize PostgreSQL pool:', err);
    return null;
  }
}

// Check and initialize the schema blueprint
export async function initializeDatabase(): Promise<boolean> {
  const p = getDbPool();
  if (!p) return false;

  try {
    const client = await p.connect();
    try {
      // Create tables according to the Blueprint
      await client.query(`
        CREATE TABLE IF NOT EXISTS assets (
            id SERIAL PRIMARY KEY,
            symbol VARCHAR(20) UNIQUE NOT NULL,
            name VARCHAR(100) NOT NULL,
            asset_class VARCHAR(20) NOT NULL,
            exchange VARCHAR(50) DEFAULT 'UNKNOWN',
            currency VARCHAR(10) DEFAULT 'USD',
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS ohlcv_candles (
            time TIMESTAMPTZ NOT NULL,
            asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
            timeframe VARCHAR(10) NOT NULL DEFAULT '1d',
            open NUMERIC(18, 6) NOT NULL,
            high NUMERIC(18, 6) NOT NULL,
            low NUMERIC(18, 6) NOT NULL,
            close NUMERIC(18, 6) NOT NULL,
            volume NUMERIC(24, 6) NOT NULL,
            quote_volume NUMERIC(24, 6) DEFAULT 0,
            PRIMARY KEY (asset_id, timeframe, time)
        );
        CREATE INDEX IF NOT EXISTS idx_ohlcv_time_asset ON ohlcv_candles (time DESC, asset_id);

        CREATE TABLE IF NOT EXISTS sentiment_indicators (
            time TIMESTAMPTZ NOT NULL,
            indicator_code VARCHAR(30) NOT NULL,
            value NUMERIC(10, 2) NOT NULL,
            classification VARCHAR(50),
            metadata JSONB DEFAULT '{}'::jsonb,
            PRIMARY KEY (indicator_code, time)
        );
        CREATE INDEX IF NOT EXISTS idx_sentiment_time ON sentiment_indicators (time DESC);

        CREATE TABLE IF NOT EXISTS signal_snapshots (
            id BIGSERIAL PRIMARY KEY,
            time TIMESTAMPTZ NOT NULL,
            asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
            rsi_14 NUMERIC(6, 2),
            sma_200 NUMERIC(18, 4),
            sma_50 NUMERIC(18, 4),
            distance_to_sma200_pct NUMERIC(6, 2),
            rolling_drawdown_zscore NUMERIC(6, 2),
            fear_greed_val NUMERIC(6, 2),
            trigger_rsi_oversold BOOLEAN DEFAULT FALSE,
            trigger_sma200_retest BOOLEAN DEFAULT FALSE,
            trigger_drawdown_zscore BOOLEAN DEFAULT FALSE,
            trigger_extreme_fear BOOLEAN DEFAULT FALSE,
            trigger_calendar_timing BOOLEAN DEFAULT FALSE,
            ml_regime VARCHAR(30),
            ml_dip_success_prob NUMERIC(5, 4),
            ml_expected_fwd_return_14d NUMERIC(6, 2),
            ml_feature_contributions JSONB DEFAULT '{}'::jsonb,
            composite_dip_score INTEGER NOT NULL,
            signal_label VARCHAR(30) NOT NULL,
            metadata JSONB DEFAULT '{}'::jsonb,
            UNIQUE (asset_id, time)
        );
        CREATE INDEX IF NOT EXISTS idx_signals_time ON signal_snapshots (asset_id, time DESC);

        CREATE TABLE IF NOT EXISTS seasonality_stats (
            asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
            period_type VARCHAR(20) NOT NULL,
            period_key INTEGER NOT NULL,
            sample_size INTEGER NOT NULL,
            win_rate_pct NUMERIC(5, 2) NOT NULL,
            avg_return_pct NUMERIC(6, 3) NOT NULL,
            median_return_pct NUMERIC(6, 3) NOT NULL,
            median_drawdown_pct NUMERIC(6, 3) NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            PRIMARY KEY (asset_id, period_type, period_key)
        );

        -- Seed initial assets if not present
        INSERT INTO assets (symbol, name, asset_class, exchange) 
        VALUES 
          ('BTCUSDT', 'Bitcoin / Tether USD', 'crypto', 'Binance'),
          ('SPY', 'SPDR S&P 500 ETF Trust', 'equity', 'NYSEArca'),
          ('^GSPC', 'S&P 500 Index', 'equity', 'Cboe'),
          ('^VIX', 'CBOE Volatility Index', 'indicator', 'Cboe')
        ON CONFLICT (symbol) DO NOTHING;
      `);
      isPgConnected = true;
      console.log('PostgreSQL database and blueprint schema verified successfully.');
      return true;
    } finally {
      client.release();
    }
  } catch (err: unknown) {
    console.warn('PostgreSQL initialization skipped (using embedded storage fallback):', (err as Error)?.message || err);
    isPgConnected = false;
    return false;
  }
}

export function isDatabaseConnected(): boolean {
  return isPgConnected;
}

export async function query(text: string, params?: any[]): Promise<{ rows: any[] }> {
  const p = getDbPool();
  if (!p) return { rows: [] };
  const client = await p.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}
