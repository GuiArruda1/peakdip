# PEAK Dip Hunter — Comprehensive User Guide
### Institutional Timing & Dip-Buying Intelligence for S&P 500 & Crypto

Welcome to **PEAK Dip Hunter**, a Progressive Web App (PWA) designed to eliminate emotional decision-making when buying market pullbacks. By combining **rule-based mathematical triggers**, **macro seasonality patterns**, and **walk-forward machine learning**, PEAK identifies high-probability accumulation zones while protecting you from "catching falling knives" during structural bear trends.

---

## Table of Contents
1. [Quick Start & Navigation](#1-quick-start--navigation)
2. [How the Dip Signals Work](#2-how-the-dip-signals-work)
   - [The Conviction Cockpit (0–100 Score)](#the-conviction-cockpit-0100-score)
   - [The 5 Core Rule-Based Triggers](#the-5-core-rule-based-triggers)
3. [The Machine Learning Signal Enhancer](#3-the-machine-learning-signal-enhancer)
   - [Regime Classification](#regime-classification)
   - [14-Day Bounce Probability](#14-day-bounce-probability-pwin)
   - [Factor Attribution & Explainability](#factor-attribution--explainability)
4. [Using the TradingView Chart](#4-using-the-tradingview-chart)
5. [Exploiting Seasonality & Calendar Tendencies](#5-exploiting-seasonality--calendar-tendencies)
6. [Historical Backtesting & Setting Stop-Losses](#6-historical-backtesting--setting-stop-losses)
7. [Recommended Daily Trading Workflow](#7-recommended-daily-trading-workflow)
8. [Progressive Web App (PWA) Installation](#8-progressive-web-app-pwa-installation)
9. [Architecture & Technical Reference](#9-architecture--technical-reference)

---

## 1. Quick Start & Navigation

Launch the platform at **`http://localhost:3000`** in any modern web browser.

### Header Bar Controls
- **Asset Switcher (`BTC / USDT` vs `S&P 500 (SPY)`)**: Toggle between crypto and equities with zero latency. All chart overlays, indicators, seasonality matrices, and backtest results update automatically.
- **Live Price Ticker**: Displays the current market spot price and 24-hour percentage return.
- **Sync Button**: Manually forces a fresh ingest of daily candles from Binance and Yahoo Finance, and recalculates all indicators and database snapshots.
- **Install PWA Button**: Automatically prompts your browser to install PEAK as a standalone desktop or mobile app.

---

## 2. How the Dip Signals Work

### The Conviction Cockpit (0–100 Score)
The **Composite Conviction Score** is the heart of the platform. It quantifies market capitulation into a single 0–100 gauge:

| Score | Signal Status | Color | Actionable Meaning |
| :--- | :--- | :--- | :--- |
| **70 – 100** | **`STRONG DIP BUY`** | 🟢 Emerald | **High-Conviction Capitulation**: Multiple extreme oversold filters triggered concurrently. Historically provides asymmetrical risk-reward for aggressive scaling in. |
| **50 – 69** | **`MODERATE DIP`** | 🔵 Cyan/Blue | **Value Pullback**: Price is testing major moving averages or short-term oversold boundaries. Favorable window for initiating partial limit orders. |
| **30 – 49** | **`NEUTRAL`** | ⚪ Slate | **Normal Market Session**: No statistical capitulation. Standard Dollar-Cost Averaging (DCA) applies; avoid aggressive leverage. |
| **0 – 29** | **`EXTENDED`** | 🟠 Amber | **Stretched Above Support**: Price is overbought or extended far above the 200-SMA. Poor risk-reward for fresh long entries; consider trailing profit stops. |

---

### The 5 Core Rule-Based Triggers
The cockpit continuously audits 5 mathematical rules:

1. **RSI(14) Oversold ($RSI < 30$ for BTC, $< 35$ for SPY)**
   - *Formula*: 14-period Wilder exponential smoothing of upward vs downward close changes.
   - *Logic*: Flags exhaustion in aggressive selling pressure.
   - *Weight*: **+25 points**

2. **200-Day SMA Uptrend Retest**
   - *Formula*: Price distance to 200 SMA is between $-3.5\%$ and $+2.5\%$ while 200 SMA slope is flat or positive ($\ge 0$).
   - *Logic*: The 200-day Simple Moving Average represents the institutional multi-month cost basis. Pullbacks to this level in macro bull markets are prime institutional reloading zones.
   - *Weight*: **+20 points**

3. **30-Day Drawdown Z-Score Capitulation ($Z \le -2.5\sigma$)**
   - *Formula*: $Z = \frac{\Delta P_t - \mu_{30}}{\sigma_{30}}$, where $\mu_{30}$ and $\sigma_{30}$ are the 30-day rolling mean and standard deviation of single-day returns.
   - *Logic*: Flags single-day panic drops that exceed 2.5 standard deviations from the recent norm (e.g. flash liquidations or unexpected macro headlines).
   - *Weight*: **+25 points**

4. **Extreme Sentiment Panic**
   - *Crypto*: Crypto Fear & Greed Index $\le 20$ (**Extreme Fear**).
   - *S&P 500*: CBOE VIX $\ge 30.0$ (**Volatility Spike**).
   - *Logic*: Historically, the highest forward multi-month returns occur when retail participants are in maximum panic.
   - *Weight*: **+20 points**

5. **Calendar Timing Tendency Window**
   - *Crypto*: **Late Sunday UTC** (captures the weekly low during thin weekend liquidity before Monday institutional cash arrives).
   - *S&P 500*: **Monday Morning Open** (captures the weekly opening gap absorption).
   - *Weight*: **+10 points**

---

## 3. The Machine Learning Signal Enhancer

Rule-based triggers alone have a major flaw: **in a prolonged bear market, RSI can stay oversold for weeks while price drops another 40%**. 

The **Machine Learning Engine** acts as an intelligent supervisor to calibrate the signal:

### Regime Classification
- 🟢 **`BULL_TREND`**: Confirmed when price is above an upward-sloping 200-SMA. Dips are high-probability opportunities.
- 🔴 **`BEAR_TREND`**: Price is below a descending 200-SMA. The ML model penalizes dip scores to prevent catching falling knives.
- 🟡 **`VOLATILE_CHOP`**: Consolidation range around moving averages.

### 14-Day Bounce Probability $P(\text{Win}_{14d})$
Trained via walk-forward cross-validation, this metric outputs the statistical probability ($0.0\%$ to $100\%$) that entering today will produce a positive forward return over the next 14 days without suffering catastrophic adverse excursion.

### Factor Attribution & Explainability
Rather than being a "black box", the ML engine reveals the exact factors driving its confidence:
- `+28% Extreme Sentiment Panic`: Boost from VIX spike or Fear & Greed $<20$.
- `+22% 200-SMA Uptrend Retest`: Boost from testing long-term macro trendline.
- `-14% Macro Downtrend Filter`: Penalty applied if price is trapped beneath a descending 200-SMA.
- `-6% Elevated Short-Term Volatility`: Caution flag when 10-day volatility surges $1.8\times$ above 30-day baseline.

---

## 4. Using the TradingView Chart

The chart module runs the **TradingView Lightweight Charts v5** engine:
- **Candlestick Series**: High-contrast emerald (up) and rose (down) daily price action.
- **Amber Line (200 SMA)**: Long-term macro institutional baseline.
- **Cyan Line (50 SMA)**: Intermediate trend filter.
- **Buy Markers (`DIP XX%`)**: Green upward arrows plotted directly on historical candles where composite dip triggers fired.
- **Synchronized RSI Sub-Chart**: Tracks 14-day Wilder RSI with reference lines at 70 (Overbought) and 30/35 (Oversold).
- **Timeframe Zoom**: Quick buttons for `6M`, `1Y`, `3Y`, and `ALL`.
- **Hover Crosshair**: Displays Date, Open, High, Low, Close, 200 SMA, and RSI in the legend bar.

---

## 5. Exploiting Seasonality & Calendar Tendencies

### Day-of-Week Matrix
- **Bitcoin (BTC)**:
  - **Sunday**: Historically exhibits the softest entry pricing (median drawdown $-1.02\%$), representing the prime entry window of the week.
  - **Monday**: Rebound day as global liquidity and Asian/European markets open.
- **S&P 500 (SPY)**:
  - **Monday**: Weekly gap absorption session; prime accumulation window.
  - **Friday**: Institutional rebalancing session.

### 12-Month Return Heatmap
Displays performance for every month across all historical years:
- **Green cells**: Positive monthly performance (dark green $> +10\%$).
- **Red cells**: Negative monthly performance (dark red $< -10\%$).
- **AVG Row**: Multi-year average return and win rate for each month (e.g., contrasting historically soft Septembers with strong Q4 "Uptober" rallies).

---

## 6. Historical Backtesting & Setting Stop-Losses

The **Forward Return Engine** evaluates every historical dip trigger:
- **+7-Day Forward Return & Win Rate**: Immediate relief bounce speed.
- **+30-Day Forward Return & Win Rate**: Swing trading sweet spot (historical S&P 500 SPY win rate: **~73.5%** with **+3.11%** average gain).
- **+90-Day Forward Return & Win Rate**: Multi-month positioning (historical S&P 500 SPY win rate: **~91.2%** with **+10.76%** average gain).
- **Average Adverse Drawdown**: Average maximum drop during the 30 days after a trigger (e.g., $-5.6\%$ for SPY, $-14.0\%$ for BTC).
  > **Risk Management Rule**: Set stop-losses at approximately $1.5\times$ to $2.0\times$ the historical average adverse drawdown to give the trade room to absorb market chop.

---

## 7. Recommended Daily Trading Workflow

1. **Morning Scan (08:30 UTC / NY Open)**:
   - Open PEAK Dip Hunter.
   - Check the **Composite Score** for both BTC and SPY.
2. **Review the Trigger Checklist**:
   - If score is **$\ge 70$ (`STRONG DIP BUY`)**: Prepare accumulation capital. Verify that the 200-SMA Uptrend trigger is active or sentiment is in Extreme Fear.
   - If score is **$50 - 69$ (`MODERATE DIP`)**: Set staggered limit orders near the 200-SMA line shown on the chart.
   - If score is **$< 30$ (`EXTENDED`)**: Do not chase fresh longs.
3. **Confirm with the ML Insights Card**:
   - Verify the **Regime Badge** is `BULL_TREND` or `VOLATILE_CHOP`.
   - If `BEAR_TREND` is displayed, cut position size by 50% or wait for capitulation volume.
4. **Check Calendar Window**:
   - For BTC: If it is Sunday UTC, look to execute limit orders before the Monday UTC open.
   - For SPY: If it is Monday morning, look for opening gap-fill setups.

---

## 8. Progressive Web App (PWA) Installation

PEAK Dip Hunter is an installable PWA with offline caching:

### On Desktop (Chrome / Brave / Edge)
1. Click the **Install PWA** button in the header (or click the install icon in your browser's address bar).
2. Click **Install**. The app will launch in its own standalone, frameless window with zero browser tab clutter.

### On Mobile (iOS Safari)
1. Navigate to `http://<your-local-ip>:3000` in Safari.
2. Tap the **Share** icon (box with upward arrow) at the bottom.
3. Tap **Add to Home Screen**.
4. Launch "PEAK Dip" from your home screen for full-screen trading terminal mode.

### On Mobile (Android Chrome)
1. Tap the three dots menu in Chrome.
2. Tap **Install App** or **Add to Home screen**.

---

## 9. Hourly Market Email Notifications

PEAK can send an automated institutional market timing digest directly to your email address every 1 hour.

### Digest Contents
- Side-by-side performance cards for **Bitcoin (BTC/USDT)** and the **S&P 500 (SPY)**.
- Live spot price & 24h change.
- **Timing Conviction Score** (0–100) with color badge.
- Status of all 5 mathematical triggers (RSI Wilder, 200 SMA retest, Drawdown Z-Score, Panic sentiment, Calendar window).
- Machine Learning regime (`BULL_TREND` vs `BEAR_TREND`) and 14-day bounce probability $P(\text{Win}_{14d})$.
- Executive Actionable Verdict and exact calculated Stop-Loss level.

### Setup Instructions
1. Click the **"Hourly Alerts"** button (bell icon) in the top navigation bar.
2. Toggle on **"Automated 1-Hour Notifications"**.
3. Enter your email address.
4. Select your provider:
   - **⚡ Instant Preview Mode**: Zero setup needed. Saves full HTML digests to disk and allows viewing inside the app.
   - **✨ Resend API**: Paste your API key from [resend.com](https://resend.com).
   - **✉️ Gmail / Custom SMTP**: Host `smtp.gmail.com`, Port `587`, your Gmail address, and a Google App Password.
   - **🚀 SendGrid API**: Paste your SendGrid API key.
5. Click **"⚡ Send Test Digest Now"** to verify delivery or view the live HTML digest inside the preview frame.

---

## 10. Architecture & Technical Reference

| Layer | Technology | Function |
| :--- | :--- | :--- |
| **Data Ingestion** | Binance Public API & Yahoo Finance API | Public REST endpoints fetching 1,000+ daily OHLCV candles without API keys. |
| **Storage** | PostgreSQL (TimescaleDB ready) + In-Memory Cache | Schema blueprint with hypertable indexing and <20ms cached response times. |
| **Signal Engine** | TypeScript Vectorized Algorithms | Wilder RSI, 200 SMA, 30-day Drawdown Z-Score, Seasonality Matrices. |
| **Machine Learning** | Random Forest + Logit Inference | 14-day forward bounce probability $P(\text{Win})$ and SHAP explainability. |
| **Frontend UI** | Next.js 16 + Tailwind CSS | Bloomberg-style dark financial terminal theme with custom scrollbars and glows. |
| **Charting** | TradingView Lightweight Charts v5 | Canvas-based hardware-accelerated candlestick and RSI rendering. |

### Terminal Commands
- Start dev server: `npm run dev`
- Production build: `npm run build`
- Run production server: `npm start`
- Trigger manual backend sync: `curl -X POST http://localhost:3000/api/sync`
