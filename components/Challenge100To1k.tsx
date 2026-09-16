'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Target,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Zap,
  RotateCcw,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Share2,
  Lock,
  Copy,
  Check,
  Flame,
  Clock,
  Download,
  Upload,
  HardDrive,
  Database,
  CheckCheck,
  Bot,
  Play,
  Pause,
  Activity,
  Percent,
  Bell,
  BellRing,
  X,
  ExternalLink,
} from 'lucide-react';
import { DipConvictionSnapshot } from '@/lib/types';
import { ActiveSimulatedTrade } from '@/lib/challenge/storage';
import {
  sendTradeCompletionNotification,
  requestNotificationPermission,
  checkNotificationPermission,
} from '@/lib/notifications/browserAlerts';

interface Challenge100To1kProps {
  btcConviction: DipConvictionSnapshot | null;
  spyConviction: DipConvictionSnapshot | null;
}

interface ChallengeStep {
  stepNumber: number;
  startBalance: number;
  targetBalance: number;
  gainDollars: number;
  gainPct: number;
  milestoneTitle?: string;
  milestoneBadge?: string;
}

// 12-Step Mathematical Golden Compounding Ladder (+21.5% net per step with 1.618R Golden Target)
const LADDER_STEPS: ChallengeStep[] = [
  { stepNumber: 1, startBalance: 100.0, targetBalance: 121.5, gainDollars: 21.5, gainPct: 21.5, milestoneTitle: 'Basecamp Launch', milestoneBadge: '🚀 Launch' },
  { stepNumber: 2, startBalance: 121.5, targetBalance: 147.62, gainDollars: 26.12, gainPct: 21.5 },
  { stepNumber: 3, startBalance: 147.62, targetBalance: 179.36, gainDollars: 31.74, gainPct: 21.5 },
  { stepNumber: 4, startBalance: 179.36, targetBalance: 217.92, gainDollars: 38.56, gainPct: 21.5, milestoneTitle: '2x Capital Doubler', milestoneBadge: '💰 2X DOUBLER' },
  { stepNumber: 5, startBalance: 217.92, targetBalance: 264.77, gainDollars: 46.85, gainPct: 21.5 },
  { stepNumber: 6, startBalance: 264.77, targetBalance: 321.7, gainDollars: 56.93, gainPct: 21.5 },
  { stepNumber: 7, startBalance: 321.7, targetBalance: 390.87, gainDollars: 69.17, gainPct: 21.5 },
  { stepNumber: 8, startBalance: 390.87, targetBalance: 474.9, gainDollars: 84.03, gainPct: 21.5, milestoneTitle: '5x Halfway Hero', milestoneBadge: '⚡ 5X HALFWAY' },
  { stepNumber: 9, startBalance: 474.9, targetBalance: 577.01, gainDollars: 102.11, gainPct: 21.5 },
  { stepNumber: 10, startBalance: 577.01, targetBalance: 701.07, gainDollars: 124.06, gainPct: 21.5 },
  { stepNumber: 11, startBalance: 701.07, targetBalance: 851.8, gainDollars: 150.73, gainPct: 21.5 },
  { stepNumber: 12, startBalance: 851.8, targetBalance: 1034.93, gainDollars: 183.13, gainPct: 21.5, milestoneTitle: '10x Institutional Legend', milestoneBadge: '🏆 10X APEX' },
];

