'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Brain,
  Search,
  BookOpen,
  Calculator,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Zap,
  TrendingUp,
  Clock,
  Layers,
  CheckCircle2,
  AlertOctagon,
  Compass,
} from 'lucide-react';
import {
  BRAIN_CODEX,
  BRAIN_CATEGORIES,
  BrainCategory,
  BrainCodexEntry,
} from '@/lib/data/brainCodex';
import { BRAIN_GUIDES } from '@/lib/data/brainGuides';
import BrainExpectancySimulator from '@/components/BrainExpectancySimulator';
import BrainSessionClockConverter from '@/components/BrainSessionClockConverter';
import BrainLeverageSimulator from '@/components/BrainLeverageSimulator';
import BrainLiveResourceExplorer from '@/components/BrainLiveResourceExplorer';
import BrainSupportResistanceAcademy from '@/components/BrainSupportResistanceAcademy';
import CopilotChat from '@/components/CopilotChat';

export default function BrainPage() {
  const [activeTab, setActiveTab] = useState<'codex' | 'guides' | 'sr-mastery' | 'lab'>('codex');
  const [selectedCategory, setSelectedCategory] = useState<BrainCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  // Toggle card expansion
  const toggleExpand = (id: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Expand all / collapse all
  const handleExpandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    BRAIN_CODEX.forEach((item) => {
      allExpanded[item.id] = true;
    });
    setExpandedCards(allExpanded);
  };

  const handleCollapseAll = () => {
    setExpandedCards({});
  };

  // Filtered codex entries
  const filteredEntries = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return BRAIN_CODEX.filter((entry) => {
      const matchesCategory =
        selectedCategory === 'all' || entry.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!query) return true;

      return (
        entry.title.toLowerCase().includes(query) ||
        entry.shortDef.toLowerCase().includes(query) ||
        entry.fullExplanation.toLowerCase().includes(query) ||
        entry.tag.toLowerCase().includes(query) ||
        entry.peakImplementation.toLowerCase().includes(query) ||
        entry.amateurMistake.toLowerCase().includes(query) ||
        entry.proExecution.toLowerCase().includes(query)
      );
    });
  }, [selectedCategory, searchQuery]);

  // Handle Ask Copilot trigger
  const handleAskCopilot = (prompt: string) => {
    window.dispatchEvent(
      new CustomEvent('open-copilot-query', {
        detail: { query: prompt },
      })
    );
  };

  return (
    <div className="min-h-screen w-full bg-[var(--bg-base)] text-[var(--text-main)] flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/90 bg-[#080B11]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/terminal"
              className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-mono font-bold"
              title="Return to Terminal"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Terminal</span>
            </Link>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-amber-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-lg shadow-purple-950/40">
                <Brain className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-mono font-black tracking-wide text-white">
                    PEAK <span className="text-purple-400">BRAIN</span>
                  </h1>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                    KNOWLEDGE CODEX
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Institutional Quantitative Trading Dictionary & Concept Hub
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('codex')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'codex'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/60'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Dictionary ({BRAIN_CODEX.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('guides')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'guides'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950/60'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Blueprints & API ({BRAIN_GUIDES.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('sr-mastery')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'sr-mastery'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/60'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>S&R Mastery</span>
            </button>
            <button
              onClick={() => setActiveTab('lab')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'lab'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/60'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Interactive Lab</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900/70 to-indigo-950/40 border border-purple-500/30 p-5 sm:p-6 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>The Institutional Knowledge Engine</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
                Master the Mathematics & Psychology of Quantitative Trading
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Everything that powers PEAK: from Wilder’s smoothed RSI and 200-SMA Z-Scores to Mark Douglas’s 20-trade batches, Jesse Livermore’s patience clock, and Paul Tudor Jones’s 5:1 asymmetry edge.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveTab('sr-mastery')}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-amber-950/40"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Learn S&R Mastery →</span>
              </button>
              <Link
                href="/terminal"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold transition-all shadow-lg flex items-center gap-1.5"
              >
                <span>Live Terminal →</span>
              </Link>
            </div>
          </div>
        </div>

        {/* TAB 1: CODEX & DICTIONARY */}
        {activeTab === 'codex' && (
          <div className="space-y-6">
            {/* Search and Filter Controls */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 20+ trading terms, formulas, indicators, or doctrines..."
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs font-mono"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
                    selectedCategory === 'all'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  All ({BRAIN_CODEX.length})
                </button>
                {BRAIN_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      selectedCategory === cat.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* Expand / Collapse All */}
              <div className="flex items-center gap-2 self-end md:self-auto">
                <button
                  onClick={handleExpandAll}
                  className="text-[11px] font-mono text-slate-400 hover:text-purple-300 transition-colors"
                >
                  Expand All
                </button>
                <span className="text-slate-600 text-xs">•</span>
                <button
                  onClick={handleCollapseAll}
                  className="text-[11px] font-mono text-slate-400 hover:text-purple-300 transition-colors"
                >
                  Collapse All
                </button>
              </div>
            </div>

            {/* Results Counter */}
            <div className="text-xs font-mono text-slate-400">
              Showing <span className="text-white font-bold">{filteredEntries.length}</span> institutional concepts
              {searchQuery && <span> matching "{searchQuery}"</span>}
            </div>

            {/* Codex Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEntries.map((entry) => {
                const isExpanded = !!expandedCards[entry.id];
                return (
                  <div
                    key={entry.id}
                    className="bg-[#0B0F19]/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 transition-all shadow-lg flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2 pb-2.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-900 text-slate-300 border border-slate-800">
                              {entry.tag}
                            </span>
                            <span className="text-[10px] font-mono text-purple-400 uppercase">
                              {entry.category.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <h3 className="text-base font-bold font-mono text-white mt-1">
                            {entry.title}
                          </h3>
                        </div>

                        <button
                          onClick={() => toggleExpand(entry.id)}
                          className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition-colors shrink-0"
                          title={isExpanded ? 'Collapse' : 'Expand Details'}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Short Definition */}
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {entry.shortDef}
                      </p>

                      {/* Expanded Section */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3.5 animate-fadeIn">
                          {/* Full Explanation */}
                          <div className="text-xs text-slate-400 leading-relaxed">
                            {entry.fullExplanation}
                          </div>

                          {/* Mathematical Formula */}
                          {entry.mathFormula && (
                            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto">
                              <span className="text-[10px] text-slate-500 uppercase block mb-0.5">
                                Formula / Math:
                              </span>
                              {entry.mathFormula}
                            </div>
                          )}

                          {/* PEAK Implementation */}
                          <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs font-mono text-purple-200">
                            <span className="text-purple-400 font-bold block text-[10px] uppercase mb-0.5">
                              ⚡ How PEAK Uses It:
                            </span>
                            {entry.peakImplementation}
                          </div>

                          {/* Contrast Box: Amateur vs. Pro */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-300">
                              <span className="text-[10px] font-mono font-bold uppercase block text-rose-400 mb-0.5">
                                ❌ Amateur Pitfall:
                              </span>
                              {entry.amateurMistake}
                            </div>
                            <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300">
                              <span className="text-[10px] font-mono font-bold uppercase block text-emerald-400 mb-0.5">
                                ✔️ Institutional Pro Execution:
                              </span>
                              {entry.proExecution}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Footer Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-800/70 flex items-center justify-between">
                      <button
                        onClick={() => toggleExpand(entry.id)}
                        className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <span>{isExpanded ? 'Show Less' : 'Full Concept Breakdown'}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleAskCopilot(entry.copilotPrompt)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[11px] font-mono font-semibold transition-all flex items-center gap-1.5 shadow-sm"
                        title="Ask Copilot about this in the live market"
                      >
                        <MessageSquare className="w-3 h-3 text-purple-400" />
                        <span>Ask Copilot</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: STARTER BLUEPRINTS & LIVE WIKIPEDIA API */}
        {activeTab === 'guides' && (
          <BrainLiveResourceExplorer />
        )}

        {/* TAB 3: SUPPORT & RESISTANCE MASTERY ACADEMY */}
        {activeTab === 'sr-mastery' && (
          <BrainSupportResistanceAcademy />
        )}

        {/* TAB 4: INTERACTIVE LAB (CALCULATORS, LEVERAGE & SESSION CLOCK) */}
        {activeTab === 'lab' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-900/60 to-purple-950/30 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">Interactive Studio</span>
                <h4 className="text-sm font-bold font-mono text-white">Support & Resistance Academy & Candlestick Simulator</h4>
                <p className="text-xs text-slate-400">Step through live market scenarios, test Wyckoff springs, role flips, and auction theory.</p>
              </div>
              <button
                onClick={() => setActiveTab('sr-mastery')}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-mono font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-lg"
              >
                <span>Open S&R Academy →</span>
              </button>
            </div>
            <BrainLeverageSimulator />
            <BrainSessionClockConverter />
            <BrainExpectancySimulator />
          </div>
        )}
      </main>

      {/* Embedded Global Copilot Chat Drawer */}
      <CopilotChat
        selectedAsset="BTCUSDT"
      />
    </div>
  );
}
