'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  HelpCircle,
  Maximize2,
  Minimize2,
  Settings,
  Key,
  CheckCircle2,
  Paperclip,
  Image as ImageIcon,
  Target,
  Percent,
} from 'lucide-react';
import { ChatMessage } from '@/lib/copilot/advisor';

interface CopilotChatProps {
  selectedAsset: 'BTCUSDT' | 'SPY';
  currentScore?: number;
  signalLabel?: string;
  signalColor?: string;
  mode?: 'swing' | 'daytrade';
}

const DAY_TRADE_PROMPTS = [
  '📊 What is happening on the Layer 3 Chart?',
  '⚡ Give me the live Day Trade setup right now',
  '📈 Should I Long or Short right now?',
  '🎯 Where are the exact Stop-Loss & TP levels?',
  '📏 Calculate my 1% scalp position for $10,000',
  '📊 How far is price from the Session VWAP?',
  '🕒 What session are we in & what is the volatility?',
  '💡 How do I scalp using the EMA 9/21 ribbon?',
];

const SWING_PROMPTS = [
  '📊 What is happening on the Layer 3 Chart?',
  '🎯 What is the best decision right now?',
  '🛒 Should I buy right now?',
  '🧭 How do I use this platform?',
  '🔬 Explain the 5 core triggers',
  '🧠 What is the ML regime status?',
  '🛡️ Where should I set my stop-loss?',
  '📅 Explain seasonality & Sunday discount',
];

