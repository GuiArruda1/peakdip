'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Zap,
  TrendingUp,
  TrendingDown,
  X,
  Maximize2,
  Mail,
  Copy,
  Check,
  AlertTriangle,
  Radio,
  Clock,
  Send,
  MessageSquare,
  Activity,
  Layers,
  ChevronRight,
  Flame,
  Settings,
  Sliders,
  CheckCircle2,
  Headphones,
} from 'lucide-react';
import { JarvisBriefingData } from '@/app/api/jarvis/briefing/route';

interface VoiceSettings {
  engine: 'browser' | 'studio';
  voiceUri: string;
  studioVoice: 'onyx' | 'echo' | 'fable' | 'alloy';
  rate: number;
  pitch: number;
}

// Banned legacy novelty/robotic voices that sound terrible
const ROBOTIC_VOICE_BLACKLIST = [
  'alex',
  'fred',
  'albert',
  'bad news',
  'bahh',
  'bells',
  'boing',
  'bubbles',
  'cellos',
  'deranged',
  'good news',
  'hysterical',
  'organ',
  'pipe organ',
  'trinoids',
  'whisper',
  'zarvox',
  'ralph',
  'junior',
  'kathy',
  'princess',
  'vicki',
  'victoria',
  'wobble',
  'jester',
  'superstar',
];

/**
 * Transforms raw market text and abbreviations into smooth, natural, conversational spoken English.
 */
function normalizeScriptForRealisticSpeech(rawText: string): string {
  let text = rawText;

  // Replace symbols and technical abbreviations
  text = text.replace(/BTC\/USDT/gi, 'Bitcoin against Tether');
  text = text.replace(/BTC/gi, 'Bitcoin');
  text = text.replace(/S&P\s*500/gi, 'S and P 500');
  text = text.replace(/SPY/gi, 'S and P 500 ETF');
  text = text.replace(/200-SMA|200\s*SMA/gi, 'two-hundred-day simple moving average');
  text = text.replace(/50-SMA|50\s*SMA/gi, 'fifty-day moving average');
  text = text.replace(/RSI\(14\)|RSI\s*14/gi, 'fourteen-period R S I');
  text = text.replace(/RSI/gi, 'R S I');
  text = text.replace(/DEFCON\s*([0-9])/gi, 'Defcon $1');
  text = text.replace(/WTI\s*Crude\s*Oil/gi, 'Crude Oil');
  text = text.replace(/\/bbl/gi, ' per barrel');
  text = text.replace(/TP1/gi, 'Take Profit one');
  text = text.replace(/TP2/gi, 'Take Profit two');
  text = text.replace(/SL/gi, 'Stop Loss');
  text = text.replace(/S&R/gi, 'Support and Resistance');

  // Replace price symbols and percentage signs for clear diction
  text = text.replace(/\$([0-9]+),([0-9]{3})/g, '$1 thousand $2 dollars');
  text = text.replace(/\$([0-9]+)\.([0-9]{1,2})/g, '$1 dollars and $2 cents');
  text = text.replace(/\$([0-9]+)/g, '$1 dollars');
  text = text.replace(/\+([0-9]+(?:\.[0-9]+)?)\s*%/g, 'up $1 percent');
  text = text.replace(/-([0-9]+(?:\.[0-9]+)?)\s*%/g, 'down $1 percent');
  text = text.replace(/%/g, ' percent');

  // Replace punctuation that causes robotic stuttering
  text = text.replace(/[—–]/g, ', ');
  text = text.replace(/[*#_`]/g, '');
  text = text.replace(/:\s*/g, ', ');
  text = text.replace(/\s{2,}/g, ' ');

  return text.trim();
}

/**
 * Splits text into individual sentences for sequential speech with natural human breathing pauses.
 */
function splitIntoSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);
}

