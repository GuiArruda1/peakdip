'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Zap,
  Shield,
  ShieldCheck,
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  Activity,
  DollarSign,
  RefreshCw,
  CheckCircle2,
  Bell,
  Sparkles,
  Smartphone,
  Monitor,
  Volume2,
  Sliders,
  Send,
} from 'lucide-react';
import {
  checkNotificationPermission,
  requestNotificationPermission,
  playTradeCompletionAudio,
  sendTradeCompletionNotification,
  sendSystemTestNotification,
} from '@/lib/notifications/browserAlerts';
import { ChallengeProfile, ActiveSimulatedTrade } from '@/lib/challenge/storage';

export default function QuantfuryHubPage() {
  // Live State from API
  const [profile, setProfile] = useState<ChallengeProfile | null>(null);
  const [cockpitData, setCockpitData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [mounted, setMounted] = useState<boolean>(false);

  // Copy Feedback Toasts
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Interface Mockup View Mode
  const [mockupMode, setMockupMode] = useState<'mobile' | 'web'>('mobile');

  // Webhook integration state (persisted locally)
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [webhookTestStatus, setWebhookTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  // Audio / Push permission
  const [notifPermission, setNotifPermission] = useState<string>('default');

  // Fetch Live Data
  const fetchData = async () => {
    try {
      setIsSyncing(true);
      const [chalRes, cockRes] = await Promise.all([
        fetch('/api/challenge'),
        fetch('/api/signals/cockpit'),
      ]);

      if (chalRes.ok) {
        const chalData = await chalRes.json();
        if (chalData?.profile) {
          setProfile(chalData.profile);
        }
      }

      if (cockRes.ok) {
        const cData = await cockRes.json();
        setCockpitData(cData);
      }
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Quantfury hub fetch error:', err);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchData();
    // Refresh prices every 6 seconds
    const interval = setInterval(fetchData, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setNotifPermission(checkNotificationPermission());
    const savedWebhook = localStorage.getItem('peak_quantfury_webhook_url');
    if (savedWebhook) setWebhookUrl(savedWebhook);
  }, []);

  const handleSaveWebhook = (url: string) => {
    setWebhookUrl(url);
    localStorage.setItem('peak_quantfury_webhook_url', url);
  };

  const handleEnableAlerts = async () => {
    const res = await requestNotificationPermission();
    setNotifPermission(res);
    if (res === 'granted') {
      playTradeCompletionAudio(true);
    }
  };

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const activeTrade: ActiveSimulatedTrade | null = profile?.activeTrade || null;
  const isBtc = !activeTrade || activeTrade.asset === 'BTC';

  // Extract Live Price
  const livePrice = useMemo(() => {
    if (isBtc && cockpitData?.btc?.currentPrice) {
      return cockpitData.btc.currentPrice;
    }
    if (!isBtc && cockpitData?.spy?.currentPrice) {
      return cockpitData.spy.currentPrice;
    }
    return activeTrade?.entryPrice || 75900;
  }, [isBtc, cockpitData, activeTrade]);

  // Real-time calculations
  const unrealizedPct = useMemo(() => {
    if (!activeTrade || !activeTrade.entryPrice) return 0;
    return ((livePrice - activeTrade.entryPrice) / activeTrade.entryPrice) * 100;
  }, [livePrice, activeTrade]);

  const unrealizedDollar = useMemo(() => {
    if (!activeTrade || !profile?.currentEquity) return 0;
    return (profile.currentEquity * (unrealizedPct / 100));
  }, [unrealizedPct, activeTrade, profile]);

  // Copy Ticket Formatted Text
  const fullTicketSnippet = useMemo(() => {
    if (!activeTrade) {
      return `PEAK QUANTFURY BRACKET TICKET\nAsset: BTC/USDT\nOrder: BUY (Long)\nPosition Size: $${(profile?.currentEquity || 100).toFixed(2)}\nTarget: +5.66% (1.618R)\nStop-Loss: -3.50%`;
    }
    return `PEAK QUANTFURY BRACKET ORDER\n--------------------------------\nAsset: ${activeTrade.asset === 'BTC' ? 'BTC/USDT' : 'SPY'}\nAction: BUY (Long)\nTrade Size: $${(profile?.currentEquity || 100).toFixed(2)}\nEntry Price: $${activeTrade.entryPrice.toLocaleString()}\nTarget Price (Take Profit): $${activeTrade.targetPrice.toLocaleString()} (+${activeTrade.targetPct}%)\nStop Loss Price: $${activeTrade.stopLossPrice.toLocaleString()} (-${activeTrade.stopLossPct}%)\nLadder Step: ${activeTrade.step} of 12\n--------------------------------\nZero-Fee Spot Execution on Quantfury`;
  }, [activeTrade, profile]);

  // Test Webhook Dispatch
  const handleTestWebhook = async () => {
    setWebhookTestStatus('testing');

    // Browser Notification Test (Explicitly tagged as system test)
    sendSystemTestNotification();

    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `⚡ **PEAK Quantfury Signal Test**\nAsset: ${activeTrade?.asset || 'BTC'}/USDT\nEntry: $${(activeTrade?.entryPrice || livePrice).toLocaleString()}\nTarget: $${(activeTrade?.targetPrice || livePrice * 1.0566).toFixed(2)} (+5.66%)\nStop Loss: $${(activeTrade?.stopLossPrice || livePrice * 0.965).toFixed(2)} (-3.50%)\nStatus: Ready to execute on Quantfury!`,
          }),
        });
        setWebhookTestStatus('success');
      } catch {
        setWebhookTestStatus('error');
      }
    } else {
      setWebhookTestStatus('success');
    }
    setTimeout(() => setWebhookTestStatus('idle'), 3500);
  };

  // Compounding table data
  const compoundingSteps = useMemo(() => {
    let eq = 100;
    const steps = [];
    for (let i = 1; i <= 12; i++) {
      const gain = eq * 0.215;
      const endEq = eq + gain;
      const lossRisk = eq * 0.035;
      steps.push({
        step: i,
        startEquity: eq,
        tradeSize: eq,
        winGain: gain,
        endEquity: endEq,
        riskLoss: lossRisk,
      });
      eq = endEq;
    }
    return steps;
  }, []);

  return (
    <div className="min-h-screen bg-[#070A0F] text-slate-100 selection:bg-emerald-500 selection:text-black">
      {/* Top Background Glow Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#080B11]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/terminal"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-white bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Terminal</span>
            </Link>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 p-[1px]">
                <div className="w-full h-full bg-[#0B0F17] rounded-[7px] flex items-center justify-center">
                  <Zap className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
              <span className="font-mono font-bold text-sm sm:text-base text-white tracking-wide">
                Quantfury <span className="text-emerald-400 font-light">Execution Hub</span>
              </span>
              <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-emerald-950/80 border border-emerald-700/60 text-emerald-300">
                0% Fees Engine
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Real-time Sync Status */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-[#0F1420] border border-slate-800 text-xs font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-400">Live Spot:</span>
              <span className="text-white font-bold">${livePrice.toLocaleString()}</span>
              <button
                onClick={fetchData}
                disabled={isSyncing}
                className="p-1 text-slate-400 hover:text-white transition-colors"
                title="Refresh Live Market Rates"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
              </button>
            </div>

            {/* Notification Permissions Button */}
            {notifPermission !== 'granted' ? (
              <button
                onClick={handleEnableAlerts}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all"
              >
                <Bell className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Enable Alerts</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono bg-emerald-950/60 border border-emerald-800 text-emerald-400">
                <Bell className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Alerts Active</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Banner: Zero-Fee Mirror Concept */}
        <section className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#0B0F19] via-[#09111E] to-[#0A1617] border border-emerald-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="max-w-3xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-600/50 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                15-Second Mirror Protocol
              </span>
              <span className="text-xs font-mono text-slate-400">
                Updated {mounted ? lastRefreshed.toLocaleTimeString() : 'Live'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Mirror PEAK Bot Trades directly into{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                Quantfury
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Because the <strong>$100 → $1,000 Vanguard Challenge</strong> compounds +21.5% per step, brokerage commission drag on other exchanges would wipe out up to 40% of the growth. Quantfury operates with <strong>0% trading commissions, 0% borrow fees</strong>, and fills orders at real Binance spot exchange prices.
            </p>
          </div>
        </section>

        {/* SECTION 1: LIVE ACTIVE TRADE TICKET (COPY HUB) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider">
                1. Active Bot Trade Ticket
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {activeTrade ? '● Trade Open in Real-Time' : '○ Standby / Daily Signal Ready'}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: The Live Bracket Parameters & 1-Click Copy Cards */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-6 rounded-2xl bg-[#0A0E17] border border-slate-800 shadow-xl space-y-6">
                {/* Status Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-mono font-bold text-white">
                          {isBtc ? '₿ BTC/USDT (Bitcoin)' : '📈 SPY (S&P 500 ETF)'}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          LONG (BUY)
                        </span>
                      </div>
                      <span className="text-xs font-mono text-slate-400">
                        Challenge Ladder: Step {activeTrade?.step || profile?.stepIndex || 1} of 12
                      </span>
                    </div>
                  </div>

                  {/* Real-time Unrealized PnL */}
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm font-bold border ${
                    unrealizedPct >= 0 
                      ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700/80 shadow-lg shadow-emerald-950/40' 
                      : 'bg-rose-950/70 text-rose-300 border-rose-700/80 shadow-lg shadow-rose-950/40'
                  }`}>
                    <Activity className="w-4 h-4 animate-pulse" />
                    <span>Unrealized:</span>
                    <span className="font-mono font-black text-base">
                      {unrealizedPct >= 0 ? '+' : ''}${unrealizedDollar.toFixed(2)} ({unrealizedPct >= 0 ? '+' : ''}{unrealizedPct.toFixed(2)}%)
                    </span>
                  </div>
                </div>

                {/* The 4 Parameter Cards for Quantfury with 1-Click Copy */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Parameter 1: Position Size */}
                  <div className="p-4 rounded-xl bg-[#0E1422] border border-slate-800/90 relative group hover:border-slate-700 transition-all">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                        Trade Size / Capital
                      </span>
                      <button
                        onClick={() => handleCopy('size', (profile?.currentEquity || 100).toFixed(2))}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1 text-[10px] font-mono"
                        title="Copy trade size amount"
                      >
                        {copiedKey === 'size' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'size' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="text-xl font-mono font-black text-white">
                      ${(profile?.currentEquity || 100).toFixed(2)}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Input as the total trade amount in Quantfury order slider.
                    </p>
                  </div>

                  {/* Parameter 2: Entry Price */}
                  <div className="p-4 rounded-xl bg-[#0E1422] border border-slate-800/90 relative group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                        Live Spot Entry
                      </span>
                      <button
                        onClick={() => handleCopy('entry', String(activeTrade?.entryPrice || livePrice))}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1 text-[10px] font-mono"
                      >
                        {copiedKey === 'entry' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'entry' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="text-xl font-mono font-black text-slate-200">
                      ${(activeTrade?.entryPrice || livePrice).toLocaleString()}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Current Binance Spot reference price on Quantfury.
                    </p>
                  </div>

                  {/* Parameter 3: Target Price (Take Profit) */}
                  <div className="p-4 rounded-xl bg-gradient-to-b from-emerald-950/40 to-slate-900 border border-emerald-500/40 relative group hover:border-emerald-400/80 transition-all shadow-md shadow-emerald-950/30">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                          🎯 Target (Take Profit)
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-900/80 text-emerald-300">
                          +5.66%
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy('target', String(activeTrade?.targetPrice || (livePrice * 1.0566).toFixed(2)))}
                        className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center gap-1 text-xs font-mono font-bold shadow"
                        title="Copy Golden Target Price"
                      >
                        {copiedKey === 'target' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'target' ? 'COPIED!' : 'COPY'}</span>
                      </button>
                    </div>
                    <div className="text-2xl font-mono font-black text-emerald-300">
                      ${(activeTrade?.targetPrice || (livePrice * 1.0566)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <p className="text-[11px] text-emerald-400/80 mt-1 font-medium">
                      Enter in Quantfury &apos;Target&apos; field. Realizes +$
                      {((profile?.currentEquity || 100) * 0.215).toFixed(2)} (+21.5% balance jump).
                    </p>
                  </div>

                  {/* Parameter 4: Hard Stop Loss */}
                  <div className="p-4 rounded-xl bg-gradient-to-b from-rose-950/40 to-slate-900 border border-rose-500/40 relative group hover:border-rose-400/80 transition-all shadow-md shadow-rose-950/30">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-bold">
                          🛡️ Hard Stop Loss
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-rose-900/80 text-rose-300">
                          -3.50%
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy('stop', String(activeTrade?.stopLossPrice || (livePrice * 0.965).toFixed(2)))}
                        className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-all flex items-center gap-1 text-xs font-mono font-bold shadow"
                        title="Copy Stop Loss Price"
                      >
                        {copiedKey === 'stop' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'stop' ? 'COPIED!' : 'COPY'}</span>
                      </button>
                    </div>
                    <div className="text-2xl font-mono font-black text-rose-300">
                      ${(activeTrade?.stopLossPrice || (livePrice * 0.965)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <p className="text-[11px] text-rose-400/80 mt-1 font-medium">
                      Enter in Quantfury &apos;Stop Loss&apos; field. Caps loss at -$
                      {((profile?.currentEquity || 100) * 0.035).toFixed(2)} (-3.5% capital defense).
                    </p>
                  </div>
                </div>

                {/* Progress Meter Bar */}
                {activeTrade && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-rose-400 font-bold">
                        Stop: ${activeTrade.stopLossPrice.toLocaleString()}
                      </span>
                      <span className="text-slate-400">
                        Live Tick: <strong className="text-white">${livePrice.toLocaleString()}</strong>
                      </span>
                      <span className="text-emerald-400 font-bold">
                        Target: ${activeTrade.targetPrice.toLocaleString()}
                      </span>
                    </div>

                    <div className="relative w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      {/* Stop loss segment */}
                      <div className="absolute left-0 top-0 bottom-0 w-[20%] bg-rose-500/20 border-r border-rose-500/50" />
                      {/* Golden Target segment */}
                      <div className="absolute right-0 top-0 bottom-0 w-[25%] bg-emerald-500/20 border-l border-emerald-500/50" />
                      {/* Current Price Pin */}
                      <div
                        className="absolute top-0 bottom-0 w-2 bg-white shadow-lg rounded-full transform -translate-x-1/2 transition-all duration-500"
                        style={{
                          left: `${Math.min(
                            Math.max(
                              ((livePrice - activeTrade.stopLossPrice) /
                                (activeTrade.targetPrice - activeTrade.stopLossPrice)) *
                                100,
                              5
                            ),
                            95
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Copy Complete Bracket Snippet Button */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Exact bracket order syntax ready for your phone or notes:
                  </span>
                  <button
                    onClick={() => handleCopy('all', fullTicketSnippet)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-bold border border-slate-700 transition-all flex items-center gap-2 shadow"
                  >
                    {copiedKey === 'all' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedKey === 'all' ? 'Copied Full Ticket!' : 'Copy Full Bracket Ticket'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Quick Quantfury Order Checklist */}
            <div className="p-6 rounded-2xl bg-[#090D15] border border-slate-800/80 space-y-5">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-teal-400" />
                <h3 className="font-mono font-bold text-sm text-white uppercase tracking-wider">
                  Quantfury Checklist
                </h3>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                  <div className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700 flex items-center justify-center shrink-0 font-bold text-[10px]">
                    1
                  </div>
                  <div>
                    <strong className="text-white block">Search Asset</strong>
                    <span className="text-slate-400">Search for <code>BTC/USDT</code> on Quantfury. Tap <strong>Buy (Long)</strong>.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                  <div className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700 flex items-center justify-center shrink-0 font-bold text-[10px]">
                    2
                  </div>
                  <div>
                    <strong className="text-white block">Set Trade Amount</strong>
                    <span className="text-slate-400">Enter exactly <strong>${(profile?.currentEquity || 100).toFixed(2)}</strong>.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/50">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
                    3
                  </div>
                  <div>
                    <strong className="text-emerald-300 block">Attach Target & Stop</strong>
                    <span className="text-slate-300">
                      Tap <strong>Target</strong> and paste <code className="text-emerald-300">${(activeTrade?.targetPrice || livePrice * 1.0566).toFixed(2)}</code>.
                      Tap <strong>Stop Loss</strong> and paste <code className="text-rose-300">${(activeTrade?.stopLossPrice || livePrice * 0.965).toFixed(2)}</code>.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                  <div className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-700 flex items-center justify-center shrink-0 font-bold text-[10px]">
                    4
                  </div>
                  <div>
                    <strong className="text-white block">Submit & Relax</strong>
                    <span className="text-slate-400">
                      Confirm order. Quantfury closes the trade automatically at pure spot price with $0 fees.
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct Link to Quantfury Web */}
              <a
                href="https://trading.quantfury.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all"
              >
                <span>Open Quantfury Web Terminal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>

        {/* SECTION 2: INTERACTIVE QUANTFURY INTERFACE SIMULATOR */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider">
                2. Visual Quantfury Order Mockup
              </h2>
            </div>

            <div className="flex items-center bg-[#0C101A] p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setMockupMode('mobile')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                  mockupMode === 'mobile'
                    ? 'bg-cyan-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile App</span>
              </button>
              <button
                onClick={() => setMockupMode('web')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                  mockupMode === 'web'
                    ? 'bg-cyan-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Web Platform</span>
              </button>
            </div>
          </div>

          {/* Visual Order Screen Simulation */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#090D15] border border-slate-800 shadow-2xl flex flex-col items-center">
            {/* Phone/Device Container */}
            <div className="w-full max-w-sm bg-[#121620] border-2 border-slate-700/80 rounded-3xl p-4 shadow-2xl space-y-4 font-sans text-slate-100">
              {/* Quantfury App Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                    ₿
                  </div>
                  <div>
                    <span className="font-bold text-sm block leading-tight">BTC/USDT</span>
                    <span className="text-[10px] text-slate-400">Binance Spot Book</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-400 block leading-tight">
                    ${livePrice.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-slate-400">Zero Spread Markup</span>
                </div>
              </div>

              {/* Direction Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#0B0E17] border border-slate-800">
                <div className="py-1.5 text-center text-xs font-bold rounded-lg bg-emerald-600 text-white shadow">
                  BUY (Long)
                </div>
                <div className="py-1.5 text-center text-xs font-medium text-slate-500">
                  SELL (Short)
                </div>
              </div>

              {/* Trade Amount Slider & Input */}
              <div className="p-3 rounded-xl bg-[#0B0E17] border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Trade Size:</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    ${(profile?.currentEquity || 100).toFixed(2)}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-1/3 h-full bg-emerald-500 rounded-full" />
                </div>
                <span className="text-[9px] text-slate-500 block">
                  0% Borrowing Fees on Quantfury
                </span>
              </div>

              {/* Bracket Orders Section (Target & Stop Loss) */}
              <div className="space-y-2.5 pt-1">
                {/* Take Profit (Target) Field */}
                <div className="p-3 rounded-xl bg-[#0B0E17] border-2 border-emerald-500/60 shadow-md shadow-emerald-950/40 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <span>🎯 Target (Take Profit)</span>
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300">
                      ON
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm font-mono font-extrabold text-white">
                      ${(activeTrade?.targetPrice || livePrice * 1.0566).toFixed(2)}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      +5.66% (+${((profile?.currentEquity || 100) * 0.215).toFixed(2)})
                    </span>
                  </div>
                </div>

                {/* Stop Loss Field */}
                <div className="p-3 rounded-xl bg-[#0B0E17] border-2 border-rose-500/60 shadow-md shadow-rose-950/40 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-rose-400 flex items-center gap-1">
                      <span>🛡️ Stop Loss</span>
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-950 text-rose-300">
                      ON
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm font-mono font-extrabold text-white">
                      ${(activeTrade?.stopLossPrice || livePrice * 0.965).toFixed(2)}
                    </span>
                    <span className="text-xs font-mono font-bold text-rose-400">
                      -3.50% (-${((profile?.currentEquity || 100) * 0.035).toFixed(2)})
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Order Action */}
              <div className="pt-2">
                <div className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs text-center shadow-lg shadow-emerald-950/80">
                  Confirm Buy Order (0% Fees)
                </div>
                <span className="text-[9px] text-center text-slate-500 block mt-2">
                  Executed at real Binance spot price. Auto-closes on Target or Stop.
                </span>
              </div>
            </div>

            <p className="text-xs font-mono text-slate-400 mt-4 text-center max-w-md">
              💡 <strong>Pro Tip:</strong> Once submitted with both <em>Target</em> and <em>Stop Loss</em> toggled ON, the order runs on autonomous auto-pilot in Quantfury without needing manual monitoring.
            </p>
          </div>
        </section>

        {/* SECTION 3: THE MATHEMATICS OF ZERO-FEE COMPOUNDING */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider">
              3. The Mathematics of Zero-Fee Compounding
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fee Comparison Card */}
            <div className="p-6 rounded-2xl bg-[#090D15] border border-slate-800 space-y-4">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Broker Fee Impact on $100 → $1,000 Ladder
              </h3>

              <div className="space-y-3 font-mono text-xs">
                {/* Quantfury Row */}
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-600/50 space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-emerald-300">Quantfury Execution</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px]">
                      0.0% COMMISSIONS
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    Full +21.5% compounding retained on every step. 100% of profit goes toward your balance.
                  </p>
                  <div className="text-emerald-400 font-bold text-[11px] pt-1">
                    Outcome after 12 wins: <strong>$1,000.00+ Net Profit</strong>
                  </div>
                </div>

                {/* Binance / Bybit Row */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-300">Standard Crypto Exchanges (Binance, Bybit)</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                      0.1% TAKER + FUNDING
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Taker fees on entry/exit plus 8-hour funding rates reduce step gains from 21.5% down to ~20.8%.
                  </p>
                  <div className="text-slate-300 text-[11px] pt-1">
                    Outcome after 12 wins: <strong>~$918 (Lost ~$82 in fees)</strong>
                  </div>
                </div>

                {/* Traditional Retail Broker Row */}
                <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/40 space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-rose-300">Traditional Brokers (Coinbase, Robinhood)</span>
                    <span className="px-2 py-0.5 rounded bg-rose-900 text-rose-200 text-[10px]">
                      1.5% - 2.5% SPREAD
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Hidden spread markups devastate compounding ladders, eating ~35% of all accumulated profits.
                  </p>
                  <div className="text-rose-400 text-[11px] pt-1">
                    Outcome after 12 wins: <strong>~$620 (Lost ~$380 to spread!)</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* 12-Step Vanguard Roadmap Table */}
            <div className="p-6 rounded-2xl bg-[#090D15] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  12-Step Compounding Roadmap
                </h3>
                <span className="text-[11px] font-mono text-emerald-400 font-bold">
                  +21.5% Per Step
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto pr-1 space-y-1.5 font-mono text-xs">
                {compoundingSteps.map((s) => {
                  const isCurrent = s.step === (profile?.stepIndex ? profile.stepIndex + 1 : 1);
                  const isPassed = s.step < (profile?.stepIndex ? profile.stepIndex + 1 : 1);

                  return (
                    <div
                      key={s.step}
                      className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                        isCurrent
                          ? 'bg-emerald-950/60 border-emerald-500/80 text-white font-bold shadow-md'
                          : isPassed
                          ? 'bg-slate-900/40 border-slate-800/60 text-slate-500 line-through'
                          : 'bg-[#0B0F17] border-slate-850 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                          isCurrent ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {s.step}
                        </span>
                        <span>Stage {s.step}</span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-900 text-emerald-300 uppercase">
                            CURRENT
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-slate-400">
                          Trade: <strong>${s.startEquity.toFixed(2)}</strong>
                        </span>
                        <span className="text-emerald-400 font-bold">
                          End: ${s.endEquity.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: MOBILE ALERTS & WEBHOOK DISPATCHER */}
        <section className="p-6 sm:p-8 rounded-2xl bg-[#090D15] border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider">
                4. Instant Mobile Webhook Alerts
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Receive trade tickets directly on your phone
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 font-mono text-xs">
              <p className="text-slate-300 leading-relaxed font-sans text-sm">
                Connect a <strong>Telegram Bot</strong> or <strong>Discord Webhook</strong>. The moment the PEAK autonomous bot executes its daily trade, a push notification with exact copy-ready parameters is delivered to your phone.
              </p>

              <div className="space-y-1.5 pt-2">
                <label className="text-slate-400 uppercase text-[10px] tracking-wider block">
                  Discord / Telegram Webhook URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => handleSaveWebhook(e.target.value)}
                    placeholder="https://discord.com/api/webhooks/... or Telegram URL"
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-white text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={handleTestWebhook}
                    disabled={webhookTestStatus === 'testing'}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition-all shadow"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{webhookTestStatus === 'testing' ? 'Testing...' : 'Test Alert'}</span>
                  </button>
                </div>
                {webhookTestStatus === 'success' && (
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Alert chime played & push notification sent!
                  </span>
                )}
              </div>
            </div>

            {/* Sound & System Push Testing */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 font-mono text-xs">
              <span className="font-bold text-white block uppercase tracking-wider">
                Auditory & Browser Test Panel
              </span>

              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => playTradeCompletionAudio(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 transition-all"
                >
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span>Test Win Chime (1.618R)</span>
                </button>

                <button
                  onClick={() => playTradeCompletionAudio(false)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900 transition-all"
                >
                  <Volume2 className="w-4 h-4 text-rose-400" />
                  <span>Test Stop Chime (-3.5%)</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400">
                Audio is synthesized in real-time via the Web Audio API (no external asset dependencies).
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
