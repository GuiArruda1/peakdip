'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import ConvictionCockpit from '@/components/ConvictionCockpit';
import MLInsightsCard from '@/components/MLInsightsCard';
import TradingViewChart from '@/components/TradingViewChart';
import SeasonalityMatrix from '@/components/SeasonalityMatrix';
import BacktestMetrics from '@/components/BacktestMetrics';
import CopilotChat from '@/components/CopilotChat';
import BrowserAlertEngine from '@/components/BrowserAlertEngine';
import DayTradeTerminal from '@/components/DayTradeTerminal';
import ComponentPillTip from '@/components/ComponentPillTip';
import MobileNavDock from '@/components/MobileNavDock';
import AIBubbleThermometer from '@/components/AIBubbleThermometer';
import DefconRadar from '@/components/DefconRadar';
import ElderRayCard from '@/components/ElderRayCard';
import ElderRiskCalculator from '@/components/ElderRiskCalculator';
import Challenge100To1k from '@/components/Challenge100To1k';
import SimulacrumRadar from '@/components/SimulacrumRadar';
import MindsetMasteryCockpit from '@/components/MindsetMasteryCockpit';
import LiveNewsTicker from '@/components/LiveNewsTicker';
import {
  OHLCVCandle,
  CalculatedIndicators,
  DipConvictionSnapshot,
  SeasonalityMatrixData,
  BacktestResult,
} from '@/lib/types';
import { ShieldCheck, Database, Cpu, Wifi, AlertOctagon } from 'lucide-react';