export default function CopilotChat({
  selectedAsset,
  currentScore = 50,
  signalLabel = 'NEUTRAL',
  signalColor = '#94A3B8',
  mode = 'swing',
}: CopilotChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [promptCategory, setPromptCategory] = useState<'daytrade' | 'swing'>(mode);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync category with prop mode changes
  useEffect(() => {
    setPromptCategory(mode);
  }, [mode]);

  // AI Configuration Settings
  const [provider, setProvider] = useState<'builtin' | 'gemini' | 'openai' | 'groq'>('builtin');
  const [apiKey, setApiKey] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSendMessageRef = useRef<(textToSend?: string) => Promise<void>>(async () => {});

  const handleProcessFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setAttachedImage(result);
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    try {
      const savedProvider = localStorage.getItem('peak_ai_provider');
      const savedKey = localStorage.getItem('peak_ai_key');
      if (savedProvider && ['builtin', 'gemini', 'openai', 'groq'].includes(savedProvider)) {
        setProvider(savedProvider as any);
      }
      if (savedKey) {
        setApiKey(savedKey);
      }
    } catch {
      // Ignore localStorage errors in SSR/sandboxed mode
    }

    const handleOpenChat = () => setIsOpen(true);
    const handleOpenWithQuery = (e: Event) => {
      const customEvent = e as CustomEvent<{ query: string }>;
      setIsOpen(true);
      if (customEvent.detail?.query) {
        const queryText = customEvent.detail.query;
        setTimeout(() => {
          handleSendMessageRef.current?.(queryText);
        }, 150);
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      if (!isOpen) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            handleProcessFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('open-copilot', handleOpenChat);
    window.addEventListener('open-copilot-query', handleOpenWithQuery as EventListener);
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('open-copilot', handleOpenChat);
      window.removeEventListener('open-copilot-query', handleOpenWithQuery as EventListener);
      window.removeEventListener('paste', handlePaste);
    };
  }, [isOpen]);

  const handleSaveSettings = () => {
    try {
      localStorage.setItem('peak_ai_provider', provider);
      localStorage.setItem('peak_ai_key', apiKey.trim());
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setShowSettings(false);
      }, 1000);
    } catch {
      setShowSettings(false);
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      timestamp: 'Just now',
      text: `👋 Hello! I am your **PEAK Quantitative Copilot & Live AI Advisor**.

I have real-time live access to the market triggers, Layer 3 TradingView candlestick chart, Machine Learning regimes, and walk-forward backtests for **${
        selectedAsset === 'BTCUSDT' ? 'Bitcoin (BTC)' : 'S&P 500 (SPY)'
      }**.

Ask me:
- **"What is happening in real time on the Layer 3 chart?"**
- **"What is the best decision right now?"**
- **"Explain the 5 core mathematical triggers"**
- **"Where should I place my invalidation stop-loss?"**`,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !showSettings) {
      scrollToBottom();
    }
  }, [messages, isOpen, showSettings]);

  const handleSendMessage = async (textToSend?: string) => {
    const rawText = (textToSend || input).trim();
    if (!rawText && !attachedImage) return;
    if (loading) return;

    const messageText =
      rawText ||
      'Analyze this chart screenshot and calculate tactical probabilities, key levels, and execution strategy.';
    const currentImage = attachedImage;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: messageText,
      image: currentImage || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setAttachedImage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          symbol: selectedAsset,
          history: messages.slice(-6),
          apiKey: apiKey.trim() || undefined,
          provider,
          mode: promptCategory,
          timeframe: '5m',
          image: currentImage || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.response) {
          setMessages((prev) => [...prev, data.response]);
        }
      } else {
        throw new Error('Failed to get response');
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: '⚠️ Sorry, I experienced an error connecting to the advisor engine. Please check your network or try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  handleSendMessageRef.current = handleSendMessage;

  // Helper to render formatted markdown
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 text-xs leading-relaxed font-sans">
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-mono font-bold text-sm text-emerald-300 mt-2 mb-1">
                {line.replace('### ', '')}
              </h4>
            );
          }
          if (line.startsWith('**Current Verdict:**')) {
            return (
              <p key={idx} className="font-mono text-white font-semibold bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
                {line}
              </p>
            );
          }
          if (line.startsWith('- ')) {
            return (
              <p key={idx} className="pl-3 text-slate-300">
                • {line.substring(2)}
              </p>
            );
          }
          if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ') || line.startsWith('5. ')) {
            return (
              <p key={idx} className="pl-3 text-slate-200 font-mono">
                {line}
              </p>
            );
          }
          if (!line.trim()) {
            return <div key={idx} className="h-1" />;
          }
          return (
            <p key={idx} className="text-slate-300">
              {line}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Floating Action Trigger Button (Desktop only; on mobile it is housed in the Mobile Bottom Dock) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="hidden sm:flex fixed bottom-6 right-6 z-50 items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-mono text-xs font-bold shadow-2xl shadow-emerald-950 hover:scale-105 active:scale-95 transition-all border border-emerald-400/40 group"
          title="Open PEAK AI Live Copilot & Advisor"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full animate-ping" />
          </div>
          <span className="tracking-wide">AI Live Copilot</span>
          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-black/40 border border-white/20 text-emerald-200">
            {currentScore}/100
          </span>
        </button>
      )}

      {/* Slide-out / Modal Drawer (Mobile Bottom Sheet / Desktop Popout) */}
      {isOpen && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setIsDraggingOver(false);
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDraggingOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleProcessFile(file);
          }}
          className={`fixed z-50 transition-all duration-300 flex flex-col bg-[#0B0F17] border border-slate-700/80 shadow-2xl overflow-hidden backdrop-blur-xl ${
            isExpanded
              ? 'inset-4 md:inset-10 rounded-2xl'
              : 'inset-x-0 bottom-0 top-12 sm:top-auto sm:inset-auto sm:bottom-4 sm:right-4 sm:w-[480px] sm:h-[640px] sm:max-h-[92vh] rounded-t-3xl sm:rounded-2xl pb-safe sm:pb-0'
          }`}
        >
          {/* Drag & Drop Overlay */}
          {isDraggingOver && (
            <div className="absolute inset-0 z-50 bg-emerald-950/90 backdrop-blur-sm border-2 border-dashed border-emerald-400 flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
              <div className="p-4 rounded-full bg-emerald-900/80 border border-emerald-500/60 mb-3 shadow-lg">
                <ImageIcon className="w-8 h-8 text-emerald-300 animate-bounce" />
              </div>
              <p className="font-mono text-sm font-bold text-white mb-1">
                Drop Chart Screenshot Here
              </p>
              <p className="font-mono text-xs text-emerald-200">
                AI Advisor will audit structure, candlestick patterns, and probabilities
              </p>
            </div>
          )}

          {/* Mobile Bottom-Sheet Grab Handle */}
          <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto my-2 sm:hidden shrink-0" />
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800 bg-[#080B11]/90">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40">
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                    PEAK AI Live Advisor
                  </h3>
                  <span className="px-1.5 py-0.2 text-[9px] font-mono font-semibold uppercase rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {provider === 'builtin'
                      ? 'Quant AI'
                      : provider === 'gemini'
                      ? 'Gemini Live'
                      : provider === 'openai'
                      ? 'GPT-4o'
                      : 'Groq AI'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono">
                  Asset: <span className="text-white font-bold">{selectedAsset}</span> • Timing Score: {currentScore}/100
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-1.5 rounded-md transition-colors ${
                  showSettings ? 'bg-emerald-600/30 text-emerald-300' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="AI Model & Key Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors hidden sm:block"
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
                title="Close Advisor"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* AI Settings Modal Layer */}
          {showSettings && (
            <div className="p-4 border-b border-slate-800 bg-[#080B11]/95 text-xs space-y-3 shrink-0 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-white flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-emerald-400" />
                  AI Copilot Engine Configuration
                </span>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Select AI Intelligence Provider:</label>
                <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                  <button
                    type="button"
                    onClick={() => setProvider('builtin')}
                    className={`px-2.5 py-1.5 rounded-lg border text-left transition-all ${
                      provider === 'builtin'
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                        : 'bg-[#0F1420] border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    ⚡ Quant AI (Built-in, Instant)
                  </button>
                  <button
                    type="button"
                    onClick={() => setProvider('gemini')}
                    className={`px-2.5 py-1.5 rounded-lg border text-left transition-all ${
                      provider === 'gemini'
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                        : 'bg-[#0F1420] border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    ✨ Google Gemini (1.5 / 2.0)
                  </button>
                  <button
                    type="button"
                    onClick={() => setProvider('openai')}
                    className={`px-2.5 py-1.5 rounded-lg border text-left transition-all ${
                      provider === 'openai'
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                        : 'bg-[#0F1420] border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    🤖 OpenAI (GPT-4o)
                  </button>
                  <button
                    type="button"
                    onClick={() => setProvider('groq')}
                    className={`px-2.5 py-1.5 rounded-lg border text-left transition-all ${
                      provider === 'groq'
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                        : 'bg-[#0F1420] border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    🚀 Groq (Llama 3.3 70B)
                  </button>
                </div>
              </div>

              {provider !== 'builtin' && (
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1">
                    <Key className="w-3 h-3 text-amber-400" />
                    {provider === 'gemini' ? 'Google Gemini API Key' : provider === 'openai' ? 'OpenAI API Key' : 'Groq API Key'}:
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={`Enter your ${provider.toUpperCase()} key (saved locally)`}
                    className="w-full bg-[#0F1420] border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-emerald-500 outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Saved in your browser&apos;s local storage. If blank, the platform uses any server-configured key or falls back to the high-performance built-in engine.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-semibold shadow transition-all"
                >
                  {saveSuccess ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" /> Saved!
                    </>
                  ) : (
                    'Save Configuration'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Quick-Prompt Suite Switcher & Chips */}
          <div className="px-3 pt-2 pb-1.5 border-b border-slate-800/80 bg-[#080B11]/50 flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 bg-[#06080E] p-0.5 rounded-lg border border-slate-800 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => setPromptCategory('daytrade')}
                  className={`px-2.5 py-0.5 rounded font-bold transition-all flex items-center gap-1 ${
                    promptCategory === 'daytrade'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>⚡ Day Trade Scalper</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPromptCategory('swing')}
                  className={`px-2.5 py-0.5 rounded font-bold transition-all flex items-center gap-1 ${
                    promptCategory === 'swing'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🌊 Swing Hunter</span>
                </button>
              </div>

              <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                {promptCategory === 'daytrade' ? '1m/5m/15m Real-time Scalps' : '14-Day Horizon'}
              </span>
            </div>

            <div className="overflow-x-auto scrollbar-none flex items-center gap-1.5 pb-1">
              {/* Tactical Probability & Trend Direct Button */}
              <button
                onClick={() =>
                  handleSendMessage('What is the probability right now?')
                }
                disabled={loading}
                className="shrink-0 px-2.5 py-1 text-[11px] font-mono border rounded-full transition-all text-emerald-200 bg-emerald-950/80 border-emerald-600/70 hover:bg-emerald-900 hover:text-white flex items-center gap-1.5 shadow-sm font-semibold cursor-pointer"
                title="Calculate real-time tactical probabilities, macro range bounds, and trade targets"
              >
                <Target className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>🎯 Probability & Trend</span>
              </button>

              {/* 24-Hour Trade Setup Button */}
              <button
                onClick={() =>
                  handleSendMessage('Give me the 24 hour trade setup right now')
                }
                disabled={loading}
                className="shrink-0 px-2.5 py-1 text-[11px] font-mono border rounded-full transition-all text-amber-200 bg-amber-950/80 border-amber-600/70 hover:bg-amber-900 hover:text-white flex items-center gap-1.5 shadow-sm font-semibold cursor-pointer"
                title="Exact 24-Hour execution targets, Stop-Loss, TP1 (12h), and TP2 (24h daily close)"
              >
                <span>⏱️ 24-Hour Trade Setup</span>
              </button>

              {/* Attach Screenshot Trigger Chip */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="shrink-0 px-2.5 py-1 text-[11px] font-mono border rounded-full transition-all text-purple-200 bg-purple-950/60 border-purple-700/60 hover:bg-purple-900/80 hover:text-white flex items-center gap-1.5 shadow-sm font-medium cursor-pointer"
                title="Attach a chart screenshot from your clipboard (Cmd+V) or disk"
              >
                <Paperclip className="w-3 h-3 text-purple-300" />
                <span>📷 Attach Chart (Cmd+V)</span>
              </button>

              {/* Featured Direct Layer 3 Chart Readout Button */}
              <button
                onClick={() =>
                  handleSendMessage('What is happening in real time on the Layer 3 chart right now?')
                }
                disabled={loading}
                className="shrink-0 px-2.5 py-1 text-[11px] font-mono border rounded-full transition-all text-cyan-200 bg-cyan-950/70 border-cyan-600/60 hover:bg-cyan-900/80 hover:text-white flex items-center gap-1.5 shadow-sm font-semibold cursor-pointer"
                title="Ask AI Advisor for a real-time audit of Candlesticks, 200 SMA, 50 SMA & RSI Subpane"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>📊 Explain Layer 3 Chart</span>
              </button>

              {(promptCategory === 'daytrade' ? DAY_TRADE_PROMPTS : SWING_PROMPTS).map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={loading}
                  className={`shrink-0 px-2.5 py-1 text-[11px] font-mono border rounded-full transition-all ${
                    promptCategory === 'daytrade'
                      ? 'text-amber-200 bg-amber-950/40 border-amber-800/50 hover:bg-amber-900/60 hover:text-white'
                      : 'text-slate-300 hover:text-white bg-[#0F1420] hover:bg-slate-800 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-700/50 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-emerald-400" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-xl p-3.5 text-xs shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600/20 text-emerald-100 border border-emerald-500/40 rounded-tr-none'
                      : 'bg-[#0F1420] border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {/* Attached Image Thumbnail if Present */}
                  {msg.image && (
                    <div className="mb-2.5">
                      <div
                        className="relative group inline-block cursor-pointer overflow-hidden rounded-lg border border-emerald-500/40 bg-black/40 hover:border-emerald-400 transition-all shadow-md"
                        onClick={() => setExpandedImage(msg.image || null)}
                      >
                        <img
                          src={msg.image}
                          alt="Chart Screenshot"
                          className="max-h-52 max-w-full rounded-lg object-contain transition-transform group-hover:scale-[1.02]"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          <span className="text-[10px] font-mono font-bold text-white bg-black/80 px-2.5 py-1 rounded border border-white/20">
                            🔍 Click to Enlarge
                          </span>
                        </div>
                      </div>
                      <div className="text-[9px] font-mono text-emerald-400/90 mt-1 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        Multimodal Chart Feed Ingestion
                      </div>
                    </div>
                  )}

                  {/* Message Content */}
                  {renderFormattedText(msg.text)}

                  {/* Recommendation Action Card if Present */}
                  {msg.actionCard && (
                    <div className="mt-3 p-3 rounded-lg bg-[#080B11] border border-slate-700/80 space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span className="font-mono text-[10px] uppercase font-bold text-slate-400">
                          {msg.actionCard.asset} Advisory
                        </span>
                        <span
                          className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                            msg.actionCard.type === 'TACTICAL_PROBABILITY'
                              ? 'bg-gradient-to-r from-emerald-950 to-teal-950 text-emerald-300 border border-emerald-600/60'
                              : msg.actionCard.type === 'BUY_RECOMMENDATION'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                              : msg.actionCard.type === 'HOLD_WAIT'
                              ? 'bg-amber-950 text-amber-300 border border-amber-700/50'
                              : msg.actionCard.type === 'LAYER_3_CHART_ANALYSIS'
                              ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/50'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {msg.actionCard.verdict}
                        </span>
                      </div>

                      {/* Chart Metrics Badges Grid */}
                      {msg.actionCard.chartMetrics && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 py-1.5 border-b border-slate-800/80 font-mono text-[10px]">
                          <div className="bg-slate-900/90 p-1.5 rounded border border-slate-800 flex flex-col">
                            <span className="text-slate-400 text-[9px]">200 SMA (Amber)</span>
                            <span className="text-amber-400 font-bold">
                              ${msg.actionCard.chartMetrics.sma200.toLocaleString()}
                            </span>
                            <span className="text-[8px] text-slate-400">
                              ({msg.actionCard.chartMetrics.distSma200Pct >= 0 ? '+' : ''}
                              {msg.actionCard.chartMetrics.distSma200Pct.toFixed(1)}%)
                            </span>
                          </div>

                          <div className="bg-slate-900/90 p-1.5 rounded border border-slate-800 flex flex-col">
                            <span className="text-slate-400 text-[9px]">50 SMA (Cyan)</span>
                            <span className="text-cyan-400 font-bold">
                              ${msg.actionCard.chartMetrics.sma50.toLocaleString()}
                            </span>
                            <span className="text-[8px] text-slate-400">
                              {msg.actionCard.chartMetrics.smaTrend.includes('Golden')
                                ? '✨ Golden Cross'
                                : '⚠️ Death Cross'}
                            </span>
                          </div>

                          <div className="bg-slate-900/90 p-1.5 rounded border border-slate-800 flex flex-col">
                            <span className="text-slate-400 text-[9px]">RSI(14) Subpane</span>
                            <span
                              className={`font-bold ${
                                msg.actionCard.chartMetrics.rsiStatus === 'Oversold'
                                  ? 'text-emerald-400'
                                  : msg.actionCard.chartMetrics.rsiStatus === 'Overbought'
                                  ? 'text-rose-400'
                                  : 'text-purple-400'
                              }`}
                            >
                              {msg.actionCard.chartMetrics.rsi14.toFixed(1)}
                            </span>
                            <span className="text-[8px] text-slate-400 uppercase">
                              {msg.actionCard.chartMetrics.rsiStatus}
                            </span>
                          </div>

                          <div className="bg-slate-900/90 p-1.5 rounded border border-slate-800 flex flex-col">
                            <span className="text-slate-400 text-[9px]">Candle Flow</span>
                            <span
                              className={`font-bold ${
                                msg.actionCard.chartMetrics.candleDirection.includes('Bullish')
                                  ? 'text-emerald-400'
                                  : 'text-rose-400'
                              }`}
                            >
                              ${msg.actionCard.chartMetrics.price.toLocaleString()}
                            </span>
                            <span className="text-[8px] text-slate-400">
                              {msg.actionCard.chartMetrics.candleDirection}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Probability Meter & Targets Grid if Present */}
                      {msg.actionCard.probabilityData && (
                        <div className="p-2.5 rounded-lg bg-[#060910] border border-slate-700/90 space-y-2.5 font-mono">
                          <div className="flex items-center justify-between text-[11px] font-bold border-b border-slate-800 pb-1">
                            <span className="text-slate-300 flex items-center gap-1.5">
                              <Target className="w-3.5 h-3.5 text-emerald-400" />
                              Empirical Probability Model
                            </span>
                            <span className="text-emerald-400">
                              R:R {msg.actionCard.probabilityData.rrRatio}
                            </span>
                          </div>

                          {/* Visual Probability Split Bar */}
                          <div>
                            <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                              <span className="text-emerald-300">
                                🟢 {msg.actionCard.probabilityData.bounceProb}% Range Bounce
                              </span>
                              <span className="text-rose-400">
                                🔴 {msg.actionCard.probabilityData.breakdownProb}% Breakdown
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-rose-950/80 overflow-hidden flex border border-slate-700">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                                style={{ width: `${msg.actionCard.probabilityData.bounceProb}%` }}
                              />
                              <div
                                className="h-full bg-gradient-to-r from-rose-600 to-red-500 transition-all duration-500"
                                style={{ width: `${msg.actionCard.probabilityData.breakdownProb}%` }}
                              />
                            </div>
                          </div>

                          {/* Macro Range Boundaries */}
                          <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                            <div className="bg-slate-900/90 p-1.5 rounded border border-slate-800 flex flex-col">
                              <span className="text-slate-400 text-[9px]">Range Floor (Low)</span>
                              <span className="text-emerald-400 font-bold">
                                ${msg.actionCard.probabilityData.rangeLow.toLocaleString()}
                              </span>
                              <span className="text-[8px] text-slate-400">Support Floor</span>
                            </div>
                            <div className="bg-slate-900/90 p-1.5 rounded border border-slate-800 flex flex-col">
                              <span className="text-slate-400 text-[9px]">Range Mean (Mid)</span>
                              <span className="text-cyan-400 font-bold">
                                ${msg.actionCard.probabilityData.rangeMid.toLocaleString()}
                              </span>
                              <span className="text-[8px] text-slate-400">Equilibrium</span>
                            </div>
                            <div className="bg-slate-900/90 p-1.5 rounded border border-slate-800 flex flex-col">
                              <span className="text-slate-400 text-[9px]">Range Ceiling (High)</span>
                              <span className="text-amber-400 font-bold">
                                ${msg.actionCard.probabilityData.rangeHigh.toLocaleString()}
                              </span>
                              <span className="text-[8px] text-slate-400">Resistance</span>
                            </div>
                          </div>

                          {/* Execution Levels */}
                          <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                            <div className="bg-slate-900/90 p-1.5 rounded border border-rose-950/60 flex flex-col">
                              <span className="text-rose-400 text-[9px]">Stop-Loss (Hard)</span>
                              <span className="text-rose-300 font-bold">
                                ${msg.actionCard.probabilityData.stopLoss.toLocaleString()}
                              </span>
                              <span className="text-[8px] text-rose-400/80">Invalidation</span>
                            </div>
                            <div className="bg-slate-900/90 p-1.5 rounded border border-emerald-950/60 flex flex-col">
                              <span className="text-emerald-400 text-[9px]">Take-Profit 1 (TP1)</span>
                              <span className="text-emerald-300 font-bold">
                                ${msg.actionCard.probabilityData.tp1.toLocaleString()}
                              </span>
                              <span className="text-[8px] text-emerald-400/80">50% Close + BE</span>
                            </div>
                            <div className="bg-slate-900/90 p-1.5 rounded border border-emerald-950/60 flex flex-col">
                              <span className="text-emerald-400 text-[9px]">Take-Profit 2 (TP2)</span>
                              <span className="text-emerald-300 font-bold">
                                ${msg.actionCard.probabilityData.tp2.toLocaleString()}
                              </span>
                              <span className="text-[8px] text-emerald-400/80">Runner Target</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="text-[11px] font-mono text-slate-300">
                        <span className="text-slate-400 font-semibold">Action: </span>
                        {msg.actionCard.suggestedAction}
                      </div>

                      {msg.actionCard.recommendedStopLoss && (
                        <div className="text-[11px] font-mono text-amber-300 flex items-center gap-1.5 pt-1 border-t border-slate-800/60">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                          <span>Stop-Loss: {msg.actionCard.recommendedStopLoss}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="text-[9px] font-mono text-slate-400 mt-2 text-right">
                    {msg.timestamp}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-slate-300" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs font-mono pl-10">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                <span>Auditing quantitative triggers...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Sticky Input Field */}
          <div className="p-3 border-t border-slate-800 bg-[#080B11]/90">
            {/* Attached Image Preview */}
            {attachedImage && (
              <div className="flex items-center justify-between p-2 bg-slate-900/90 border border-emerald-500/50 rounded-xl mb-2 animate-in fade-in slide-in-from-bottom-1">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <img
                    src={attachedImage}
                    alt="Attached Chart"
                    className="w-10 h-10 object-cover rounded-lg border border-slate-700 shrink-0 cursor-pointer hover:opacity-90"
                    onClick={() => setExpandedImage(attachedImage)}
                  />
                  <div className="truncate">
                    <p className="text-[11px] font-mono text-emerald-300 font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      Screenshot Attached
                    </p>
                    <p className="text-[9px] font-mono text-slate-400 truncate">
                      Ready for Vision AI & Probability Analysis
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedImage(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                  title="Remove screenshot"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleProcessFile(file);
                  if (e.target) e.target.value = '';
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`p-2.5 rounded-xl border transition-all shrink-0 flex items-center justify-center cursor-pointer ${
                  attachedImage
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-sm'
                    : 'bg-[#0F1420] border-slate-700/80 text-slate-400 hover:text-emerald-300 hover:border-emerald-500/60'
                }`}
                title="Attach chart screenshot (or press Cmd+V to paste)"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  attachedImage
                    ? "Ask question about attached chart (or press Enter to analyze)..."
                    : "Ask AI Copilot or paste chart screenshot (Cmd+V)..."
                }
                disabled={loading}
                className="flex-1 bg-[#0F1420] border border-slate-700/80 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 outline-none transition-all font-mono"
              />
              <button
                type="submit"
                disabled={(!input.trim() && !attachedImage) || loading}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white transition-all shadow-md shrink-0 flex items-center justify-center cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Full-Screen Lightbox Image Zoom Modal */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setExpandedImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-[#0B0F17] border border-slate-700 rounded-2xl overflow-hidden p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/70 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title="Close image preview"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={expandedImage}
              alt="Expanded Chart View"
              className="max-h-[82vh] w-auto max-w-full rounded-xl object-contain mx-auto"
            />
          </div>
        </div>
      )}
    </>
  );
}
