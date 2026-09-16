'use client';

import React, { useState } from 'react';
import { Info, Sparkles, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface ComponentPillTipProps {
  layer: string;
  title: string;
  liveStatus: string;
  summary: string;
  howToRead: string[];
  theme?: 'emerald' | 'cyan' | 'amber' | 'purple' | 'blue' | 'rose';
}

export default function ComponentPillTip({
  layer,
  title,
  liveStatus,
  summary,
  howToRead,
  theme = 'emerald',
}: ComponentPillTipProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const themeStyles = {
    emerald: {
      pillBg: 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300 hover:border-emerald-400',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
      glow: 'shadow-emerald-950/40',
      accentText: 'text-emerald-400',
    },
    cyan: {
      pillBg: 'bg-cyan-950/50 border-cyan-500/40 text-cyan-300 hover:border-cyan-400',
      badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50',
      glow: 'shadow-cyan-950/40',
      accentText: 'text-cyan-400',
    },
    amber: {
      pillBg: 'bg-amber-950/50 border-amber-500/40 text-amber-300 hover:border-amber-400',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
      glow: 'shadow-amber-950/40',
      accentText: 'text-amber-400',
    },
    purple: {
      pillBg: 'bg-purple-950/50 border-purple-500/40 text-purple-300 hover:border-purple-400',
      badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
      glow: 'shadow-purple-950/40',
      accentText: 'text-purple-400',
    },
    blue: {
      pillBg: 'bg-blue-950/50 border-blue-500/40 text-blue-300 hover:border-blue-400',
      badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
      glow: 'shadow-blue-950/40',
      accentText: 'text-blue-400',
    },
    rose: {
      pillBg: 'bg-rose-950/60 border-rose-500/50 text-rose-300 hover:border-rose-400',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
      glow: 'shadow-rose-950/50',
      accentText: 'text-rose-400',
    },
  }[theme];

  return (
    <div className="mb-2 relative z-20 max-w-full min-w-0">
      {/* Main Interactive Pill Bar (Shakuro Tactile Pill) */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full border text-[10px] sm:text-xs font-mono backdrop-blur-xl cursor-pointer select-none transition-all shadow-lg max-w-full overflow-hidden bg-[#181a21]/90 border-white/[0.08] border-t-white/[0.2] hover:border-white/25 active:scale-98`}
        title="Click to learn what is happening in this component"
      >
        <span className={`px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest border shrink-0 ${themeStyles.badgeBg}`}>
          {layer}
        </span>

        <span className="font-bold text-white hidden md:inline shrink-0 tracking-tight">{title}:</span>

        <span className="text-slate-300 text-[10px] sm:text-[11px] truncate max-w-[120px] xs:max-w-[170px] sm:max-w-xs md:max-w-md">
          {liveStatus}
        </span>

        <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-slate-400 hover:text-white ml-auto shrink-0 pl-1">
          <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#f5e098]" />
          <span className="hidden md:inline font-semibold">{isExpanded ? 'Hide' : 'Explain'}</span>
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </div>
      </div>

      {/* Expandable Explanation Popover Drawer (Tactile Card) */}
      {isExpanded && (
        <div className="mt-2.5 p-4 sm:p-5 tactile-card text-xs font-sans space-y-3 max-w-full sm:max-w-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
          <div>
            <div className="flex items-center justify-between">
              <span className={`font-mono text-[11px] font-black uppercase tracking-wider ${themeStyles.accentText}`}>
                {layer} • {title}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
                className="tactile-squircle px-2.5 py-1 text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>
            <p className="text-slate-200 mt-2 leading-relaxed text-xs">
              {summary}
            </p>
          </div>

          <div className="pt-3 border-t border-white/[0.08] space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#f5e098]">
              HOW TO READ & ACTION THIS:
            </span>
            <ul className="space-y-1.5">
              {howToRead.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-300 leading-snug">
                  <span className={`${themeStyles.accentText} font-bold`}>▸</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
