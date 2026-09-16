'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  BookOpen,
  Globe,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  HelpCircle,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { BRAIN_GUIDES, BrainGuide } from '@/lib/data/brainGuides';

interface WikiResource {
  success: boolean;
  query: string;
  title: string;
  description: string;
  extract: string;
  thumbnail: string | null;
  url: string;
  source: string;
}

const QUICK_LOOKUP_TAGS = [
  'S&P 500',
  'SPDR S&P 500 Trust ETF',
  'E-mini S&P 500',
  'Options',
  'Margin',
  'Algorithmic trading',
  'Short selling',
  'Relative strength index',
  'VIX',
];

export default function BrainLiveResourceExplorer() {
  const [selectedGuideId, setSelectedGuideId] = useState<string>(BRAIN_GUIDES[0].id);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Live API Search State
  const [apiQuery, setApiQuery] = useState<string>('S&P 500');
  const [apiResult, setApiResult] = useState<WikiResource | null>(null);
  const [apiLoading, setApiLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Fetch from Wikipedia API
  const fetchWikiResource = async (term: string) => {
    setApiLoading(true);
    setApiError(null);
    try {
      const res = await fetch(`/api/brain/resource?query=${encodeURIComponent(term)}`);
      const data = await res.json();
      if (data.success) {
        setApiResult(data);
      } else {
        setApiError(data.message || 'No encyclopedia entry found.');
        setApiResult(null);
      }
    } catch (err) {
      setApiError('Failed to communicate with the knowledge API.');
      setApiResult(null);
    } finally {
      setApiLoading(false);
    }
  };

  // Initial load with S&P 500
  useEffect(() => {
    fetchWikiResource('S&P 500');
  }, []);

  const activeGuide = BRAIN_GUIDES.find((g) => g.id === selectedGuideId) || BRAIN_GUIDES[0];

  const toggleCheck = (idx: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleAskCopilot = (prompt: string) => {
    window.dispatchEvent(
      new CustomEvent('open-copilot-query', {
        detail: { query: prompt },
      })
    );
  };

  return (
    <div className="space-y-8">
      {/* SECTION 1: MASTERCLASSES & STARTER BLUEPRINTS */}
      <div className="w-full bg-[#0B0F19]/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-mono text-white tracking-wide">
                INSTITUTIONAL STARTER BLUEPRINTS & MASTERCLASSES
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Step-by-step roadmaps: How to trade the S&P 500, Micro Futures, and Options safely.
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30 self-start sm:self-auto">
            {BRAIN_GUIDES.length} Curated Roadmaps
          </span>
        </div>

        {/* Guide Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {BRAIN_GUIDES.map((guide) => (
            <button
              key={guide.id}
              onClick={() => setSelectedGuideId(guide.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                selectedGuideId === guide.id
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>{guide.title.split('(')[0].trim()}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30 font-normal">
                {guide.readingTimeMin}m
              </span>
            </button>
          ))}
        </div>

        {/* Active Guide Content Container */}
        <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5 sm:p-6 space-y-6">
          {/* Guide Header */}
          <div className="space-y-2 pb-4 border-b border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {activeGuide.difficulty}
              </span>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{activeGuide.readingTimeMin} min read</span>
              </span>
              <div className="flex gap-1 ml-auto">
                {activeGuide.tags.map((t) => (
                  <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-black font-mono text-white">
              {activeGuide.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {activeGuide.subtitle}
            </p>
          </div>

          {/* Guide Sections */}
          <div className="space-y-6">
            {activeGuide.sections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-3">
                <div className="flex items-center gap-2">
                  {section.badge && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {section.badge}
                    </span>
                  )}
                  <h3 className="text-base font-bold font-mono text-white">
                    {section.title}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {section.content}
                </p>

                {/* Bullets & Interactive Checklist */}
                {section.bullets && section.bullets.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {section.bullets.map((bullet, bIdx) => {
                      const itemKey = `${activeGuide.id}_s${sIdx}_b${bIdx}`;
                      const isChecked = !!checkedItems[itemKey];

                      return (
                        <div
                          key={bIdx}
                          onClick={() => toggleCheck(itemKey)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 text-xs ${
                            isChecked
                              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                              : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <CheckCircle2
                            className={`w-4 h-4 shrink-0 mt-0.5 transition-colors ${
                              isChecked ? 'text-emerald-400' : 'text-slate-600'
                            }`}
                          />
                          <span className="leading-relaxed">{bullet}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Callout Box */}
                {section.callout && (
                  <div
                    className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                      section.callout.type === 'tip'
                        ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-200'
                        : section.callout.type === 'warning'
                        ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                        : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                    }`}
                  >
                    <div className="font-mono font-bold uppercase mb-1 flex items-center gap-1.5">
                      {section.callout.type === 'tip' && <Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
                      {section.callout.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                      {section.callout.type === 'pro' && <TrendingUp className="w-3.5 h-3.5 text-amber-400" />}
                      <span>{section.callout.title}</span>
                    </div>
                    {section.callout.text}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Action Footer */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-mono text-slate-400">
              Have questions about this blueprint?
            </span>
            <button
              onClick={() => handleAskCopilot(`Explain this blueprint: ${activeGuide.title}`)}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ask Copilot About This Guide</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: LIVE WIKIPEDIA FINANCIAL ENCYCLOPEDIA API EXPLORER */}
      <div className="w-full bg-[#0B0F19]/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-mono text-white tracking-wide">
                GLOBAL FINANCIAL ENCYCLOPEDIA (LIVE WIKIPEDIA API)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time API connector fetching authoritative definitions and history for any financial instrument.
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 self-start sm:self-auto">
            REST API Connected
          </span>
        </div>

        {/* Search Bar */}
        <div className="space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (apiQuery.trim()) fetchWikiResource(apiQuery.trim());
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={apiQuery}
                onChange={(e) => setApiQuery(e.target.value)}
                placeholder="Query any financial concept (e.g. S&P 500, E-mini, Margin, Options)..."
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <button
              type="submit"
              disabled={apiLoading}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold transition-all disabled:opacity-50"
            >
              {apiLoading ? 'Fetching...' : 'Lookup API'}
            </button>
          </form>

          {/* Quick Tag Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-500 uppercase mr-1">Popular Lookups:</span>
            {QUICK_LOOKUP_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setApiQuery(tag);
                  fetchWikiResource(tag);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 text-[11px] font-mono border border-slate-800 transition-all"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* API Response Display Card */}
        {apiLoading ? (
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-xs font-mono text-slate-400 animate-pulse">
            Querying Wikipedia Financial Knowledge API...
          </div>
        ) : apiError ? (
          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 text-xs font-mono text-rose-300">
            {apiError}
          </div>
        ) : apiResult ? (
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                  {apiResult.description}
                </span>
                <h4 className="text-lg font-bold font-mono text-white mt-0.5">
                  {apiResult.title}
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={apiResult.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono transition-all flex items-center gap-1.5 border border-slate-700"
                >
                  <span>Wikipedia Article</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => handleAskCopilot(`How does the S&P 500 and ${apiResult.title} affect PEAK dip hunting?`)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600/80 hover:bg-cyan-500 text-white text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Ask Copilot</span>
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {apiResult.extract}
            </p>

            <div className="text-[10px] font-mono text-slate-500 flex items-center justify-between pt-2 border-t border-slate-800/80">
              <span>Source: {apiResult.source}</span>
              <span>Live REST API Connection Active</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
