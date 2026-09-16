'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Radio,
  Flame,
  Globe2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  RefreshCw,
  Lock,
  Crosshair,
  Zap,
  ExternalLink,
} from 'lucide-react';
import { GeopoliticalRiskState } from '@/lib/engine/geopolitical';

interface DefconRadarProps {
  onKillSwitchChange?: (active: boolean) => void;
}

export default function DefconRadar({ onKillSwitchChange }: DefconRadarProps) {
  const [data, setData] = useState<GeopoliticalRiskState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'polymarket' | 'barometers'>('overview');

  const fetchDefconState = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/geopolitical-risk');
      if (!res.ok) throw new Error('Failed to load geopolitical data');
      const json: GeopoliticalRiskState = await res.json();
      setData(json);
      if (onKillSwitchChange) {
        onKillSwitchChange(json.killSwitchActive);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Error fetching radar data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDefconState();
    // Refresh every 2 minutes
    const interval = setInterval(fetchDefconState, 120000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="bg-[#0B0F17] border border-slate-800/80 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[420px] text-center">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30 animate-ping" />
          <div className="w-full h-full rounded-full border-2 border-emerald-500 flex items-center justify-center bg-emerald-950/40">
            <Radio className="w-7 h-7 text-emerald-400 animate-pulse" />
          </div>
        </div>
        <h3 className="text-sm font-mono uppercase tracking-widest text-slate-300 font-bold">
          Acquiring Geopolitical Telemetry...
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Ingesting live Polymarket prediction odds, Crude Oil supply shocks, and Defense ETF flight-to-safety data.
        </p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-[#0B0F17] border border-rose-900/50 rounded-2xl p-6 text-center">
        <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
        <p className="text-xs text-rose-300 font-mono">{error}</p>
        <button
          onClick={fetchDefconState}
          className="mt-4 px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white"
        >
          Retry Telemetry Ingest
        </button>
      </div>
    );
  }

  if (!data) return null;

  // Defcon styling maps
  const defconColorMap = {
    1: {
      bg: 'bg-rose-950/80',
      border: 'border-rose-600',
      text: 'text-rose-400',
      glow: 'shadow-rose-950/80 shadow-2xl',
      badge: 'bg-rose-600 text-white animate-pulse',
      desc: 'MAXIMUM READINESS (WW3 / NUCLEAR CONTINGENCY)',
    },
    2: {
      bg: 'bg-orange-950/80',
      border: 'border-orange-500',
      text: 'text-orange-400',
      glow: 'shadow-orange-950/60 shadow-xl',
      badge: 'bg-orange-500 text-black font-bold',
      desc: 'ARMED SUPERPOWER CONFLICT IMMINENT',
    },
    3: {
      bg: 'bg-amber-950/60',
      border: 'border-amber-500/70',
      text: 'text-amber-400',
      glow: 'shadow-amber-950/40',
      badge: 'bg-amber-500 text-black font-bold',
      desc: 'ELEVATED REGIONAL COMBAT & TRADE DISRUPTIONS',
    },
    4: {
      bg: 'bg-cyan-950/50',
      border: 'border-cyan-500/60',
      text: 'text-cyan-400',
      glow: 'shadow-cyan-950/40',
      badge: 'bg-cyan-600 text-white font-bold',
      desc: 'GUARDED REGIONAL POSTURING & TENSIONS',
    },
    5: {
      bg: 'bg-emerald-950/40',
      border: 'border-emerald-500/50',
      text: 'text-emerald-400',
      glow: 'shadow-emerald-950/40',
      badge: 'bg-emerald-600 text-white font-bold',
      desc: 'PEACETIME BASELINE — FULL DIP ACCUMULATION',
    },
  }[data.defconLevel];

  return (
    <div className="bg-[#0B0F17] border border-slate-800/90 rounded-2xl overflow-hidden shadow-2xl relative">
      {/* Background Military Grid Accent */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #10B981 1px, transparent 1px), linear-gradient(to bottom, #10B981 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* ─── HEADER BAR ─── */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4 bg-[#080C14]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 via-amber-500/10 to-transparent border border-rose-500/40 flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5 text-rose-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-black text-white tracking-wider">
                DEFCON GEOPOLITICAL & WW3 RADAR
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-widest bg-slate-800 text-slate-300 border border-slate-700">
                Polymarket &bull; Yahoo Live
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-money conflict escalation odds & financial war shock proxies
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Kill-switch indicator */}
          <div
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 ${
              data.killSwitchActive
                ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-emerald-950/50 border-emerald-600/60 text-emerald-300'
            }`}
          >
            {data.killSwitchActive ? (
              <>
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                <span>KILL-SWITCH: ACTIVE (DIPS LOCKED)</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>KILL-SWITCH: NORMAL (DIPS PERMITTED)</span>
              </>
            )}
          </div>

          <button
            onClick={fetchDefconState}
            disabled={loading}
            title="Refresh Geopolitical Telemetry"
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700/60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ─── MAIN RADAR COCKPIT ─── */}
      <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Rotating Circular Military Radar */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-[#070A11] rounded-xl border border-slate-800/80 relative overflow-hidden">
          {/* Circular Radar Screen */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border border-emerald-500/40 bg-[#04070D] flex items-center justify-center shadow-[inset_0_0_40px_rgba(16,185,129,0.15)]">
            {/* Concentric distance rings */}
            <div className="absolute inset-4 rounded-full border border-emerald-500/20 pointer-events-none" />
            <div className="absolute inset-14 rounded-full border border-emerald-500/20 pointer-events-none" />
            <div className="absolute inset-24 rounded-full border border-emerald-500/20 pointer-events-none" />

            {/* Crosshairs */}
            <div className="absolute inset-x-0 top-1/2 h-[1px] bg-emerald-500/25 pointer-events-none" />
            <div className="absolute inset-y-0 left-1/2 w-[1px] bg-emerald-500/25 pointer-events-none" />

            {/* Rotating Radar Sweep Line */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none animate-[spin_4s_linear_infinite]"
              style={{
                background:
                  'conic-gradient(from 0deg at 50% 50%, rgba(16, 185, 129, 0.45) 0deg, rgba(16, 185, 129, 0.05) 60deg, transparent 75deg)',
              }}
            />

            {/* Conflict Flashpoint Blips */}
            {data.flashpoints.map((fp) => {
              const isCritical = fp.threatLevel === 'critical';
              const isHigh = fp.threatLevel === 'high';
              const colorClass = isCritical
                ? 'bg-rose-500 ring-rose-500 text-rose-300'
                : isHigh
                ? 'bg-amber-400 ring-amber-400 text-amber-300'
                : 'bg-cyan-400 ring-cyan-400 text-cyan-300';

              return (
                <div
                  key={fp.id}
                  style={{
                    left: `${fp.coordinates.x}%`,
                    top: `${fp.coordinates.y}%`,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
                >
                  <div className={`w-3 h-3 rounded-full ${colorClass} animate-ping absolute inset-0 opacity-75`} />
                  <div className={`w-3 h-3 rounded-full ${colorClass} relative shadow-lg flex items-center justify-center`} />

                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 rounded-lg bg-black/95 border border-slate-700 text-[10px] text-slate-200 z-50 shadow-2xl backdrop-blur-md pointer-events-none">
                    <span className="font-bold text-white block mb-0.5">{fp.region}</span>
                    <span className="text-slate-400 leading-tight block">{fp.summary}</span>
                  </div>
                </div>
              );
            })}

            {/* Center HUD reticle */}
            <div className="w-10 h-10 rounded-full border border-emerald-500/60 bg-emerald-950/60 flex items-center justify-center z-10">
              <Crosshair className="w-5 h-5 text-emerald-400 animate-spin" style={{ animationDuration: '16s' }} />
            </div>
          </div>

          {/* Tactical Status Under Radar */}
          <div className="mt-4 w-full text-center">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
              Live Flashpoints Monitored: {data.flashpoints.length} Regions
            </span>
            <div className="flex items-center justify-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Critical Threat
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> High Friction
              </span>
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> Monitored
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: DEFCON Gauge & Tactical Summary */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          {/* DEFCON Level Banner */}
          <div className={`p-4 rounded-xl border ${defconColorMap.border} ${defconColorMap.bg} ${defconColorMap.glow} transition-all`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase">
                Global Threat Posture
              </span>
              <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-black ${defconColorMap.badge}`}>
                DEFCON {data.defconLevel}
              </span>
            </div>

            <div className="mt-2 flex items-baseline gap-3">
              <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${defconColorMap.text}`}>
                {data.defconTitle}
              </span>
            </div>

            {/* Score progress bar */}
            <div className="mt-3">
              <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                <span>War Risk Index: <strong className="text-white">{data.defconScore}/100</strong></span>
                <span>Threshold: <span className="text-rose-400">≥66 (Kill-Switch Active)</span></span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    data.defconScore >= 66
                      ? 'bg-rose-500'
                      : data.defconScore >= 45
                      ? 'bg-amber-400'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${data.defconScore}%` }}
                />
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-300">
              <strong className="text-white block mb-0.5">Tactical Verdict:</strong>
              {data.tacticalVerdict}
            </div>

            <div className="mt-2 text-xs text-slate-300">
              <strong className="text-emerald-400 block mb-0.5">Dip Hunter Recommendation:</strong>
              {data.recommendation}
            </div>
          </div>

          {/* Quick Sub-Tabs */}
          <div className="flex gap-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-white bg-slate-800/40'
              }`}
            >
              Financial War Proxies
            </button>
            <button
              onClick={() => setActiveTab('polymarket')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                activeTab === 'polymarket'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-white bg-slate-800/40'
              }`}
            >
              Polymarket Conflict Odds ({data.polymarketOdds.length})
            </button>
          </div>

          {/* Content: Financial Barometers */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.values(data.financialBarometers).map((b) => {
                const isCrit = b.status === 'critical';
                const isElev = b.status === 'elevated';
                const statusColor = isCrit ? 'text-rose-400' : isElev ? 'text-amber-400' : 'text-emerald-400';
                const statusBorder = isCrit ? 'border-rose-700/60 bg-rose-950/20' : isElev ? 'border-amber-700/40 bg-amber-950/20' : 'border-slate-800 bg-[#070A11]';

                return (
                  <div key={b.symbol} className={`p-3 rounded-xl border ${statusBorder} flex flex-col justify-between`}>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono text-slate-400 uppercase">{b.symbol}</span>
                        <span className={`text-[9px] font-mono uppercase font-bold ${statusColor}`}>
                          {b.status}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-white block truncate">{b.name}</span>
                      <div className="text-base font-black font-mono text-white mt-1">
                        ${b.currentPrice.toLocaleString()}
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-400">5D Shock:</span>
                      <span className={`font-bold flex items-center ${b.change5dPct >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {b.change5dPct >= 0 ? '+' : ''}{b.change5dPct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Content: Polymarket Prediction Odds */}
          {activeTab === 'polymarket' && (
            <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
              {data.polymarketOdds.map((m, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-[#070A11] border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-200 font-medium truncate">{m.question}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-slate-400">
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 uppercase">
                        {m.category}
                      </span>
                      <span>Vol: ${(m.volumeUsd / 1_000_000).toFixed(1)}M</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-base font-mono font-black ${m.probabilityPct > 20 ? 'text-rose-400' : m.probabilityPct > 8 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {m.probabilityPct}%
                    </span>
                    <span className="block text-[9px] font-mono text-slate-500 uppercase">Probability</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── FOOTER BAR ─── */}
      <div className="px-5 py-3 border-t border-slate-800/80 bg-[#070A11] flex flex-wrap items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-4">
          <span>Telemetry updated: <strong className="text-slate-400">{new Date(data.timestamp).toLocaleTimeString()}</strong></span>
          <span>Defense ETF / Gold ratio: <strong className="text-emerald-400">Normal</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <span>Sources: Polymarket CLOB API, Yahoo Finance WTI/XAU/ITA/VIX</span>
        </div>
      </div>
    </div>
  );
}