export default function JarvisDailyBriefingBot() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [briefing, setBriefing] = useState<JarvisBriefingData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPlayingVoice, setIsPlayingVoice] = useState<boolean>(false);
  const [isVoiceSupported, setIsVoiceSupported] = useState<boolean>(true);
  const [showProactiveGreeting, setShowProactiveGreeting] = useState<boolean>(false);
  const [copiedLevel, setCopiedLevel] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>('guilherme.ca@outlook.com');
  const [emailSending, setEmailSending] = useState<boolean>(false);
  const [emailSuccess, setEmailSuccess] = useState<boolean>(false);

  // High-Fidelity Voice Controls
  const [showVoiceSettings, setShowVoiceSettings] = useState<boolean>(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    engine: 'browser',
    voiceUri: '',
    studioVoice: 'onyx',
    rate: 0.96, // Calm, composed British advisor speed (not rushed robot!)
    pitch: 0.98, // Resonant, authoritative tone
  });
  const [userApiKey, setUserApiKey] = useState<string>('');
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number>(-1);
  const [audioStatusMessage, setAudioStatusMessage] = useState<string>('');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentSentenceIdxRef = useRef<number>(0);
  const sentenceQueueRef = useRef<string[]>([]);
  const isPlayingRef = useRef<boolean>(false);

  // Load Saved Preferences & API Key
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem('peak_ai_key');
      if (savedKey) setUserApiKey(savedKey);

      const savedSettings = localStorage.getItem('peak_jarvis_voice_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setVoiceSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {}
  }, []);

  // Initialize Speech Synthesis Voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsVoiceSupported(false);
      return;
    }

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      // Filter out robotic and novelty voices
      const filtered = voices.filter((v) => {
        const nameLower = v.name.toLowerCase();
        return !ROBOTIC_VOICE_BLACKLIST.some((banned) => nameLower.includes(banned));
      });

      // Sort by Quality Priority:
      // 1. British Enhanced/Natural/Premium (Classic Jarvis)
      // 2. Google UK English Male (Chromium Neural)
      // 3. Siri English
      // 4. Microsoft Natural / Online
      // 5. General English
      const sorted = [...filtered].sort((a, b) => {
        const scoreVoice = (voice: SpeechSynthesisVoice) => {
          const name = voice.name.toLowerCase();
          const lang = voice.lang.toLowerCase();
          let score = 0;

          // English bonus
          if (lang.startsWith('en')) score += 10;
          if (lang === 'en-gb') score += 25; // British Butler priority

          // High fidelity badges
          if (name.includes('enhanced') || name.includes('premium') || name.includes('natural')) score += 50;
          if (name.includes('google uk english male')) score += 70; // Top Chrome neural voice
          if (name.includes('daniel')) score += 40; // Classic British Jarvis
          if (name.includes('oliver') || name.includes('arthur')) score += 35;
          if (name.includes('siri')) score += 45;
          if (name.includes('ryan') || name.includes('guy')) score += 30;

          return score;
        };
        return scoreVoice(b) - scoreVoice(a);
      });

      setAvailableVoices(sorted);

      // Set best default voice if not set
      setVoiceSettings((prev) => {
        if (!prev.voiceUri || !sorted.some((v) => v.voiceURI === prev.voiceUri)) {
          const defaultVoice = sorted[0];
          return { ...prev, voiceUri: defaultVoice ? defaultVoice.voiceURI : '' };
        }
        return prev;
      });
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Fetch Daily Briefing Data
  const fetchBriefing = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/jarvis/briefing');
      if (res.ok) {
        const data: JarvisBriefingData = await res.json();
        setBriefing(data);
      }
    } catch (err) {
      console.error('Failed to fetch Jarvis briefing:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBriefing();

    // Event listener for opening briefing from anywhere
    const openHandler = () => {
      setIsOpen(true);
      setShowProactiveGreeting(false);
    };
    window.addEventListener('open-jarvis-briefing', openHandler);

    // Check proactive greeting
    try {
      const today = new Date().toISOString().split('T')[0];
      const lastGreeted = localStorage.getItem('peak_jarvis_last_greet_date');
      if (lastGreeted !== today) {
        const timer = setTimeout(() => setShowProactiveGreeting(true), 1500);
        return () => {
          clearTimeout(timer);
          window.removeEventListener('open-jarvis-briefing', openHandler);
        };
      }
    } catch (e) {}

    return () => {
      window.removeEventListener('open-jarvis-briefing', openHandler);
    };
  }, []);

  // Stop All Playing Speech (Browser + Audio Ref)
  const handleStopVoice = () => {
    isPlayingRef.current = false;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlayingVoice(false);
    setActiveSentenceIndex(-1);
    setAudioStatusMessage('');
  };

  // Play Sentence Queue with Natural Human Breathing Pauses
  const playNextSentence = (sentences: string[], index: number) => {
    if (!isPlayingRef.current || index >= sentences.length) {
      handleStopVoice();
      return;
    }

    currentSentenceIdxRef.current = index;
    setActiveSentenceIndex(index);

    const sentence = sentences[index];
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.rate = voiceSettings.rate;
    utterance.pitch = voiceSettings.pitch;

    // Pick selected voice
    const chosenVoice = availableVoices.find((v) => v.voiceURI === voiceSettings.voiceUri) || availableVoices[0];
    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }

    utterance.onend = () => {
      if (!isPlayingRef.current) return;
      // Natural human micro-pause between sentences (180ms to 240ms)
      const pauseDuration = sentence.endsWith('?') || sentence.endsWith('!') ? 300 : 200;
      setTimeout(() => {
        if (isPlayingRef.current) {
          playNextSentence(sentences, index + 1);
        }
      }, pauseDuration);
    };

    utterance.onerror = (e) => {
      console.warn('Utterance error:', e);
      if (isPlayingRef.current) {
        playNextSentence(sentences, index + 1);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  // Main Voice Playback Handler
  const handlePlayVoice = async () => {
    if (!briefing) return;

    if (isPlayingVoice) {
      handleStopVoice();
      return;
    }

    handleStopVoice();
    isPlayingRef.current = true;
    setIsPlayingVoice(true);

    const normalizedScript = normalizeScriptForRealisticSpeech(briefing.speechScript);

    // MODE 1: STUDIO NEURAL AI VOICE (OpenAI Onyx / Echo)
    if (voiceSettings.engine === 'studio') {
      try {
        setAudioStatusMessage('Synthesizing Studio Neural Voice (Paul Bettany / Onyx cadence)...');
        const res = await fetch('/api/jarvis/voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: normalizedScript,
            voice: voiceSettings.studioVoice,
            speed: voiceSettings.rate,
            apiKey: userApiKey || undefined,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData?.message || 'Studio voice generation failed. Falling back to Enhanced Browser Engine.');
        }

        const blob = await res.blob();
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onended = () => {
          handleStopVoice();
          URL.revokeObjectURL(audioUrl);
        };
        audio.onerror = () => {
          handleStopVoice();
          URL.revokeObjectURL(audioUrl);
        };

        setAudioStatusMessage('');
        await audio.play();
        return;
      } catch (err: any) {
        console.warn('Studio AI voice failed or no API key, falling back to Enhanced Browser Voice:', err);
        setAudioStatusMessage('Studio AI unavailable. Engaging Enhanced Natural Browser Engine...');
        setTimeout(() => setAudioStatusMessage(''), 3000);
      }
    }

    // MODE 2: ENHANCED NATURAL BROWSER ENGINE (Zero-Cost, Local)
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      setIsPlayingVoice(false);
      return;
    }

    const sentences = splitIntoSentences(normalizedScript);
    sentenceQueueRef.current = sentences;
    currentSentenceIdxRef.current = 0;

    playNextSentence(sentences, 0);
  };

  // Test Sample Voice
  const handleTestVoice = (voiceUriToTest?: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const sampleText = 'All PEAK quantitative diagnostic subsystems are calibrated, sir. How may I assist you today?';
    const utterance = new SpeechSynthesisUtterance(sampleText);
    utterance.rate = voiceSettings.rate;
    utterance.pitch = voiceSettings.pitch;

    const targetUri = voiceUriToTest || voiceSettings.voiceUri;
    const chosenVoice = availableVoices.find((v) => v.voiceURI === targetUri) || availableVoices[0];
    if (chosenVoice) utterance.voice = chosenVoice;

    window.speechSynthesis.speak(utterance);
  };

  const handleUpdateVoiceSettings = (newSettings: Partial<VoiceSettings>) => {
    const updated = { ...voiceSettings, ...newSettings };
    setVoiceSettings(updated);
    try {
      localStorage.setItem('peak_jarvis_voice_settings', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleOpenJarvis = () => {
    setIsOpen(true);
    setShowProactiveGreeting(false);
    try {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('peak_jarvis_last_greet_date', today);
    } catch (e) {}
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLevel(label);
    setTimeout(() => setCopiedLevel(null), 2000);
  };

  const handleCopyFullScript = () => {
    if (!briefing) return;
    navigator.clipboard.writeText(briefing.speechScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleSendEmail = async () => {
    if (!emailInput || emailSending) return;
    setEmailSending(true);
    setEmailSuccess(false);
    try {
      const res = await fetch('/api/jarvis/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput }),
      });
      if (res.ok) {
        setEmailSuccess(true);
        setTimeout(() => setEmailSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Failed to send email dispatch:', err);
    } finally {
      setEmailSending(false);
    }
  };

  const handleAskCopilot = (prompt: string) => {
    setIsOpen(false);
    handleStopVoice();
    window.dispatchEvent(
      new CustomEvent('open-copilot-query', {
        detail: { query: prompt },
      })
    );
  };

  const currentSelectedVoice = useMemo(() => {
    return availableVoices.find((v) => v.voiceURI === voiceSettings.voiceUri) || availableVoices[0];
  }, [availableVoices, voiceSettings.voiceUri]);

  return (
    <>
      {/* ================================================================== */}
      {/* 1. FLOATING ARC-REACTOR BUTTON (BOTTOM-LEFT) */}
      {/* ================================================================== */}
      <div className="fixed bottom-6 left-6 z-40 flex items-center gap-3 select-none">
        {showProactiveGreeting && !isOpen && (
          <div className="hidden sm:flex items-center gap-3 bg-[#0B0F19]/95 border border-cyan-500/50 rounded-2xl p-3.5 shadow-2xl shadow-cyan-950/80 backdrop-blur-xl animate-in fade-in slide-in-from-left-4 max-w-sm">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-cyan-300 animate-pulse" />
            </div>
            <div className="text-xs">
              <div className="flex items-center gap-1.5 font-mono font-bold text-cyan-300">
                <span>JARVIS AI</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                {briefing?.greeting || 'Good day, sir.'} Daily Tactical Briefing is calibrated.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={handleOpenJarvis}
                  className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-[10px] transition-all flex items-center gap-1 shadow-md"
                >
                  <span>Review Briefing →</span>
                </button>
                <button
                  onClick={() => setShowProactiveGreeting(false)}
                  className="text-[10px] font-mono text-slate-400 hover:text-white"
                >
                  Dismiss
                </button>
              </div>
            </div>
            <button onClick={() => setShowProactiveGreeting(false)} className="text-slate-500 hover:text-white ml-1 shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Floating Reactor Button */}
        <button
          onClick={() => {
            if (isOpen) {
              setIsOpen(false);
              handleStopVoice();
            } else {
              handleOpenJarvis();
            }
          }}
          className="relative group p-0 rounded-full focus:outline-none transition-transform hover:scale-105 active:scale-95"
          title="Open JARVIS Daily Quantitative Briefing"
        >
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-500 opacity-60 blur-md group-hover:opacity-100 transition-opacity animate-pulse" />

          <div className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#080B11] border-2 border-cyan-400/80 p-2 shadow-2xl flex items-center justify-center overflow-hidden">
            <div className="absolute inset-1 rounded-full border border-dashed border-cyan-500/40 animate-spin" style={{ animationDuration: '12s' }} />

            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 via-teal-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
              {isPlayingVoice ? (
                <Volume2 className="w-4 h-4 text-white animate-bounce" />
              ) : (
                <Zap className="w-4 h-4 text-white" />
              )}
            </div>

            {isPlayingVoice && (
              <div className="absolute bottom-1.5 flex items-center gap-0.5">
                <span className="w-0.5 h-2 bg-cyan-300 animate-pulse" />
                <span className="w-0.5 h-3 bg-cyan-200 animate-pulse" style={{ animationDelay: '150ms' }} />
                <span className="w-0.5 h-1.5 bg-cyan-300 animate-pulse" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </div>

          <span className="hidden group-hover:flex absolute left-16 top-1/2 -translate-y-1/2 whitespace-nowrap px-2.5 py-1 rounded-md bg-slate-950/90 border border-cyan-500/40 text-[10px] font-mono font-bold text-cyan-300 shadow-xl">
            JARVIS AI • Daily Briefing
          </span>
        </button>
      </div>

      {/* ================================================================== */}
      {/* 2. FULL FUTURISTIC JARVIS HUD MODAL */}
      {/* ================================================================== */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-[#070A10]/95 border-2 border-cyan-500/60 rounded-3xl shadow-2xl shadow-cyan-950/80 overflow-hidden font-mono">
            {/* Sci-Fi Top Banner */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-cyan-500/30 bg-gradient-to-r from-cyan-950/50 via-slate-900/90 to-blue-950/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-lg shadow-cyan-900/50">
                  <Zap className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black tracking-wider text-white">
                      JARVIS <span className="text-cyan-400">MK-IV</span>
                    </h3>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                      STUDIO VOICE READY
                    </span>
                    <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Institutional Quantitative Intelligence & Realistic Audio Synthesis
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Voice Settings Button */}
                <button
                  onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                  className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 text-xs ${
                    showVoiceSettings
                      ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-950'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Tune Voice Acoustics (Engine, Pitch, Pace, Neural Voices)"
                >
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline text-[10px] font-bold">Voice Tuning</span>
                </button>

                <button
                  onClick={fetchBriefing}
                  disabled={loading}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Refresh live market intelligence"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleStopVoice();
                  }}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Close HUD"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* HIGH-FIDELITY VOICE TUNING DRAWER */}
            {showVoiceSettings && (
              <div className="px-5 py-3.5 bg-[#050811] border-b border-cyan-500/30 animate-in slide-in-from-top-2 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                    <Headphones className="w-4 h-4 text-cyan-400" />
                    <span>ACOUSTIC SPEECH SYNTHESIS ENGINE</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Pacing & Natural Prosody Active</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Engine Selection */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                      Speech Engine:
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => handleUpdateVoiceSettings({ engine: 'browser' })}
                        className={`p-2 rounded-lg text-left text-[11px] font-bold border transition-all ${
                          voiceSettings.engine === 'browser'
                            ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div>🇬🇧 Browser Neural</div>
                        <span className="text-[9px] font-normal text-slate-400 block mt-0.5">Free / Instant Local</span>
                      </button>

                      <button
                        onClick={() => handleUpdateVoiceSettings({ engine: 'studio' })}
                        className={`p-2 rounded-lg text-left text-[11px] font-bold border transition-all ${
                          voiceSettings.engine === 'studio'
                            ? 'bg-purple-950/70 border-purple-400 text-purple-200'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div>⚡ Studio Neural AI</div>
                        <span className="text-[9px] font-normal text-slate-400 block mt-0.5">Onyx / Film Grade</span>
                      </button>
                    </div>
                  </div>

                  {/* Voice Selector */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {voiceSettings.engine === 'studio' ? 'Studio Persona:' : 'Installed System Voice:'}
                      </span>
                      <button
                        onClick={() => handleTestVoice()}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold underline flex items-center gap-1"
                      >
                        <Play className="w-2.5 h-2.5 fill-current" />
                        <span>Test Voice</span>
                      </button>
                    </div>

                    {voiceSettings.engine === 'studio' ? (
                      <select
                        value={voiceSettings.studioVoice}
                        onChange={(e) => handleUpdateVoiceSettings({ studioVoice: e.target.value as any })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="onyx">Onyx (Deep, Authoritative Jarvis)</option>
                        <option value="echo">Echo (Crisp, Smooth Cadence)</option>
                        <option value="fable">Fable (Warm British Accent)</option>
                        <option value="alloy">Alloy (Balanced Executive)</option>
                      </select>
                    ) : (
                      <select
                        value={voiceSettings.voiceUri}
                        onChange={(e) => {
                          handleUpdateVoiceSettings({ voiceUri: e.target.value });
                          handleTestVoice(e.target.value);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      >
                        {availableVoices.map((v) => {
                          const isBritish = v.lang.includes('GB');
                          const isNatural =
                            v.name.includes('Natural') ||
                            v.name.includes('Enhanced') ||
                            v.name.includes('Google') ||
                            v.name.includes('Daniel');
                          return (
                            <option key={v.voiceURI} value={v.voiceURI}>
                              {isNatural ? '🌟 ' : ''}
                              {isBritish ? '🇬🇧 ' : '🇺🇸 '}
                              {v.name} ({v.lang})
                            </option>
                          );
                        })}
                      </select>
                    )}
                  </div>
                </div>

                {/* Pitch & Speed Control Sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="flex items-center justify-between gap-3 px-3 py-2 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Cadence Speed:</span>
                    <div className="flex items-center gap-2 flex-1 max-w-[160px]">
                      <input
                        type="range"
                        min="0.8"
                        max="1.2"
                        step="0.02"
                        value={voiceSettings.rate}
                        onChange={(e) => handleUpdateVoiceSettings({ rate: parseFloat(e.target.value) })}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                      <span className="text-[11px] text-cyan-300 font-bold w-10 text-right">
                        {voiceSettings.rate.toFixed(2)}x
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 px-3 py-2 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Vocal Pitch:</span>
                    <div className="flex items-center gap-2 flex-1 max-w-[160px]">
                      <input
                        type="range"
                        min="0.85"
                        max="1.15"
                        step="0.02"
                        value={voiceSettings.pitch}
                        onChange={(e) => handleUpdateVoiceSettings({ pitch: parseFloat(e.target.value) })}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                      <span className="text-[11px] text-cyan-300 font-bold w-10 text-right">
                        {voiceSettings.pitch.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Header: Date & Session Info */}
            <div className="px-5 py-2 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{briefing?.dateString || 'Today'}</span>
                <span className="text-slate-600">•</span>
                <span className="text-white font-bold">{briefing?.session.name}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                  VOLATILITY: {briefing?.session.volatility}
                </span>
                <span className="text-slate-500">{briefing?.session.utcTime}</span>
              </div>
            </div>

            {/* Audio Transmission Bar */}
            <div className="px-5 py-3 bg-gradient-to-r from-cyan-950/30 via-slate-900/60 to-cyan-950/30 border-b border-cyan-500/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePlayVoice}
                  disabled={!isVoiceSupported || loading}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg ${
                    isPlayingVoice
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/60'
                      : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-950/60'
                  }`}
                >
                  {isPlayingVoice ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Stop Voice Transmission</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Listen to Jarvis Briefing</span>
                    </>
                  )}
                </button>

                {isPlayingVoice ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-cyan-500/40">
                    <span className="w-1 h-3 bg-cyan-400 animate-pulse" />
                    <span className="w-1 h-5 bg-cyan-300 animate-pulse" style={{ animationDelay: '100ms' }} />
                    <span className="w-1 h-3.5 bg-teal-300 animate-pulse" style={{ animationDelay: '250ms' }} />
                    <span className="w-1 h-6 bg-cyan-200 animate-pulse" style={{ animationDelay: '180ms' }} />
                    <span className="w-1 h-3 bg-cyan-400 animate-pulse" style={{ animationDelay: '300ms' }} />
                    <span className="text-[10px] text-cyan-300 font-bold ml-1">
                      {voiceSettings.engine === 'studio' ? 'STUDIO AI SPEECH' : 'REALISTIC CADENCE SPEAKING'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>
                      Active: <strong className="text-white">{currentSelectedVoice?.name || 'British Jarvis'}</strong>
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={handleCopyFullScript}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-bold border border-slate-800 transition-colors flex items-center gap-1"
                  title="Copy full script"
                >
                  {copiedScript ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedScript ? 'Copied!' : 'Copy Script'}</span>
                </button>
              </div>
            </div>

            {/* Audio Status Banner (if fallback or loading) */}
            {audioStatusMessage && (
              <div className="px-5 py-2 bg-cyan-950/60 border-b border-cyan-800/40 text-[11px] text-cyan-300 font-bold flex items-center gap-2 animate-in fade-in">
                <Activity className="w-3.5 h-3.5 animate-spin" />
                <span>{audioStatusMessage}</span>
              </div>
            )}

            {/* SCROLLABLE BODY */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Active Sentence Subtitle Highlight */}
              {isPlayingVoice && activeSentenceIndex >= 0 && sentenceQueueRef.current[activeSentenceIndex] && (
                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/50 shadow-lg animate-in fade-in flex items-start gap-2 text-xs text-cyan-200">
                  <Volume2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 animate-pulse" />
                  <p className="italic leading-relaxed">
                    "{sentenceQueueRef.current[activeSentenceIndex]}"
                  </p>
                </div>
              )}

              {/* 1. EXECUTIVE MACRO VERDICT BANNER */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-900/80 to-purple-950/30 border border-amber-500/40 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span className="text-[10px] uppercase font-bold text-amber-400">
                      EXECUTIVE REGIME DIRECTIVE:
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 w-fit">
                    {briefing?.macroVerdict.status || 'EXTENDED'}
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {briefing?.macroVerdict.actionableSummary}
                </p>
              </div>

              {/* 2. DUAL ASSET TELEMETRY (BTC & SPY) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* BITCOIN CARD */}
                <div className="p-4 rounded-2xl bg-[#0B0F19] border border-slate-800 hover:border-slate-700 transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400">Bitcoin</span>
                      <div className="text-base font-black text-white flex items-center gap-2">
                        <span>${briefing?.btc.price.toLocaleString()}</span>
                        <span
                          className={`text-xs font-bold ${
                            (briefing?.btc.change24h || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {(briefing?.btc.change24h || 0) >= 0 ? '+' : ''}
                          {briefing?.btc.change24h.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500">CONVICTION</span>
                      <div className="text-xs font-black text-amber-400">
                        {briefing?.btc.score} / 100
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400">
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-850">
                      <span className="text-slate-500 block">200-SMA Dist</span>
                      <strong className="text-amber-300">+{briefing?.btc.distToSma200Pct.toFixed(1)}%</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-850">
                      <span className="text-slate-500 block">RSI(14)</span>
                      <strong className="text-white">{briefing?.btc.rsi14.toFixed(1)}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-850">
                      <span className="text-slate-500 block">Sentiment</span>
                      <strong className="text-purple-300">{briefing?.btc.fearGreed.label}</strong>
                    </div>
                  </div>
                </div>

                {/* SPY CARD */}
                <div className="p-4 rounded-2xl bg-[#0B0F19] border border-slate-800 hover:border-slate-700 transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400">S&P 500 ETF (SPY)</span>
                      <div className="text-base font-black text-white flex items-center gap-2">
                        <span>${briefing?.spy.price.toFixed(2)}</span>
                        <span
                          className={`text-xs font-bold ${
                            (briefing?.spy.change24h || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {(briefing?.spy.change24h || 0) >= 0 ? '+' : ''}
                          {briefing?.spy.change24h.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500">CONVICTION</span>
                      <div className="text-xs font-black text-amber-400">
                        {briefing?.spy.score} / 100
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400">
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-850">
                      <span className="text-slate-500 block">200-SMA Dist</span>
                      <strong className="text-cyan-300">+{briefing?.spy.distToSma200Pct.toFixed(1)}%</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-850">
                      <span className="text-slate-500 block">RSI(14)</span>
                      <strong className="text-white">{briefing?.spy.rsi14.toFixed(1)}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-850">
                      <span className="text-slate-500 block">CBOE VIX</span>
                      <strong className="text-emerald-300">{briefing?.spy.vix.value.toFixed(1)}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. STRATEGIC S&R LADDER FOR TODAY */}
              <div className="p-4 rounded-2xl bg-[#0B0F19] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Today's Critical S&R Battleground (Bitcoin)
                    </h4>
                  </div>
                  <span className="text-[10px] text-slate-500">Click to copy level</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  <button
                    onClick={() => handleCopy(String(briefing?.btc.pivots.r2 || 0), 'R2')}
                    className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/30 hover:border-rose-500 text-left transition-colors group"
                  >
                    <div className="flex justify-between items-center text-[10px] text-rose-400 font-bold">
                      <span>R2 CEILING</span>
                      {copiedLevel === 'R2' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100" />}
                    </div>
                    <div className="text-sm font-black text-white mt-1">
                      ${briefing?.btc.pivots.r2.toLocaleString()}
                    </div>
                  </button>

                  <button
                    onClick={() => handleCopy(String(briefing?.btc.pivots.r1 || 0), 'R1')}
                    className="p-2.5 rounded-xl bg-rose-950/15 border border-rose-500/20 hover:border-rose-500 text-left transition-colors group"
                  >
                    <div className="flex justify-between items-center text-[10px] text-rose-300 font-bold">
                      <span>R1 IMMEDIATE</span>
                      {copiedLevel === 'R1' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100" />}
                    </div>
                    <div className="text-sm font-black text-white mt-1">
                      ${briefing?.btc.pivots.r1.toLocaleString()}
                    </div>
                  </button>

                  <button
                    onClick={() => handleCopy(String(briefing?.btc.pivots.pp || 0), 'PP')}
                    className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 hover:border-cyan-500 text-left transition-colors group"
                  >
                    <div className="flex justify-between items-center text-[10px] text-cyan-300 font-bold">
                      <span>PIVOT (PP)</span>
                      {copiedLevel === 'PP' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100" />}
                    </div>
                    <div className="text-sm font-black text-white mt-1">
                      ${briefing?.btc.pivots.pp.toLocaleString()}
                    </div>
                  </button>

                  <button
                    onClick={() => handleCopy(String(briefing?.btc.pivots.s1 || 0), 'S1')}
                    className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 hover:border-emerald-500 text-left transition-colors group"
                  >
                    <div className="flex justify-between items-center text-[10px] text-emerald-300 font-bold">
                      <span>S1 INTRADAY</span>
                      {copiedLevel === 'S1' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100" />}
                    </div>
                    <div className="text-sm font-black text-white mt-1">
                      ${briefing?.btc.pivots.s1.toLocaleString()}
                    </div>
                  </button>

                  <button
                    onClick={() => handleCopy(String(briefing?.btc.pivots.s2 || 0), 'S2')}
                    className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 hover:border-emerald-500 text-left transition-colors group"
                  >
                    <div className="flex justify-between items-center text-[10px] text-emerald-400 font-bold">
                      <span>S2 STRUCTURAL</span>
                      {copiedLevel === 'S2' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100" />}
                    </div>
                    <div className="text-sm font-black text-white mt-1">
                      ${briefing?.btc.pivots.s2.toLocaleString()}
                    </div>
                  </button>
                </div>
              </div>

              {/* 4. GEOPOLITICAL & CRUDE OIL BAROMETER */}
              <div className="p-4 rounded-2xl bg-[#0B0F19] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-white">Geopolitical & Energy Alert:</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      DEFCON {briefing?.geopolitical.defconLevel}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    WTI Crude Oil is at <strong className="text-amber-300">${briefing?.geopolitical.crudeOilPrice.toFixed(2)}/barrel</strong> (+{briefing?.geopolitical.crudeOilChange5d.toFixed(1)}% 5d surge). Watch energy transit choke points.
                  </p>
                </div>

                <button
                  onClick={() => handleAskCopilot('Explain the impact of DEFCON 4 and the crude oil spike on BTC and equities today.')}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 text-xs font-bold border border-slate-800 transition-colors whitespace-nowrap self-start sm:self-auto"
                >
                  Inspect Threat
                </button>
              </div>

              {/* 5. THE 3 NON-NEGOTIABLE DIRECTIVES OF THE DAY */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
                  🛡️ Tactical Directives for Today:
                </span>
                <div className="space-y-2">
                  {briefing?.tacticalDirectives.map((dir, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 text-xs text-slate-300 flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="leading-relaxed">{dir}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 6. AUTOMATED DAILY DISPATCH TO INBOX */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/20 via-slate-950 to-cyan-950/20 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Mail className="w-4 h-4 text-cyan-400" />
                    <span>Automate Daily Jarvis Briefing to Inbox</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">READY</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter your email (e.g. user@domain.com)"
                    className="w-full sm:flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={handleSendEmail}
                    disabled={emailSending}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg shrink-0 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{emailSending ? 'Dispatching...' : 'Send Briefing Now'}</span>
                  </button>
                </div>

                {emailSuccess && (
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                    <Check className="w-3.5 h-3.5" />
                    <span>Jarvis morning briefing dispatched successfully to {emailInput}!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-950/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="text-[11px]">PEAK Quantitative Core • ML-Regime v2.4</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleAskCopilot('Jarvis, give me an intraday scalp trade plan for Bitcoin based on current levels.')}
                  className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 text-[11px]"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Deep-Dive with Copilot →</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