export default function Challenge100To1k({
  btcConviction,
  spyConviction,
}: Challenge100To1kProps) {
  // State: Asset Mode ('hybrid' | 'btc' | 'spy')
  const [assetMode, setAssetMode] = useState<'hybrid' | 'btc' | 'spy'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('peak_challenge_100_to_1k_asset_mode');
      if (saved === 'btc' || saved === 'spy' || saved === 'hybrid') return saved;
    }
    return 'hybrid';
  });

  // State: current step index (0 to 11)
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('peak_challenge_100_to_1k_step');
      return saved ? Math.min(12, Math.max(0, parseInt(saved, 10))) : 0;
    }
    return 0;
  });

  const [tradeHistory, setTradeHistory] = useState<Array<{ id: number; step: number; asset: 'BTC' | 'SPY'; result: 'WIN' | 'LOSS'; balanceAfter: number; date: string }>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('peak_challenge_100_to_1k_history');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return [];
  });

  const [copied, setCopied] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'idle'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── AUTO-PILOT 1-TRADE-PER-DAY BOT STATE ───
  const [autoBotEnabled, setAutoBotEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('peak_challenge_100_to_1k_auto_bot') === 'true';
    }
    return false;
  });

  const [activeTrade, setActiveTrade] = useState<ActiveSimulatedTrade | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('peak_challenge_100_to_1k_active_trade');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return null;
  });

  const [lastTradeDate, setLastTradeDate] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('peak_challenge_100_to_1k_last_trade_date') || '';
    }
    return '';
  });

  // ─── TRADE COMPLETION EARNS/LOSSES TOAST & NOTIFICATIONS ───
  interface TradeToast {
    result: 'WIN' | 'LOSS';
    pnlDollar: number;
    pnlPct: number;
    step: number;
    newBalance: number;
    asset: 'BTC' | 'SPY';
    message: string;
  }
  const [tradeToast, setTradeToast] = useState<TradeToast | null>(null);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unsupported'>('default');

  // Check notification permission on mount
  useEffect(() => {
    setNotifPermission(checkNotificationPermission());
  }, []);

  // Auto-dismiss in-app notification toast after 8s
  useEffect(() => {
    if (!tradeToast) return;
    const timer = setTimeout(() => {
      setTradeToast(null);
    }, 8000);
    return () => clearTimeout(timer);
  }, [tradeToast]);

  const handleRequestPermission = async () => {
    const perm = await requestNotificationPermission();
    setNotifPermission(perm);
    if (perm === 'granted') {
      new Notification('🔔 PEAK Trade Alerts Active', {
        body: 'You will receive notifications showing exact earns and losses whenever a trade completes!',
        icon: '/icons/icon-192.png',
      });
    }
  };

  const [isServerLoaded, setIsServerLoaded] = useState<boolean>(false);

  const isCompleted = currentStepIndex >= 12;
  const activeStep = LADDER_STEPS[Math.min(11, currentStepIndex)];
  const currentEquity = isCompleted ? 1034.93 : activeStep.startBalance;
  const progressPct = Math.min(100, Math.round(((currentEquity - 100) / (1000 - 100)) * 100));

  // ─── TIER 2: FETCH AUTHORITATIVE PROFILE FROM POSTGRESQL / SERVER ON INITIAL LOAD ───
  useEffect(() => {
    let isMounted = true;
    async function loadServerProfile() {
      try {
        const res = await fetch('/api/challenge');
        if (!res.ok) {
          if (isMounted) setIsServerLoaded(true);
          return;
        }
        const data = await res.json();
        if (isMounted && data.success && data.profile) {
          const p = data.profile;
          setCurrentStepIndex(p.stepIndex ?? 0);
          if (p.assetMode) setAssetMode(p.assetMode);
          setTradeHistory(Array.isArray(p.tradeHistory) ? p.tradeHistory : []);
          if (p.autoBotEnabled !== undefined) setAutoBotEnabled(p.autoBotEnabled);
          setActiveTrade(p.activeTrade ?? null);
          setLastTradeDate(p.lastTradeDate || '');
          setSyncStatus('synced');
        }
      } catch (err) {
        console.warn('Initial server sync check:', err);
      } finally {
        if (isMounted) setIsServerLoaded(true);
      }
    }
    loadServerProfile();
    return () => { isMounted = false; };
  }, []);

  // ─── TIER 1 & 2 DUAL-SYNC: SYNC TO LOCALSTORAGE & SERVER API ───
  useEffect(() => {
    // Guard: Do not write back to server until authoritative database state has loaded
    if (!isServerLoaded) return;

    if (typeof window !== 'undefined') {
      localStorage.setItem('peak_challenge_100_to_1k_asset_mode', assetMode);
      localStorage.setItem('peak_challenge_100_to_1k_step', String(currentStepIndex));
      localStorage.setItem('peak_challenge_100_to_1k_history', JSON.stringify(tradeHistory));
      localStorage.setItem('peak_challenge_100_to_1k_auto_bot', String(autoBotEnabled));
      if (activeTrade) {
        localStorage.setItem('peak_challenge_100_to_1k_active_trade', JSON.stringify(activeTrade));
      } else {
        localStorage.removeItem('peak_challenge_100_to_1k_active_trade');
      }
      localStorage.setItem('peak_challenge_100_to_1k_last_trade_date', lastTradeDate);
    }

    // Auto-sync to server (PostgreSQL + Local File)
    const timeoutId = setTimeout(async () => {
      setSyncStatus('saving');
      try {
        const res = await fetch('/api/challenge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stepIndex: currentStepIndex,
            assetMode,
            tradeHistory,
            currentEquity,
            autoBotEnabled,
            activeTrade,
            lastTradeDate,
          }),
        });
        if (res.ok) {
          setSyncStatus('synced');
        }
      } catch (err) {
        console.warn('Auto-save to server error:', err);
      }
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [isServerLoaded, assetMode, currentStepIndex, tradeHistory, currentEquity, autoBotEnabled, activeTrade, lastTradeDate]);

  // Determine active asset based on mode
  const btcScore = btcConviction?.compositeScore ?? 50;
  const spyScore = spyConviction?.compositeScore ?? 50;
  const isBtcBetter = btcScore >= spyScore;

  const activeAsset: 'BTC' | 'SPY' = 
    assetMode === 'btc' ? 'BTC' :
    assetMode === 'spy' ? 'SPY' :
    (isBtcBetter ? 'BTC' : 'SPY');

  const activeConviction = activeAsset === 'BTC' ? btcConviction : spyConviction;
  const activeScore = activeAsset === 'BTC' ? btcScore : spyScore;

  const currentPrice = activeConviction?.currentPrice || (activeAsset === 'BTC' ? 88500 : 578);
  const stopLossPrice = Number((currentPrice * 0.965).toFixed(2)); // -3.5% hard stop distance
  const targetPrice = Number((currentPrice * 1.0566).toFixed(2)); // 1.618R Golden Target (+5.66%)

  const todayStr = new Date().toISOString().slice(0, 10);

  // Real-time live price tracking for the active simulated trade
  const livePrice = activeTrade 
    ? (activeTrade.asset === 'BTC' ? (btcConviction?.currentPrice || currentPrice) : (spyConviction?.currentPrice || currentPrice))
    : currentPrice;

  const unrealizedPnlPct = activeTrade && activeTrade.entryPrice > 0
    ? ((livePrice - activeTrade.entryPrice) / activeTrade.entryPrice) * 100
    : 0;

  const unrealizedDollarGain = currentEquity * (unrealizedPnlPct / 100);

  // Handle Win (Step Up with exact Earns notification)
  const handleLogWin = (assetUsed?: 'BTC' | 'SPY', customPnl?: { dollar: number; pct: number }) => {
    if (currentStepIndex < 12) {
      const nextStep = currentStepIndex + 1;
      const newBal = nextStep >= 12 ? 1034.93 : LADDER_STEPS[nextStep].startBalance;
      const asset = assetUsed || activeTrade?.asset || activeAsset;
      const stepCompleted = currentStepIndex + 1;
      const earnedDollar = customPnl ? customPnl.dollar : LADDER_STEPS[currentStepIndex].gainDollars;
      const earnedPct = customPnl ? customPnl.pct : LADDER_STEPS[currentStepIndex].gainPct;

      setCurrentStepIndex(nextStep);
      setTradeHistory((prev) => [
        { id: Date.now(), step: stepCompleted, asset, result: 'WIN', balanceAfter: newBal, date: new Date().toLocaleDateString() },
        ...prev,
      ]);

      // 🔔 Dispatch Browser Push Notification showing exact Earns
      sendTradeCompletionNotification({
        asset,
        result: 'WIN',
        step: stepCompleted,
        pnlDollar: earnedDollar,
        pnlPct: earnedPct,
        newBalance: newBal,
      }).catch(() => {});

      // 🔔 Trigger floating in-app Toast Notification
      setTradeToast({
        result: 'WIN',
        pnlDollar: earnedDollar,
        pnlPct: earnedPct,
        step: stepCompleted,
        newBalance: newBal,
        asset,
        message: `1.618R Target Hit! Compounded account to $${newBal.toFixed(2)} (+${earnedPct.toFixed(1)}%)`,
      });
    }
  };

  // Handle Loss (Step Down with exact Loss notification and capital cushion)
  const handleLogLoss = (assetUsed?: 'BTC' | 'SPY', customPnl?: { dollar: number; pct: number }) => {
    const asset = assetUsed || activeTrade?.asset || activeAsset;
    const stepLost = currentStepIndex + 1;
    const lossPct = customPnl ? customPnl.pct : (activeTrade?.stopLossPct || 3.5);
    const lossDollar = customPnl ? customPnl.dollar : (currentEquity * (lossPct / 100));

    if (currentStepIndex > 0) {
      const prevStep = Math.max(0, currentStepIndex - 1);
      const newBal = Number((LADDER_STEPS[prevStep].startBalance).toFixed(2));

      setCurrentStepIndex(prevStep);
      setTradeHistory((prev) => [
        { id: Date.now(), step: stepLost, asset, result: 'LOSS', balanceAfter: newBal, date: new Date().toLocaleDateString() },
        ...prev,
      ]);

      sendTradeCompletionNotification({
        asset,
        result: 'LOSS',
        step: stepLost,
        pnlDollar: lossDollar,
        pnlPct: lossPct,
        newBalance: newBal,
      }).catch(() => {});

      setTradeToast({
        result: 'LOSS',
        pnlDollar: lossDollar,
        pnlPct: lossPct,
        step: stepLost,
        newBalance: newBal,
        asset,
        message: `Stop Loss Hit (-${lossPct.toFixed(1)}%). Capital preserved at $${newBal.toFixed(2)}`,
      });
    } else {
      // If at Step 1, deduct loss from initial $100 capital
      const newBal = Number(Math.max(10, currentEquity - lossDollar).toFixed(2));
      setTradeHistory((prev) => [
        { id: Date.now(), step: 1, asset, result: 'LOSS', balanceAfter: newBal, date: new Date().toLocaleDateString() },
        ...prev,
      ]);

      sendTradeCompletionNotification({
        asset,
        result: 'LOSS',
        step: 1,
        pnlDollar: lossDollar,
        pnlPct: lossPct,
        newBalance: newBal,
      }).catch(() => {});

      setTradeToast({
        result: 'LOSS',
        pnlDollar: lossDollar,
        pnlPct: lossPct,
        step: 1,
        newBalance: newBal,
        asset,
        message: `Stop Loss Hit (-${lossPct.toFixed(1)}%). Capital preserved at $${newBal.toFixed(2)}`,
      });
    }
  };

  // ─── BOT SIMULATOR: OPEN 1 TRADE FOR TODAY ───
  const handleOpenDailyTrade = (force = false) => {
    if (isCompleted) return;
    if (!force && lastTradeDate === todayStr) return;

    const entry = currentPrice;
    const targetPct = 5.66; // 1.618R Golden Target (+5.66%)
    const stopLossPct = 3.5; // -3.5% hard stop
    const target = Number((entry * (1 + targetPct / 100)).toFixed(2));
    const stop = Number((entry * (1 - stopLossPct / 100)).toFixed(2));

    const newTrade: ActiveSimulatedTrade = {
      id: Date.now(),
      date: todayStr,
      asset: activeAsset,
      step: currentStepIndex + 1,
      entryPrice: entry,
      targetPrice: target,
      stopLossPrice: stop,
      targetPct,
      stopLossPct,
      openTime: Date.now(),
      status: 'OPEN',
    };

    setActiveTrade(newTrade);
  };

  // Auto-open daily trade when autoBotEnabled is ON and no trade open today
  useEffect(() => {
    if (autoBotEnabled && !activeTrade && lastTradeDate !== todayStr && !isCompleted && currentPrice > 0) {
      handleOpenDailyTrade(false);
    }
  }, [autoBotEnabled, activeTrade, lastTradeDate, isCompleted, todayStr, currentPrice]);

  // Real-time resolution: auto-trigger ONLY when real verified market tick touches Target or Stop Loss
  useEffect(() => {
    if (!autoBotEnabled || !activeTrade || activeTrade.status !== 'OPEN') return;

    // Strict Real-Market Guard: Validate price sanity before checking bounds
    const isBtcAsset = activeTrade.asset === 'BTC';
    if (!livePrice || isNaN(livePrice) || (isBtcAsset && livePrice < 10000) || (!isBtcAsset && livePrice < 50)) {
      return;
    }
    if (!activeTrade.entryPrice || activeTrade.entryPrice <= 0) return;
    if (!activeTrade.targetPrice || activeTrade.targetPrice <= activeTrade.entryPrice) return;
    if (!activeTrade.stopLossPrice || activeTrade.stopLossPrice >= activeTrade.entryPrice) return;

    // Real Golden Target Hit (Organic Market Expansion)
    if (livePrice >= activeTrade.targetPrice) {
      handleLogWin(activeTrade.asset);
      setActiveTrade(null);
      setLastTradeDate(todayStr);
    } 
    // Real Hard Stop Hit (Organic Market Drawdown)
    else if (livePrice <= activeTrade.stopLossPrice) {
      handleLogLoss(activeTrade.asset);
      setActiveTrade(null);
      setLastTradeDate(todayStr);
    }
  }, [livePrice, autoBotEnabled, activeTrade, todayStr]);

  // Close at live market price with explicit confirmation
  const handleCloseAtLivePrice = () => {
    if (!activeTrade) return;
    const absDollar = Math.abs(unrealizedDollarGain);
    const absPct = Math.abs(unrealizedPnlPct);
    const isGain = unrealizedPnlPct >= 0;

    if (
      confirm(
        `Are you sure you want to close this trade at the live market spot price of $${livePrice.toLocaleString()}?\n\nRealized PnL: ${
          isGain ? '+' : '-'
        }$${absDollar.toFixed(2)} (${isGain ? '+' : '-'}${absPct.toFixed(2)}%)`
      )
    ) {
      if (isGain) {
        handleLogWin(activeTrade.asset, { dollar: absDollar, pct: absPct });
      } else {
        handleLogLoss(activeTrade.asset, { dollar: absDollar, pct: absPct });
      }
      setActiveTrade(null);
      setLastTradeDate(todayStr);
    }
  };

  const handleResetChallenge = () => {
    if (confirm('Restart the $100 → $1k Challenge back to Step 1 ($100.00)?')) {
      setCurrentStepIndex(0);
      setTradeHistory([]);
      setActiveTrade(null);
      setLastTradeDate('');
      localStorage.removeItem('peak_challenge_100_to_1k_step');
      localStorage.removeItem('peak_challenge_100_to_1k_history');
      localStorage.removeItem('peak_challenge_100_to_1k_active_trade');
      localStorage.removeItem('peak_challenge_100_to_1k_last_trade_date');
      fetch('/api/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepIndex: 0,
          assetMode: 'hybrid',
          tradeHistory: [],
          currentEquity: 100.0,
          autoBotEnabled,
          activeTrade: null,
          lastTradeDate: '',
        }),
      }).catch(() => {});
    }
  };

  // ─── TIER 3: USER-CONTROLLED 1-CLICK EXPORT / IMPORT BACKUP ───
  const handleExportBackup = () => {
    const backupData = {
      version: 1,
      appName: 'PEAK Dip Hunter',
      challenge: '$100 to $1,000 Compounding Ladder',
      exportedAt: new Date().toISOString(),
      stepIndex: currentStepIndex,
      currentStep: currentStepIndex + 1,
      currentEquity,
      assetMode,
      tradeHistory,
      autoBotEnabled,
      activeTrade,
      lastTradeDate,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `peak_100_to_1k_backup_step${currentStepIndex + 1}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        if (typeof parsed.stepIndex === 'number') {
          const newStep = Math.min(12, Math.max(0, parsed.stepIndex));
          const newMode = (parsed.assetMode === 'btc' || parsed.assetMode === 'spy') ? parsed.assetMode : 'hybrid';
          const newHistory = Array.isArray(parsed.tradeHistory) ? parsed.tradeHistory : [];

          setCurrentStepIndex(newStep);
          setAssetMode(newMode);
          setTradeHistory(newHistory);
          if (typeof parsed.autoBotEnabled === 'boolean') setAutoBotEnabled(parsed.autoBotEnabled);
          if (parsed.activeTrade !== undefined) setActiveTrade(parsed.activeTrade);
          if (typeof parsed.lastTradeDate === 'string') setLastTradeDate(parsed.lastTradeDate);

          alert(`✅ Challenge restored successfully! Loaded Step ${newStep + 1} with ${newHistory.length} logged trades.`);
        } else {
          alert('Invalid backup file structure.');
        }
      } catch (err) {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
    // Reset file input value so same file can be chosen again if needed
    e.target.value = '';
  };

  const handleShareCard = () => {
    const modeLabel = assetMode === 'hybrid' ? `Hybrid Vanguard (${activeAsset})` : activeAsset === 'BTC' ? 'Bitcoin (BTC)' : 'S&P 500 (SPY)';
    const text = `🎯 PEAK $100 → $1,000 Challenge Update:\nCurrently on Step ${currentStepIndex + 1}/12 ($${currentEquity.toFixed(2)} equity).\nActive Instrument: ${modeLabel}.\nScaling via the Golden Ratio (1.618R) Dip Engine on peakdip.com! 🚀`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="tactile-card p-4 sm:p-7 space-y-6 overflow-hidden relative">
      {/* ─── HEADER BAR ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-[#2a2d36] to-[#181920] border border-white/10 border-t-white/20 shadow-lg shadow-black/60 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5 text-[#f5e098] drop-shadow-[0_0_8px_rgba(245,224,152,0.4)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm sm:text-base font-black text-white uppercase tracking-wider">
                THE $100 → $1,000 HYBRID VANGUARD CHALLENGE
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest bg-amber-500/10 text-[#f5e098] border border-amber-500/20 shadow-sm">
                12-Step Ladder
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Turn $100 into $1,000 across 12 high-conviction trades using Golden Ratio (1.618R) compounding.
            </p>
          </div>
        </div>

        {/* Header Controls: Sync status, Backup/Restore, Share, Reset */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sync Status Badge */}
          <div className="tactile-well flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono text-slate-400">
            {syncStatus === 'saving' ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-300 font-semibold">Syncing...</span>
              </>
            ) : syncStatus === 'synced' ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-emerald-400 font-bold">Auto-Saved</span>
              </>
            ) : (
              <>
                <HardDrive className="w-3 h-3 text-slate-500" />
                <span>Ready</span>
              </>
            )}
          </div>

          {/* Hidden File Input for Restore */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            onChange={handleImportBackup}
            className="hidden"
          />

          {/* 1-Click Export Backup */}
          <button
            onClick={handleExportBackup}
            className="tactile-squircle flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono font-bold text-slate-300 hover:text-white"
            title="Download JSON backup file to keep on your drive"
          >
            <Download className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">Backup</span>
          </button>

          {/* 1-Click Restore Backup */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="tactile-squircle flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono font-bold text-slate-300 hover:text-white"
            title="Upload and restore a previous JSON backup"
          >
            <Upload className="w-3 h-3 text-purple-400" />
            <span className="hidden sm:inline">Restore</span>
          </button>

          {/* Share Milestone */}
          <button
            onClick={handleShareCard}
            className="tactile-squircle flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-slate-300 hover:text-white"
            title="Copy social progress card"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-amber-400" />}
            <span>{copied ? 'Copied!' : 'Share'}</span>
          </button>

          {/* Reset */}
          <button
            onClick={handleResetChallenge}
            className="tactile-squircle p-2 text-slate-400 hover:text-rose-300"
            title="Reset Challenge to Step 1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ─── SHAKURO VIRTUAL PORTFOLIO CARD (CRYFORGE METALLIC CARD) ─── */}
      <div className="metallic-card p-6 sm:p-7 relative overflow-hidden shadow-2xl text-white">
        {/* Ambient glow highlight */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-500/15 via-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-white/20 to-white/5 border border-white/25 flex items-center justify-center shadow-inner">
              <Sparkles className="w-4 h-4 text-[#f5e098]" />
            </div>
            <span className="font-mono font-black text-sm tracking-[0.25em] text-white uppercase">
              PEAK VANGUARD
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-[9px] font-mono font-black uppercase tracking-widest border ${
              autoBotEnabled 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-[0_0_12px_rgba(52,211,153,0.3)]' 
                : 'bg-white/5 text-slate-400 border-white/10'
            }`}>
              {autoBotEnabled ? '● 24/7 ACTIVE' : 'STANDBY'}
            </span>
          </div>
        </div>

        {/* Card Center: Available Balance & Compounding Goal */}
        <div className="my-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
              AVAILABLE CAPITAL
            </span>
            <div className="flex items-baseline gap-2.5">
              <span className="font-mono text-3xl sm:text-4xl font-black text-white tracking-tight">
                ${currentEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-mono text-slate-400">
                / $1,000.00 GOAL
              </span>
            </div>
          </div>

          {/* Shakuro Champagne Gold Badge */}
          <div className="flex items-center gap-2">
            <span className="gold-pill font-mono text-xs font-bold tracking-tight">
              {progressPct}% COMPLETED
            </span>
          </div>
        </div>

        {/* Masked Card Number & Compounding Formula */}
        <div className="pt-4 flex items-center justify-between font-mono text-xs text-slate-400 border-t border-white/[0.08]">
          <span className="tracking-[0.3em] font-medium text-slate-300 text-[11px] sm:text-xs">
            STEP {String(currentStepIndex + 1).padStart(2, '0')} •••• •••• 1000
          </span>
          <span className="text-[10px] tracking-wider text-slate-400 uppercase font-semibold">
            EXP: ~60 DAYS • 1.618R GOLDEN RATIO
          </span>
        </div>
      </div>

      {/* Shakuro Quick Action Pills (Below Card) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
        <div className="tactile-card-flat p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center text-sm font-bold shadow-inner">
              ↙
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block">STEP TARGET (+21.5%)</span>
              <span className="text-sm font-black text-emerald-400">${activeStep.targetBalance.toFixed(2)}</span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/30">
            +${activeStep.gainDollars.toFixed(2)}
          </span>
        </div>

        <div className="tactile-card-flat p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center text-sm font-bold shadow-inner">
              ↗
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block">HARD STOP (-3.5%)</span>
              <span className="text-sm font-black text-rose-400">${(currentEquity * 0.965).toFixed(2)}</span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-rose-400 bg-rose-950/40 px-2.5 py-1 rounded-full border border-rose-500/30">
            -${(currentEquity * 0.035).toFixed(2)}
          </span>
        </div>
      </div>

      {/* ─── LIVE PROGRESS BAR & MILESTONES ─── */}
      <div className="tactile-well p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between text-xs font-mono gap-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Current Stage:</span>
            <strong className="text-white">{isCompleted ? '12/12 (COMPLETED)' : `Step ${currentStepIndex + 1} of 12`}</strong>
          </div>
          <span className="text-[#f5e098] font-bold">{progressPct}% Complete</span>
        </div>

        {/* Multi-segmented Progress Bar */}
        <div className="w-full h-3 rounded-full bg-[#08090b] border border-white/[0.05] shadow-inner overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-[#f5e098] to-emerald-400 transition-all duration-500 rounded-full shadow-[0_0_12px_rgba(245,224,152,0.5)]"
            style={{ width: `${Math.max(4, progressPct)}%` }}
          />
        </div>

        {/* Milestone Pinpoints */}
        <div className="grid grid-cols-4 gap-2 pt-1 text-center font-mono">
          <div className={`p-2 rounded-xl border text-[10px] transition-all ${currentStepIndex >= 0 ? 'bg-amber-500/10 border-amber-500/30 text-[#f5e098]' : 'bg-black/20 border-white/5 text-slate-500'}`}>
            <span className="block font-bold">$100</span>
            <span className="text-[8px] opacity-75">Basecamp</span>
          </div>
          <div className={`p-2 rounded-xl border text-[10px] transition-all ${currentStepIndex >= 3 ? 'bg-amber-500/10 border-amber-500/30 text-[#f5e098]' : 'bg-black/20 border-white/5 text-slate-500'}`}>
            <span className="block font-bold">$217</span>
            <span className="text-[8px] opacity-75">2X Doubler</span>
          </div>
          <div className={`p-2 rounded-xl border text-[10px] transition-all ${currentStepIndex >= 7 ? 'bg-amber-500/10 border-amber-500/30 text-[#f5e098]' : 'bg-black/20 border-white/5 text-slate-500'}`}>
            <span className="block font-bold">$474</span>
            <span className="text-[8px] opacity-75">5X Halfway</span>
          </div>
          <div className={`p-2 rounded-xl border text-[10px] transition-all ${currentStepIndex >= 11 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-black/20 border-white/5 text-slate-500'}`}>
            <span className="block font-bold">$1,034</span>
            <span className="text-[8px] opacity-75">10X Legend</span>
          </div>
        </div>
      </div>

      {/* ─── ASSET SELECTION CONTROLLER: HYBRID vs CRYPTO vs S&P 500 ─── */}
      <div className="tactile-well p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-bold">
              ASSET ENGINE ROUTING:
            </span>
            <span className="text-xs font-mono font-bold text-[#f5e098]">
              {assetMode === 'hybrid' ? '🌐 Hybrid Vanguard (Auto Highest Conviction)' : assetMode === 'btc' ? '₿ Bitcoin Locked' : '📈 S&P 500 Locked'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Switch anytime — balance and ladder step remain saved.
          </span>
        </div>

        {/* Tactile Segmented Switcher */}
        <div className="tactile-pill-track grid grid-cols-1 sm:grid-cols-3 gap-1.5 p-1">
          {/* Hybrid Tab */}
          <button
            onClick={() => setAssetMode('hybrid')}
            className={`p-3 rounded-2xl text-left transition-all font-mono ${
              assetMode === 'hybrid'
                ? 'tactile-pill-active border-t border-white/25 shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold flex items-center gap-1.5">
                🌐 Hybrid Vanguard
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-[#f5e098] font-bold">
                AUTO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Auto-picks: <strong className="text-emerald-400">{isBtcBetter ? `BTC (${btcScore})` : `SPY (${spyScore})`}</strong>
            </p>
          </button>

          {/* Bitcoin Tab */}
          <button
            onClick={() => setAssetMode('btc')}
            className={`p-3 rounded-2xl text-left transition-all font-mono ${
              assetMode === 'btc'
                ? 'tactile-pill-active border-t border-white/25 shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold flex items-center gap-1.5 text-amber-400">
                ₿ Bitcoin (BTC)
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-slate-300">
                CRYPTO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Score: <strong className="text-white">{btcScore}/100</strong> • 24/7 Liquidity
            </p>
          </button>

          {/* S&P 500 Tab */}
          <button
            onClick={() => setAssetMode('spy')}
            className={`p-3 rounded-2xl text-left transition-all font-mono ${
              assetMode === 'spy'
                ? 'tactile-pill-active border-t border-white/25 shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold flex items-center gap-1.5 text-cyan-400">
                📈 S&P 500 (SPY)
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-slate-300">
                INDEX ETF
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Score: <strong className="text-white">{spyScore}/100</strong> • Macro Index
            </p>
          </button>
        </div>
      </div>

      {/* ─── BOT SIMULATOR: 1-TRADE-PER-DAY REAL-TIME AUTO-PILOT COCKPIT ─── */}
      <div className={`p-5 sm:p-6 rounded-3xl border transition-all duration-300 ${
        autoBotEnabled 
          ? 'tactile-card border-emerald-500/30 shadow-2xl' 
          : 'tactile-card-flat border-white/[0.06]'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
              autoBotEnabled 
                ? 'bg-emerald-950/80 border-emerald-500/60 shadow-lg shadow-emerald-950/80 text-emerald-400' 
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}>
              <Bot className={`w-5 h-5 ${autoBotEnabled ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-mono font-black text-white tracking-wide flex items-center gap-2">
                  PEAK AUTO-PILOT DAILY BOT
                </h3>
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-widest border ${
                  autoBotEnabled 
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-600/70 shadow-sm' 
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}>
                  {autoBotEnabled ? '● LIVE REAL-TIME' : 'STANDBY'}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-950/60 text-amber-300 border border-amber-800/60">
                  1 TRADE / DAY
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                {autoBotEnabled
                  ? activeTrade
                    ? `Tracking active ${activeTrade.asset} trade against live ticks • Auto TP (+5.66%) & SL (-3.5%) active`
                    : lastTradeDate === todayStr
                    ? `Today's trade completed. Enforcing 1-trade-per-day rule until 00:00 UTC.`
                    : `Scanning markets for today's optimal setup at live spot price...`
                  : 'Automate your 12-step ladder: executes 1 live simulated trade per day at current spot prices.'}
              </p>
            </div>
          </div>

          {/* Notification Alert & Toggle Switch */}
          <div className="flex flex-wrap items-center gap-2">
            {notifPermission === 'granted' ? (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950/60 border border-emerald-600/50 text-[11px] font-mono text-emerald-300">
                <BellRing className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="hidden sm:inline">Earns & Losses Alerts: ON</span>
              </div>
            ) : (
              <button
                onClick={handleRequestPermission}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-amber-600/50 text-[11px] font-mono font-bold text-amber-300 transition-all shadow-sm"
                title="Enable browser push notifications to see earns and losses when trades finish"
              >
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>Enable Alerts</span>
              </button>
            )}

            <Link
              href="/quantfury"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/50 text-[11px] font-mono font-bold text-emerald-300 transition-all shadow-sm"
              title="Open Quantfury Execution Hub & Mirror active trade parameters"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              <span>Quantfury Hub</span>
            </Link>

            <button
              onClick={() => {
                const nextState = !autoBotEnabled;
                setAutoBotEnabled(nextState);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 border ${
                autoBotEnabled
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-emerald-400/50 shadow-lg shadow-emerald-950/60'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${autoBotEnabled ? 'fill-white' : ''}`} />
              <span>{autoBotEnabled ? 'Auto-Pilot: ACTIVE' : 'Enable Auto-Pilot'}</span>
            </button>
          </div>
        </div>

        {/* Bot Body */}
        {autoBotEnabled ? (
          <div className="pt-4 space-y-4">
            {activeTrade ? (
              /* ACTIVE LIVE REAL-TIME TRADE HUD */
              <div className="p-4 rounded-xl bg-[#090D15] border border-emerald-500/40 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-mono font-bold text-white uppercase">
                      Active Live Trade: {activeTrade.asset === 'BTC' ? '₿ Bitcoin (BTC/USDT)' : '📈 S&P 500 (SPY)'}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      Step {activeTrade.step}
                    </span>
                  </div>

                  {/* Actions & Real-time Unrealized PnL Pill */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href="/quantfury"
                      className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-md shadow-emerald-950/60"
                      title="Open 1-Click Quantfury Bracket Order Ticket"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Mirror on Quantfury</span>
                    </Link>

                    <div className={`flex items-center gap-2 px-3 py-1 rounded-xl font-mono text-xs font-bold border ${
                      unrealizedPnlPct >= 0 
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80 shadow-md shadow-emerald-950/60' 
                        : 'bg-rose-950/80 text-rose-300 border-rose-700/80 shadow-md shadow-rose-950/60'
                    }`}>
                      <Activity className="w-3.5 h-3.5 animate-pulse" />
                      <span>Live PnL:</span>
                      <span className="text-sm font-black">
                        {unrealizedPnlPct >= 0 ? '+' : ''}${unrealizedDollarGain.toFixed(2)} ({unrealizedPnlPct >= 0 ? '+' : ''}{unrealizedPnlPct.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Key Price Indicators Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Entry Spot Price</span>
                    <span className="font-bold text-slate-200">${activeTrade.entryPrice.toLocaleString()}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-emerald-900/40">
                    <span className="text-[10px] text-emerald-400 block uppercase">Live Market Price</span>
                    <span className="font-black text-white flex items-center gap-1">
                      ${livePrice.toLocaleString()}
                      {unrealizedPnlPct >= 0 ? <TrendingUp className="w-3 h-3 text-emerald-400 inline" /> : <TrendingDown className="w-3 h-3 text-rose-400 inline" />}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-amber-900/40">
                    <span className="text-[10px] text-amber-400 block uppercase">Golden Target (1.618R)</span>
                    <span className="font-bold text-amber-300">${activeTrade.targetPrice.toLocaleString()} (+5.66%)</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-rose-900/40">
                    <span className="text-[10px] text-rose-400 block uppercase">Hard Stop-Loss</span>
                    <span className="font-bold text-rose-300">${activeTrade.stopLossPrice.toLocaleString()} (-3.50%)</span>
                  </div>
                </div>

                {/* Real-time Target Meter Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span className="text-rose-400">Stop Loss: ${activeTrade.stopLossPrice.toLocaleString()} (-3.5%)</span>
                    <span className="text-slate-400">Entry: ${activeTrade.entryPrice.toLocaleString()}</span>
                    <span className="text-amber-400 font-bold">1.618R Target: ${activeTrade.targetPrice.toLocaleString()} (+5.66%)</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-900 border border-slate-800 overflow-hidden relative">
                    {/* Zero line marker */}
                    <div className="absolute top-0 bottom-0 left-[38.2%] w-0.5 bg-slate-600 z-10" title="Entry Price" />
                    {/* Progress Fill */}
                    {(() => {
                      const totalRange = (activeTrade.targetPct || 5.66) + (activeTrade.stopLossPct || 3.5);
                      const currentPos = Math.max(0, Math.min(totalRange, unrealizedPnlPct + (activeTrade.stopLossPct || 3.5)));
                      const fillPct = Math.round((currentPos / totalRange) * 100);
                      return (
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${
                            unrealizedPnlPct >= 0 
                              ? 'bg-gradient-to-r from-emerald-500 to-amber-400' 
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.max(3, Math.min(100, fillPct))}%` }}
                        />
                      );
                    })()}
                  </div>
                </div>

                {/* Strict Real-Time Market Execution Bar (No Fake Simulation Triggers) */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-emerald-400 font-bold">
                      Strict Real-Market Guard Active:
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Resolves solely when live spot tick crosses Target (${activeTrade.targetPrice.toLocaleString()}) or Stop (${activeTrade.stopLossPrice.toLocaleString()}).
                    </span>
                  </div>

                  <button
                    onClick={handleCloseAtLivePrice}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold border border-slate-700 transition-all flex items-center gap-1.5 shadow-sm"
                    title="Liquidate position at current verified market price"
                  >
                    <span>Close at Market Spot (${livePrice.toLocaleString()})</span>
                  </button>
                </div>
              </div>
            ) : lastTradeDate === todayStr ? (
              /* TODAY'S TRADE ALREADY COMPLETED (1/1) */
              <div className="p-4 rounded-xl bg-[#090D15] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        Today's 1-Trade-Per-Day Quota Completed
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        1/1 DONE
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      The bot takes exactly 1 trade per day to enforce capital discipline. Next daily session opens at 00:00 UTC.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenDailyTrade(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-amber-600/40 transition-all shrink-0 flex items-center gap-1.5"
                  title="Force an additional simulated trade today for testing"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Force Test Trade Now</span>
                </button>
              </div>
            ) : (
              /* WAITING TO EXECUTE TODAY'S TRADE */
              <div className="p-4 rounded-xl bg-[#090D15] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-700 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Ready to Open Today's Trade: {activeAsset === 'BTC' ? '₿ Bitcoin' : '📈 S&P 500'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Live Spot: ${currentPrice.toLocaleString()} • Conviction Score: {activeScore}/100
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenDailyTrade(false)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold border border-emerald-400/50 shadow-lg shadow-emerald-950/60 transition-all flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Execute Today's Trade (Live Spot)</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* COLLAPSED INFO WHEN AUTOBOT IS OFF */
          <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Auto-Pilot is currently disabled.</span>
              <span>Turn on to let the bot simulate exactly 1 live trade per day using real-time prices.</span>
            </div>
            <button
              onClick={() => handleOpenDailyTrade(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all flex items-center gap-1 text-[11px]"
            >
              <span>Test 1-Trade Simulation Manually →</span>
            </button>
          </div>
        )}
      </div>

      {/* ─── ACTIVE TRADE TICKET: THE NEXT STEP DIRECTIVE ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Active Trade Directive Ticket */}
        <div className="lg:col-span-7 p-4 sm:p-5 rounded-xl bg-[#06080E] border border-slate-800/80 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/70">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase bg-emerald-950 text-emerald-300 border border-emerald-700">
                STEP {activeStep.stepNumber} MISSION
              </span>
              <span className="text-xs font-mono text-white font-bold">
                Target: ${activeStep.targetBalance.toFixed(2)} (+${activeStep.gainDollars.toFixed(2)})
              </span>
            </div>

            {/* Active Asset Badge */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-slate-400">Active Instrument:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                activeAsset === 'BTC' 
                  ? 'bg-amber-950/60 text-amber-300 border-amber-700/60' 
                  : 'bg-cyan-950/60 text-cyan-300 border-cyan-700/60'
              }`}>
                {activeAsset === 'BTC' ? '₿ Bitcoin (BTC/USDT)' : '📈 S&P 500 (SPY ETF)'}
              </span>
            </div>
          </div>

          {/* Actionable Ticket Parameters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono">
            <div className="p-3 rounded-xl bg-[#0B0F17] border border-slate-800">
              <span className="text-[9px] uppercase text-slate-400 block mb-1">Trade Capital</span>
              <div className="text-base font-black text-white">
                ${activeStep.startBalance.toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">100% Spot Allocation</span>
            </div>

            <div className="p-3 rounded-xl bg-[#0B0F17] border border-rose-900/50">
              <span className="text-[9px] uppercase text-rose-400 block mb-1">Max Risk Stop (-3.5%)</span>
              <div className="text-base font-black text-rose-300">
                ${(activeStep.startBalance * 0.035).toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Exit if drop &gt; 3.5%</span>
            </div>

            <div className="p-3 rounded-xl bg-gradient-to-b from-amber-950/40 to-[#0B0F17] border border-amber-500/60">
              <span className="text-[9px] uppercase text-amber-300 font-bold block mb-1">
                Golden Target (1.618R)
              </span>
              <div className="text-base font-black text-amber-300">
                +${activeStep.gainDollars.toFixed(2)}
              </div>
              <span className="text-[10px] text-amber-400 mt-0.5 block">+21.5% Target Return</span>
            </div>
          </div>

          {/* Asset-Specific Execution Guidance */}
          <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="flex flex-wrap items-center justify-between text-[11px] font-mono gap-1">
              <span className="text-slate-400">Target Instrument:</span>
              <span className="font-bold text-white">
                {activeAsset === 'BTC' ? 'Bitcoin Spot (Binance / Bybit / Kraken / Coinbase)' : 'S&P 500 Fractional / 2x SSO (Robinhood / IBKR / Schwab)'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                <span className="text-slate-500 block text-[9px] uppercase">Est. Entry Price</span>
                <span className="text-white font-bold">${currentPrice.toLocaleString()}</span>
              </div>
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                <span className="text-slate-500 block text-[9px] uppercase">Composite Conviction</span>
                <span className={activeScore >= 70 ? 'text-emerald-400 font-bold' : activeScore >= 50 ? 'text-amber-400 font-bold' : 'text-slate-400 font-bold'}>
                  {activeScore}/100 {activeScore >= 70 ? '(Prime Dip Zone)' : '(Patience / Waiting)'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
              <strong>Execution Blueprint:</strong> Buy ${activeStep.startBalance.toFixed(2)} of {activeAsset === 'BTC' ? 'Bitcoin (BTC)' : 'SPY fractional shares'} when capitulation score &ge; 70. Place your hard stop-loss at ${stopLossPrice.toLocaleString()} (-3.5%) and set your Golden limit order at ${targetPrice.toLocaleString()} (+5.66% spot move).
            </p>
          </div>

          {/* Step Up / Step Down Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => handleLogWin()}
              disabled={isCompleted}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Log Step {activeStep.stepNumber} Win on {activeAsset} (+${activeStep.gainDollars.toFixed(2)}) →</span>
            </button>
            <button
              onClick={() => handleLogLoss()}
              disabled={currentStepIndex === 0}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-300 text-xs font-mono font-bold transition-all border border-slate-700 disabled:opacity-40"
            >
              Log Stop-Out (-3.5%)
            </button>
          </div>

          {/* Recent Trades Tagged with Asset */}
          {tradeHistory.length > 0 && (
            <div className="pt-2 border-t border-slate-800/60">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block mb-1.5">
                Recent Challenge Log ({tradeHistory.length} trades):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {tradeHistory.slice(0, 5).map((trade) => (
                  <span
                    key={trade.id}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono border flex items-center gap-1 ${
                      trade.result === 'WIN'
                        ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/60'
                        : 'bg-rose-950/50 text-rose-300 border-rose-800/60'
                    }`}
                  >
                    <strong>Step {trade.step}</strong>
                    <span className="opacity-75">[{trade.asset}]</span>
                    <span>{trade.result}</span>
                    <span className="font-bold text-white">${trade.balanceAfter.toFixed(0)}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: The 12-Step Compounding Ladder Table */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-[#06080E] border border-slate-800/80 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <span className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider">
                The 12-Stage Ladder Map
              </span>
              <span className="text-[10px] font-mono text-slate-400">Plausible: 45–60 Days</span>
            </div>

            {/* Scrollable list of 12 steps */}
            <div className="mt-2 space-y-1 max-h-[260px] overflow-y-auto pr-1">
              {LADDER_STEPS.map((step) => {
                const isCurrent = step.stepNumber === currentStepIndex + 1;
                const isDone = step.stepNumber < currentStepIndex + 1;

                return (
                  <div
                    key={step.stepNumber}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center justify-between transition-all ${
                      isCurrent
                        ? 'bg-amber-950/70 border border-amber-500 text-amber-200 shadow-md'
                        : isDone
                        ? 'bg-emerald-950/30 text-emerald-400/80 border border-emerald-900/30'
                        : 'text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-4 text-center font-bold ${isDone ? 'text-emerald-400' : isCurrent ? 'text-amber-400' : 'text-slate-600'}`}>
                        {isDone ? '✓' : step.stepNumber}
                      </span>
                      <span>${step.startBalance.toFixed(2)} → <strong className="text-white">${step.targetBalance.toFixed(2)}</strong></span>
                    </div>

                    {step.milestoneBadge && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-200 font-bold border border-slate-700">
                        {step.milestoneBadge}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Anti-Blowup Discipline Doctrine */}
          <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 text-[10px] text-slate-400 leading-tight font-mono">
            🛡️ <strong>Anti-Blowup Shield:</strong> Spot fractional execution with hard 3.5% stops guarantees you never face margin calls. Surviving bad sessions preserves capital to reach Step 12.
          </div>
        </div>
      </div>

      {/* ─── FLOATING IN-APP TRADE COMPLETION NOTIFICATION (EARNS & LOSSES) ─── */}
      {tradeToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-[calc(100vw-3rem)] sm:w-96 animate-in fade-in slide-in-from-bottom-5 duration-300 shadow-2xl">
          <div className={`p-4 rounded-2xl border backdrop-blur-2xl shadow-2xl ${
            tradeToast.result === 'WIN'
              ? 'bg-[#06140D]/95 border-emerald-500/80 shadow-emerald-950/80 text-white'
              : 'bg-[#180A0E]/95 border-rose-500/80 shadow-rose-950/80 text-white'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  tradeToast.result === 'WIN'
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
                    : 'bg-rose-950 border-rose-500 text-rose-400'
                }`}>
                  {tradeToast.result === 'WIN' ? <Trophy className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-wider ${
                      tradeToast.result === 'WIN' ? 'bg-emerald-500 text-black' : 'bg-rose-500 text-white'
                    }`}>
                      {tradeToast.result === 'WIN' ? 'TRADE WON (EARNS)' : 'STOPPED OUT (LOSS)'}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-300">
                      Step {tradeToast.step} • {tradeToast.asset}
                    </span>
                  </div>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className={`text-2xl font-mono font-black ${
                      tradeToast.result === 'WIN' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {tradeToast.result === 'WIN' ? '+' : '-'}${tradeToast.pnlDollar.toFixed(2)}
                    </span>
                    <span className={`text-sm font-mono font-bold ${
                      tradeToast.result === 'WIN' ? 'text-emerald-300' : 'text-rose-300'
                    }`}>
                      ({tradeToast.result === 'WIN' ? '+' : '-'}{tradeToast.pnlPct.toFixed(2)}%)
                    </span>
                  </div>

                  <div className="mt-1 text-xs font-mono text-slate-300 flex items-center gap-2">
                    <span>New Balance:</span>
                    <strong className="text-white">${tradeToast.newBalance.toFixed(2)}</strong>
                  </div>
                  <p className="mt-1 text-[11px] font-mono text-slate-400 leading-snug">{tradeToast.message}</p>
                </div>
              </div>

              <button
                onClick={() => setTradeToast(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