export default function Dashboard() {
  const [activeMode, setActiveMode] = useState<'swing' | 'daytrade' | 'defcon'>('swing');
  const [defconKillSwitch, setDefconKillSwitch] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<'BTCUSDT' | 'SPY'>('BTCUSDT');

  const [marketData, setMarketData] = useState<{
    candles: OHLCVCandle[];
    indicators: CalculatedIndicators;
    markers: any[];
  } | null>(null);

  const [cockpitData, setCockpitData] = useState<{
    btc: DipConvictionSnapshot | null;
    spy: DipConvictionSnapshot | null;
  } | null>(null);

  const [seasonalityData, setSeasonalityData] = useState<SeasonalityMatrixData | null>(null);
  const [backtestData, setBacktestData] = useState<BacktestResult | null>(null);

  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const [assetConviction, setAssetConviction] = useState<DipConvictionSnapshot | null>(null);

  // Fetch Cockpit data (BTC & SPY snapshots)
  const loadCockpit = useCallback(async () => {
    try {
      const res = await fetch('/api/signals/cockpit');
      if (res.ok) {
        const data = await res.json();
        setCockpitData(data);
      }
    } catch (e) {
      console.error('Error loading cockpit:', e);
    }
  }, []);

  // Fetch Asset Data (Market Candles, Seasonality, Backtest, Conviction) atomically
  const loadAssetData = useCallback(async (asset: 'BTCUSDT' | 'SPY', isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const res = await fetch(`/api/market-data?symbol=${asset}`);
      if (res.ok) {
        const data = await res.json();
        setMarketData({
          candles: data.candles,
          indicators: data.indicators,
          markers: data.markers,
        });
        if (data.conviction) setAssetConviction(data.conviction);
        if (data.seasonality) setSeasonalityData(data.seasonality);
        if (data.backtest) setBacktestData(data.backtest);
      }
    } catch (e) {
      console.error('Error loading asset data:', e);
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCockpit();
    loadAssetData(selectedAsset);

    // Auto-refresh cockpit and market data every 30,000ms (30 seconds) in background
    const interval = setInterval(() => {
      loadCockpit();
      loadAssetData(selectedAsset, true);
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedAsset, loadCockpit, loadAssetData]);

  // Handle Asset Switch
  const handleSelectAsset = (asset: 'BTCUSDT' | 'SPY') => {
    if (asset !== selectedAsset) {
      setSelectedAsset(asset);
    }
  };

  // Handle Manual Sync
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await fetch('/api/sync', { method: 'POST' });
      await Promise.all([loadCockpit(), loadAssetData(selectedAsset)]);
    } catch (e) {
      console.error('Sync failed:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const currentConviction =
    assetConviction && assetConviction.assetSymbol.includes(selectedAsset === 'BTCUSDT' ? 'BTC' : 'SPY')
      ? assetConviction
      : selectedAsset === 'BTCUSDT'
      ? cockpitData?.btc
      : cockpitData?.spy;

  const handleOpenAlerts = () => {
    window.dispatchEvent(new CustomEvent('open-notification-settings'));
  };

  const handleOpenChat = () => {
    window.dispatchEvent(new CustomEvent('open-copilot'));
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-[var(--bg-base)] text-[var(--text-main)]">
      {/* Header Navigation */}
      <Navbar
        selectedAsset={selectedAsset}
        onSelectAsset={handleSelectAsset}
        currentPrice={currentConviction?.currentPrice || 0}
        priceChange24h={currentConviction?.priceChange24h || 0}
        onSync={handleSync}
        isSyncing={isSyncing}
        lastUpdated={currentConviction?.lastUpdated}
        mode={activeMode}
        onModeChange={setActiveMode}
      />

      {/* Main Content Terminal (with bottom padding for mobile dock and live news ticker) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 pb-36 sm:pb-16 min-w-0 overflow-hidden">
        {activeMode === 'defcon' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActiveMode('swing')}
                className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-mono font-bold text-slate-200 transition-all border border-slate-700 flex items-center gap-2"
              >
                <span>← Back to Swing Hunter</span>
              </button>
            </div>
            <DefconRadar onKillSwitchChange={setDefconKillSwitch} />
          </div>
        ) : activeMode === 'daytrade' ? (
          <DayTradeTerminal onBackToSwing={() => setActiveMode('swing')} />
        ) : (
          <>
            {/* Geopolitical Emergency Banner if Kill-Switch is Active */}
            {defconKillSwitch && (
              <div className="p-4 rounded-2xl bg-rose-950/80 border-2 border-rose-500 shadow-2xl shadow-rose-950/70 flex flex-wrap items-center justify-between gap-4 animate-pulse">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-rose-900/60 border border-rose-500 flex items-center justify-center shrink-0">
                    <AlertOctagon className="w-6 h-6 text-rose-300" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-mono font-black text-rose-100 uppercase tracking-wider">
                      ⚠️ DEFCON 1/2 BLACK SWAN ALERT: DIP-BUYING KILL-SWITCH ACTIVE
                    </h4>
                    <p className="text-xs text-rose-300/90 mt-0.5">
                      Major military confrontation or energy supply shock detected. Standard dip accumulation is paused to prevent catastrophic adverse drawdown.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveMode('defcon')}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold transition-all shadow-lg shrink-0"
                >
                  Inspect Radar →
                </button>
              </div>
            )}

            {/* Layer 1: Conviction Cockpit */}
            <section id="cockpit">
          <ComponentPillTip
            layer="LAYER 1"
            title="Conviction Cockpit"
            liveStatus={`Composite Timing Score: ${currentConviction?.compositeScore || 0}/100 • Signal: ${currentConviction?.signalLabel.replace(/_/g, ' ') || 'CALCULATING'}`}
            summary="Combines 5 core mathematical rules (RSI exhaustion, 200-SMA support retest, single-day drawdown Z-score, sentiment panic, and weekly calendar timing) with ML confidence modulation to generate an institutional timing conviction score."
            howToRead={[
              "Score >= 70 (Emerald): High-conviction capitulation dip. Optimal asymmetric risk-reward for aggressive scaling in.",
              "Score 50–69 (Cyan): Moderate value pullback. Place staggered limit orders near 200-SMA support.",
              "Score < 30 (Amber): Extended market. Avoid chasing fresh longs; trailing stop-loss recommended.",
              "Triggers Matrix: Shows exactly which of the 5 mathematical rules are currently triggered."
            ]}
            theme="emerald"
          />
          <ConvictionCockpit conviction={currentConviction || null} loading={loading} />
        </section>

        {/* Layer 1B: The $100 -> $1,000 Hybrid Vanguard Compounding Challenge */}
        <section id="compounding-challenge">
          <ComponentPillTip
            layer="CHALLENGE"
            title="$100 → $1,000 Hybrid Vanguard Compounding Blueprint"
            liveStatus={`Step ${cockpitData ? 'Active' : 'Syncing'} • 12-Stage Golden Ratio (1.618R) Ladder • Crypto & S&P 500 Hybrid`}
            summary="A quantitative capital growth blueprint designed to turn $100 into $1,000 across 12 high-conviction trades (~45–60 days). Dynamically routes capital into whichever asset (Bitcoin or S&P 500) has superior institutional conviction."
            howToRead={[
              "The 12 Steps: Each step compounds +21.5% using a 1.618R Golden Profit Target with strict 3.5% stops.",
              "Hybrid Routing: Allocates into BTC on weekend/capitulation drops, and SPY on macro opening pullbacks.",
              "Anti-Blowup Shield: Spot execution with zero liquidation risk protects capital to ensure completion of all 12 steps."
            ]}
            theme="amber"
          />
          <Challenge100To1k
            btcConviction={cockpitData?.btc || null}
            spyConviction={cockpitData?.spy || null}
          />
        </section>

        {/* Layer 1C: Baudrillard Simulacra & Hyperreality Radar */}
        <section id="simulacra-radar">
          <ComponentPillTip
            layer="HYPERREALITY"
            title="Baudrillard Simulacra Arbitrage Engine"
            liveStatus="Active Monitoring • Media Sentiment vs. Institutional Order Flow • Δ_sim Glitch Hunter"
            summary="Grounded in Jean Baudrillard's 4th-Order Simulacrum. Measures the mathematical divergence between manufactured media dread/euphoria and mechanical liquidity reality to identify asymmetric 'Red Pill' liquidation dip entries."
            howToRead={[
              "Δ_sim >= +35 (Red Pill Glitch): Media running maximum panic loop while institutional order flow absorbs dips. Optimal asymmetric long.",
              "Δ_sim <= -35 (Matrix Mirage): Public euphoria and retail FOMO while smart money quietly distributes. Capital shield recommended.",
              "-35 < Δ_sim < +35 (Coherent): Narrative aligns with order flow. Execute standard quantitative rules."
            ]}
            theme="purple"
          />
          <SimulacrumRadar
            btcConviction={cockpitData?.btc || null}
            spyConviction={cockpitData?.spy || null}
          />
        </section>

        {/* Layer 1D: Mindset & Risk Mastery Cockpit */}
        <section id="mindset-mastery">
          <ComponentPillTip
            layer="PSYCHOLOGY & RISK"
            title="Mindset & Risk Mastery Cockpit"
            liveStatus="Active • 4 Trading Classics Synthesized • Douglas 20-Batch • Hougaard Best Loser • Livermore Sitting • PTJ 5:1"
            summary="Transforms qualitative trading psychology into hard quantitative execution metrics: Mark Douglas 20-trade sample batches, Tom Hougaard stop adherence, Jesse Livermore cash sitting patience, and Paul Tudor Jones 5:1 asymmetry edge."
            howToRead={[
              "Douglas 20-Batch: Never judge an edge on 1 or 2 trades. Complete 20 trades before measuring expectancy (E).",
              "Hougaard Best Loser: Measures stop compliance. Only amateurs hold losers and add to down positions.",
              "Livermore Patience: Counts hours waiting in 100% cash until price tests a decisive Pivotal Point.",
              "PTJ 5:1 Asymmetry: Enforces a minimum 3:1 to 5:1 reward-to-risk ratio so you can be right only 20-30% of the time and remain highly profitable."
            ]}
            theme="amber"
          />
          <MindsetMasteryCockpit
            btcConviction={cockpitData?.btc || null}
            spyConviction={cockpitData?.spy || null}
          />
        </section>

        {/* Layer 2: Machine Learning Signal Enhancer */}
        <section id="ml-engine">
          <ComponentPillTip
            layer="LAYER 2"
            title="Machine Learning Enhancer"
            liveStatus={`Regime: ${currentConviction?.ml.regime || 'CHOP'} • P(14d Win): ${Math.round((currentConviction?.ml.dipSuccessProb14d || 0.5) * 100)}% • Exp. Return: +${currentConviction?.ml.expectedFwdReturn14d || 0}%`}
            summary="Walk-forward Random Forest + Logit supervisor trained across historical bull and bear regimes. It dynamically penalizes dip scores during macro downtrends to prevent catching falling knives."
            howToRead={[
              "BULL_TREND: Dips are high-probability buying opportunities. Pullbacks to moving averages are favored.",
              "BEAR_TREND: Strict caution. Oversold RSI is penalized; requires extreme capitulation volume to warrant entries.",
              "Factor Attribution (SHAP): Displays the top mathematical drivers giving the model confidence or caution."
            ]}
            theme="cyan"
          />
          <MLInsightsCard ml={currentConviction?.ml} symbol={selectedAsset} />
        </section>

        {/* Layer 2B: Dr. Alexander Elder Triple Screen & Elder-Ray */}
        <section id="elder-triple-screen">
          <ComponentPillTip
            layer="LAYER 2B"
            title="Dr. Elder's Triple Screen & Elder-Ray"
            liveStatus={`Weekly Tide: ${currentConviction?.indicators.tripleScreen?.screen1Tide.direction || 'BULLISH'} • Daily Wave: ${currentConviction?.indicators.tripleScreen?.screen2Wave.condition.replace(/_/g, ' ') || 'PULLBACK'} • Confluence: ${currentConviction?.indicators.tripleScreen?.confluenceScore || 0}%`}
            summary="From Dr. Alexander Elder's 'Trading for a Living'. Combines Screen 1 (Weekly Tide via 13-week EMA slope) with Screen 2 (Daily Wave via Bull/Bear Power) and Screen 3 (Intraday execution) to prevent counter-trend traps."
            howToRead={[
              "Screen 1 (Weekly Tide): Only trade in the direction of the weekly tide. When Tide is Bullish, only buy dips.",
              "Screen 2 (Daily Wave): Uses Elder-Ray Bear Power and 2-Day Force Index to flag when a pullback is oversold.",
              "Bullish Divergence: Occurs when price makes a lower low but Bear Power makes a higher low — premier buying trigger."
            ]}
            theme="cyan"
          />
          <ElderRayCard
            elderRay={currentConviction?.indicators.elderRay}
            tripleScreen={currentConviction?.indicators.tripleScreen}
            currentPrice={currentConviction?.currentPrice || 0}
            symbol={selectedAsset}
          />
        </section>

        {/* Layer 3: TradingView Lightweight Candlestick Chart & RSI Subpane */}
        <section id="chart">
          <ComponentPillTip
            layer="LAYER 3"
            title="TradingView Action & Overlays"
            liveStatus={`${selectedAsset} Candles • 200 SMA (Amber) • 50 SMA (Cyan) • Historical Buy Markers • Synchronized RSI(14)`}
            summary="Interactive hardware-accelerated TradingView canvas. Visualizes price action against long-term multi-month cost basis (200 SMA), verified historical dip trigger markers, and momentum exhaustion (RSI)."
            howToRead={[
              "Amber Line (200 SMA): The macro institutional baseline. Retests here during uptrends are prime reload zones.",
              "Green Markers ('DIP XX%'): Historical dates where composite dip triggers fired in the past.",
              "Sub-Chart RSI: 14-period Wilder smoothing. Green dashed line marks oversold (<30 BTC / <35 SPY)."
            ]}
            theme="blue"
          />
          <TradingViewChart
            candles={marketData?.candles || []}
            indicators={marketData?.indicators || { rsi14: [], sma200: [], sma50: [], drawdownZScore: [], distanceToSma200Pct: [] }}
            markers={marketData?.markers || []}
            symbol={selectedAsset}
            loading={loading}
          />
        </section>

        {/* Layer 4: AI Bubble Thermometer & S&P 500 Tech Megacaps */}
        <section id="bubble-thermometer">
          <AIBubbleThermometer />
        </section>

        {/* Layer 4B: DEFCON Geopolitical & WW3 Risk Radar */}
        <section id="defcon-radar">
          <ComponentPillTip
            layer="LAYER 4B"
            title="DEFCON Geopolitical & WW3 Risk Radar"
            liveStatus="Polymarket War Odds • Crude Oil Shocks • Gold Flights • Defense ETF Surge"
            summary="Real-money conflict escalation telemetry and financial war shock proxies. If Superpower armed conflict escalates to DEFCON 1 or 2, the Catastrophic Kill-Switch engages to protect capital."
            howToRead={[
              "DEFCON 5 (Green): Normal peacetime accumulation. Dip rules operational.",
              "DEFCON 3-4 (Blue/Amber): Regional tension. Monitor Crude Oil and tighten trailing stops.",
              "DEFCON 1-2 (Orange/Red): High superpower war risk. Kill-switch halts dip buying to prevent catching falling knives."
            ]}
            theme="rose"
          />
          <DefconRadar onKillSwitchChange={setDefconKillSwitch} />
        </section>

        {/* Layer 5: Seasonality Matrix */}
        <section id="seasonality">
          <ComponentPillTip
            layer="LAYER 5"
            title="Seasonality & Calendar Matrix"
            liveStatus={`7-Day Weekday Win-Rates • 12-Month Return Heatmap (${seasonalityData?.monthlyHeatmap.length || 0} Years Historical)`}
            summary="Tracks calendar liquidity patterns and recurring market tendencies. Weekend liquidity thinness creates entry discounts on Bitcoin, while Monday opening sessions provide key equity gap absorption."
            howToRead={[
              "Sunday UTC (BTC): Historically exhibits lowest median drawdowns (-1.02%) before Monday global liquidity opens.",
              "Monday Open (SPY): Prime window for accumulating weekend gap pullbacks.",
              "12-Month Heatmap: Color-coded historical matrix revealing monthly tendencies (e.g., September dip vs Q4 Uptober rally)."
            ]}
            theme="amber"
          />
          <SeasonalityMatrix seasonality={seasonalityData} loading={loading} />
        </section>

        {/* Layer 6: Historical Backtest & Forward Return Engine */}
        <section id="backtest">
          <ComponentPillTip
            layer="LAYER 6"
            title="Walk-Forward Historical Backtest"
            liveStatus={`Tracked ${backtestData?.totalSignals || 0} Verified Historical Dips • 30d Win Rate: ${backtestData?.winRate30d || 0}% • 90d Win Rate: ${backtestData?.winRate90d || 0}%`}
            summary="Simulates the actual forward performance (+7-day, +30-day, and +90-day returns) following every historical dip trigger event in the dataset so you can trade with quantitative confidence."
            howToRead={[
              "+30d & +90d Forward Win Rates: Historical probability of producing a profitable trade after an alert.",
              "Average Adverse Drawdown: The typical noise drop during the holding period. Calibrate stop-losses at 1.5x to 2.0x this level.",
              "Historical Triggers Table: A transparent ledger of past signals, entry prices, and their verified outcomes."
            ]}
            theme="purple"
          />
          <BacktestMetrics backtest={backtestData} loading={loading} />
        </section>

        {/* Layer 6B: Dr. Alexander Elder 2% & 6% Capital Preservation Risk Cockpit */}
        <section id="elder-risk-calculator">
          <ComponentPillTip
            layer="LAYER 6B"
            title="Dr. Elder's 2% & 6% Risk Management Cockpit"
            liveStatus="Max 2% Risk per Trade • 6% Monthly Circuit Breaker • Dynamic Position Sizing"
            summary="Strict mathematical capital preservation rules from 'Trading for a Living'. Computes the exact dollar and unit allocation so no single loss exceeds 2% of your equity, and enforces the 6% monthly loss limit to eliminate emotional account blowups."
            howToRead={[
              "2% Rule: Caps risk at 2% of account equity. You would need 50 straight losses to lose your capital.",
              "Position Sizing Formula: Position Size = (Account Equity × 0.02) / (Entry Price - Stop Loss Price).",
              "6% Rule: If total losses reach 6% in a calendar month, stop trading immediately until the next month begins."
            ]}
            theme="emerald"
          />
          <ElderRiskCalculator
            currentPrice={currentConviction?.currentPrice || 0}
            symbol={selectedAsset}
            recommendedStopPrice={
              currentConviction?.currentPrice && backtestData?.maxDrawdownAvg
                ? currentConviction.currentPrice * (1 - Math.abs(backtestData.maxDrawdownAvg * 1.5) / 100)
                : undefined
            }
          />
        </section>
        </>
      )}
    </main>

      {/* Terminal Footer */}
      <footer className="border-t border-slate-800/80 bg-[var(--bg-base)] py-8 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>PEAK Institutional Timing</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Database className="w-3.5 h-3.5" />
              <span>PostgreSQL / TimescaleDB</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Cpu className="w-3.5 h-3.5" />
              <span>ML Random Forest + Logit</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Wifi className="w-3.5 h-3.5" />
              <span>PWA Offline Cache</span>
            </div>
          </div>

          <div className="text-center sm:text-right text-slate-400">
            Binance Public API • Yahoo Finance SPY • Alternative.me Crypto Fear & Greed • CBOE VIX
          </div>
        </div>
      </footer>

      {/* 30-Minute Browser Push Decision Alert Engine */}
      <BrowserAlertEngine />

      {/* Floating AI Quantitative Copilot & Advisor */}
      <CopilotChat
        selectedAsset={selectedAsset}
        currentScore={currentConviction?.compositeScore}
        signalLabel={currentConviction?.signalLabel}
        signalColor={currentConviction?.signalColor}
        mode={activeMode === 'daytrade' ? 'daytrade' : 'swing'}
      />

      {/* Mobile Ergonomic Bottom Navigation Dock */}
      <MobileNavDock
        activeMode={activeMode}
        onModeChange={setActiveMode}
        onOpenAlerts={handleOpenAlerts}
        onOpenChat={handleOpenChat}
        currentPrice={currentConviction?.currentPrice || 0}
        priceChange24h={currentConviction?.priceChange24h || 0}
        selectedAsset={selectedAsset}
      />

      {/* Bottom Fixed Real-Time Infinite News Wire Ticker */}
      <LiveNewsTicker />
    </div>
  );
}
