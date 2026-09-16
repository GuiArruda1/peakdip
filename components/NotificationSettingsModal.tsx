'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Mail,
  X,
  CheckCircle2,
  AlertTriangle,
  Send,
  Sparkles,
  Clock,
  ShieldCheck,
  ExternalLink,
  History,
  Eye,
  Globe,
  Radio,
} from 'lucide-react';
import { EmailNotificationConfig, EmailDispatchLog, EmailProviderType } from '@/lib/notifications/types';
import {
  checkNotificationPermission,
  requestNotificationPermission,
  sendBrowserDecisionNotification,
} from '@/lib/notifications/browserAlerts';

export default function NotificationSettingsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'browser' | 'email'>('browser');
  const [loading, setLoading] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [sendingBrowserTest, setSendingBrowserTest] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Browser Notifications State
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [browserAlertsEnabled, setBrowserAlertsEnabled] = useState(false);

  // Email Form State
  const [recipientEmail, setRecipientEmail] = useState('');
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [provider, setProvider] = useState<EmailProviderType>('preview');
  const [apiKey, setApiKey] = useState('');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpFrom, setSmtpFrom] = useState('');

  // Logs & Preview
  const [logs, setLogs] = useState<EmailDispatchLog[]>([]);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  // Check permissions and load config on mount / open
  useEffect(() => {
    setBrowserPermission(checkNotificationPermission());
    const savedBrowserPref = localStorage.getItem('peak_browser_alerts_enabled') === 'true';
    setBrowserAlertsEnabled(savedBrowserPref);

    const handleOpenModal = () => setIsOpen(true);
    window.addEventListener('open-notification-settings', handleOpenModal);
    return () => window.removeEventListener('open-notification-settings', handleOpenModal);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setBrowserPermission(checkNotificationPermission());
      loadConfig();
    }
  }, [isOpen]);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications/config');
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setRecipientEmail(data.config.recipientEmail || '');
          setEmailEnabled(Boolean(data.config.enabled));
          setProvider(data.config.provider || 'preview');
          setApiKey(data.config.apiKey || '');
          setSmtpHost(data.config.smtpHost || '');
          setSmtpPort(data.config.smtpPort || 587);
          setSmtpUser(data.config.smtpUser || '');
          setSmtpPass(data.config.smtpPass || '');
          setSmtpFrom(data.config.smtpFrom || '');
        }
        if (data.logs) {
          setLogs(data.logs);
        }
      }
    } catch (err) {
      console.error('Failed to load notification settings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle Browser Notifications
  const handleToggleBrowserAlerts = async () => {
    const nextState = !browserAlertsEnabled;
    if (nextState) {
      const perm = await requestNotificationPermission();
      setBrowserPermission(perm);
      if (perm !== 'granted') {
        setMessage({
          type: 'error',
          text: 'Browser notifications permission was not granted. Please allow notifications in your browser settings.',
        });
        return;
      }
    }
    setBrowserAlertsEnabled(nextState);
    localStorage.setItem('peak_browser_alerts_enabled', nextState ? 'true' : 'false');
    setMessage({
      type: 'success',
      text: nextState
        ? '30-minute browser decision notifications enabled!'
        : '30-minute browser notifications turned off.',
    });
  };

  // Test Browser Notification
  const handleTestBrowserAlert = async () => {
    setSendingBrowserTest(true);
    setMessage(null);
    try {
      const perm = await requestNotificationPermission();
      setBrowserPermission(perm);
      if (perm !== 'granted') {
        setMessage({
          type: 'error',
          text: 'Please allow notification permissions in your browser to receive alerts.',
        });
        return;
      }

      // Fetch latest cockpit signals
      const res = await fetch('/api/signals/cockpit');
      if (!res.ok) throw new Error('Failed to fetch live market decision');
      const data = await res.json();

      const sent = await sendBrowserDecisionNotification(data);
      if (sent) {
        setMessage({
          type: 'success',
          text: 'Browser notification triggered! Check your desktop / screen banner.',
        });
        setBrowserAlertsEnabled(true);
        localStorage.setItem('peak_browser_alerts_enabled', 'true');
      } else {
        throw new Error('Notification could not be displayed');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to trigger browser notification' });
    } finally {
      setSendingBrowserTest(false);
    }
  };

  const handleSaveEmail = async (showSuccessMsg = true) => {
    setMessage(null);
    try {
      const payload: Partial<EmailNotificationConfig> = {
        recipientEmail: recipientEmail.trim(),
        enabled: emailEnabled,
        provider,
        apiKey: apiKey.trim() || undefined,
        smtpHost: smtpHost.trim() || undefined,
        smtpPort: Number(smtpPort) || 587,
        smtpUser: smtpUser.trim() || undefined,
        smtpPass: smtpPass.trim() || undefined,
        smtpFrom: smtpFrom.trim() || undefined,
      };

      const res = await fetch('/api/notifications/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        if (showSuccessMsg) {
          setMessage({ type: 'success', text: 'Email notification preferences saved!' });
        }
        return true;
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error saving settings' });
      return false;
    }
  };

  const handleSendEmailTest = async () => {
    if (!recipientEmail.trim()) {
      setMessage({ type: 'error', text: 'Please enter a recipient email address first.' });
      return;
    }

    setSendingTest(true);
    setMessage(null);

    // Auto-save settings first
    await handleSaveEmail(false);

    try {
      const res = await fetch('/api/notifications/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: recipientEmail.trim(),
          provider,
          apiKey: apiKey.trim() || undefined,
          smtpHost: smtpHost.trim() || undefined,
          smtpPort: Number(smtpPort) || 587,
          smtpUser: smtpUser.trim() || undefined,
          smtpPass: smtpPass.trim() || undefined,
          smtpFrom: smtpFrom.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({
          type: 'success',
          text: data.message || 'Test digest successfully compiled and dispatched!',
        });
        if (data.log?.htmlContent) {
          setPreviewHtml(data.log.htmlContent);
        }
        // Refresh logs
        loadConfig();
      } else {
        throw new Error(data.error || data.message || 'Failed to dispatch test email');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Dispatch failed' });
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <>
      {/* Header Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700/80 bg-[#0F1420] hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-mono transition-all shadow-sm group"
        title="Configure 30-Min Browser & 1-Hour Email Alerts"
      >
        <div className="relative">
          <Bell className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-400 transition-colors" />
          {(browserAlertsEnabled || emailEnabled) && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          )}
        </div>
        <span className="hidden sm:inline">Alerts</span>
        <span
          className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
            browserAlertsEnabled || emailEnabled
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              : 'bg-slate-800 text-slate-400'
          }`}
        >
          {browserAlertsEnabled && emailEnabled
            ? '30m + 1h Active'
            : browserAlertsEnabled
            ? '30m Browser'
            : emailEnabled
            ? '1h Email'
            : 'Off'}
        </span>
      </button>

      {/* Settings Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-[#0B0F17] border border-slate-700/90 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] pb-safe sm:pb-0">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#080B11]/90">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                    PEAK Market Alert Center
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Automated 30-minute browser decision pushes & 1-hour email digests.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center border-b border-slate-800 bg-[#080B11] px-5 pt-2 gap-4 font-mono text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('browser')}
                className={`pb-2.5 flex items-center gap-2 border-b-2 font-semibold transition-all ${
                  activeTab === 'browser'
                    ? 'border-emerald-400 text-emerald-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Browser Push (30 Min)</span>
                {browserAlertsEnabled && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('email')}
                className={`pb-2.5 flex items-center gap-2 border-b-2 font-semibold transition-all ${
                  activeTab === 'email'
                    ? 'border-emerald-400 text-emerald-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Digest (1 Hour)</span>
                {emailEnabled && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                )}
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              {/* Message Banner */}
              {message && (
                <div
                  className={`p-3 rounded-xl border flex items-start gap-2.5 font-mono text-xs ${
                    message.type === 'success'
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                  }`}
                >
                  {message.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <span className="flex-1">{message.text}</span>
                </div>
              )}

              {/* TAB 1: Browser Notifications (30 Min) */}
              {activeTab === 'browser' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#0F1420] border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-mono font-bold text-white text-xs block">
                          30-Minute Browser Decision Alerts
                        </label>
                        <p className="text-[11px] text-slate-400 font-mono">
                          Sends desktop push notifications every 30 minutes with live buy/sell/wait guidance.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleToggleBrowserAlerts}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          browserAlertsEnabled ? 'bg-emerald-600' : 'bg-slate-800'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            browserAlertsEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-mono text-[11px]">
                      <span className="text-slate-400">Browser Permission Status:</span>
                      <span
                        className={`px-2 py-0.5 rounded font-bold ${
                          browserPermission === 'granted'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : browserPermission === 'denied'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {browserPermission === 'granted'
                          ? '✅ Permission Granted'
                          : browserPermission === 'denied'
                          ? '❌ Blocked in Browser'
                          : '⚠️ Needs Permission'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#080B11] border border-slate-800/80 space-y-2 text-slate-300">
                    <div className="font-mono text-white font-bold flex items-center gap-1.5 text-xs">
                      <Radio className="w-3.5 h-3.5 text-emerald-400" />
                      What the 30-Minute Notification Delivers:
                    </div>
                    <ul className="space-y-1.5 text-[11px] text-slate-400 list-disc pl-4 font-sans">
                      <li>
                        <strong className="text-emerald-300 font-mono">Strong Buy Alerts (Score $\ge 70$):</strong> Immediate push when multi-trigger capitulation occurs with recommended tranche entry.
                      </li>
                      <li>
                        <strong className="text-cyan-300 font-mono">Value Dip Alerts (Score $50–69$):</strong> Notifies when price retraces to the institutional 200-SMA support.
                      </li>
                      <li>
                        <strong className="text-amber-300 font-mono">Caution (Score $&lt; 30$):</strong> Warns against FOMO chasing when market is stretched.
                      </li>
                      <li>
                        Works seamlessly on desktop browsers (Chrome, Edge, Brave, Safari) and installed PWA app mode.
                      </li>
                    </ul>
                  </div>

                  {/* Browser Test Button */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                    <button
                      type="button"
                      onClick={handleTestBrowserAlert}
                      disabled={sendingBrowserTest}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-emerald-950/50"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      {sendingBrowserTest ? 'Dispatching Decision...' : '⚡ Test Browser Notification Now'}
                    </button>
                    <span className="font-mono text-[10px] text-slate-400">
                      Pops up immediate decision banner
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 2: Email Notifications (1 Hour) */}
              {activeTab === 'email' && (
                <div className="space-y-4">
                  {/* Toggle & Recipient Card */}
                  <div className="p-4 rounded-xl bg-[#0F1420] border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-mono font-bold text-white text-xs block">
                          Automated 1-Hour Notifications
                        </label>
                        <p className="text-[11px] text-slate-400 font-mono">
                          Dispatches the executive digest automatically every 60 minutes.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEmailEnabled(!emailEnabled)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          emailEnabled ? 'bg-emerald-600' : 'bg-slate-800'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            emailEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 font-semibold mb-1.5">
                        Recipient Email Address:
                      </label>
                      <input
                        type="email"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        placeholder="e.g. guilherme.ca@outlook.com"
                        className="w-full bg-[#080B11] border border-slate-700/80 focus:border-emerald-500 rounded-lg px-3.5 py-2 text-white font-mono text-xs outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Provider Selection */}
                  <div className="space-y-2.5">
                    <label className="block text-[11px] font-mono text-slate-300 font-semibold">
                      Email Dispatch Provider:
                    </label>
                    <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                      <button
                        type="button"
                        onClick={() => setProvider('preview')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          provider === 'preview'
                            ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                            : 'bg-[#0F1420] border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                          Instant Preview Mode
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Zero setup required. Compiles live HTML digest for instant in-app inspection.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setProvider('resend')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          provider === 'resend'
                            ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                            : 'bg-[#0F1420] border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-cyan-400" />
                          Resend API (Cloud)
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Ultra-reliable inbox delivery via resend.com API key.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setProvider('smtp')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          provider === 'smtp'
                            ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                            : 'bg-[#0F1420] border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                          Gmail / Custom SMTP
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Use standard SMTP or personal Gmail/Outlook with App Password.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setProvider('sendgrid')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          provider === 'sendgrid'
                            ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                            : 'bg-[#0F1420] border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-400" />
                          SendGrid API
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          SendGrid transactional mail API.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Provider Config Inputs */}
                  {(provider === 'resend' || provider === 'sendgrid') && (
                    <div className="p-4 rounded-xl bg-[#0F1420] border border-slate-800 space-y-2">
                      <label className="block text-[11px] font-mono text-slate-300 font-semibold">
                        {provider === 'resend' ? 'Resend API Key' : 'SendGrid API Key'}:
                      </label>
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder={`Enter ${provider.toUpperCase()} API key`}
                        className="w-full bg-[#080B11] border border-slate-700/80 rounded-lg px-3.5 py-2 text-white font-mono text-xs outline-none focus:border-emerald-500"
                      />
                      <p className="text-[10px] text-slate-400 font-mono">
                        Can also be pre-configured via <code className="text-emerald-300">RESEND_API_KEY</code> in <code className="text-emerald-300">.env.local</code>.
                      </p>
                    </div>
                  )}

                  {provider === 'smtp' && (
                    <div className="p-4 rounded-xl bg-[#0F1420] border border-slate-800 space-y-3 font-mono text-xs">
                      <div className="flex items-center gap-2 pb-1 border-b border-slate-800">
                        <span className="text-[10px] text-slate-400">Quick Presets:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSmtpHost('smtp-mail.outlook.com');
                            setSmtpPort(587);
                            if (recipientEmail && !smtpUser) setSmtpUser(recipientEmail);
                          }}
                          className="px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800 text-blue-300 text-[10px] hover:bg-blue-900/60 transition-colors"
                        >
                          Outlook / Office365
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSmtpHost('smtp.gmail.com');
                            setSmtpPort(587);
                          }}
                          className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800 text-rose-300 text-[10px] hover:bg-rose-900/60 transition-colors"
                        >
                          Gmail
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <label className="block text-[10px] text-slate-400 mb-1">SMTP Host:</label>
                          <input
                            type="text"
                            value={smtpHost}
                            onChange={(e) => setSmtpHost(e.target.value)}
                            placeholder="e.g. smtp-mail.outlook.com"
                            className="w-full bg-[#080B11] border border-slate-700/80 rounded-lg px-3 py-1.5 text-white outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">Port:</label>
                          <input
                            type="number"
                            value={smtpPort}
                            onChange={(e) => setSmtpPort(Number(e.target.value))}
                            className="w-full bg-[#080B11] border border-slate-700/80 rounded-lg px-3 py-1.5 text-white outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">Username / Email:</label>
                          <input
                            type="text"
                            value={smtpUser}
                            onChange={(e) => setSmtpUser(e.target.value)}
                            placeholder="your@email.com"
                            className="w-full bg-[#080B11] border border-slate-700/80 rounded-lg px-3 py-1.5 text-white outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">App Password:</label>
                          <input
                            type="password"
                            value={smtpPass}
                            onChange={(e) => setSmtpPass(e.target.value)}
                            placeholder="App Password"
                            className="w-full bg-[#080B11] border border-slate-700/80 rounded-lg px-3 py-1.5 text-white outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={handleSendEmailTest}
                      disabled={sendingTest || !recipientEmail.trim()}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-mono text-xs font-bold transition-all shadow-md"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {sendingTest ? 'Compiling & Sending...' : '⚡ Send Test Digest Now'}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSaveEmail(true)}
                        className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200 font-mono text-xs font-semibold transition-all"
                      >
                        Save Preferences
                      </button>
                    </div>
                  </div>

                  {/* Recent Dispatch History Log */}
                  {logs.length > 0 && (
                    <div className="space-y-2 pt-3 border-t border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                          <History className="w-3.5 h-3.5 text-slate-400" />
                          Recent Dispatch Activity
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          Last {logs.length} dispatches
                        </span>
                      </div>

                      <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl overflow-hidden bg-[#080B11]">
                        {logs.slice(0, 3).map((l) => (
                          <div key={l.id} className="p-3 flex items-center justify-between font-mono text-[11px]">
                            <div>
                              <div className="text-white font-semibold flex items-center gap-2">
                                <span>To: {l.recipient}</span>
                                <span
                                  className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                                    l.status === 'SUCCESS'
                                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                      : l.status === 'PREVIEW_ONLY'
                                      ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                                  }`}
                                >
                                  {l.status}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {new Date(l.timestamp).toLocaleTimeString()} • BTC Score: {l.btcScore}/100 • SPY Score: {l.spyScore}/100
                              </div>
                            </div>

                            {l.htmlContent && (
                              <button
                                type="button"
                                onClick={() => setPreviewHtml(l.htmlContent!)}
                                className="p-1.5 text-slate-400 hover:text-emerald-400 rounded hover:bg-slate-800 transition-colors flex items-center gap-1 text-[10px]"
                                title="View HTML Digest"
                              >
                                <Eye className="w-3.5 h-3.5" /> View
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* HTML Digest Live Preview Modal */}
      {previewHtml && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl h-[85vh] bg-[#0B0F17] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#080B11]">
              <span className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                Live Generated Email Digest Preview
              </span>
              <button
                onClick={() => setPreviewHtml(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-[#06090e] p-2">
              <iframe
                title="Email Preview"
                srcDoc={previewHtml}
                className="w-full h-full border-none rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
