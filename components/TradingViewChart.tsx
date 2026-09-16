'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  createSeriesMarkers,
  ColorType,
  CrosshairMode,
  IChartApi,
  ISeriesApi,
} from 'lightweight-charts';
import { OHLCVCandle, CalculatedIndicators } from '@/lib/types';
import { Maximize2, BarChart2, Sparkles } from 'lucide-react';

interface TradingViewChartProps {
  candles: OHLCVCandle[];
  indicators: CalculatedIndicators;
  markers: any[];
  symbol: string;
  loading: boolean;
}

export default function TradingViewChart({
  candles,
  indicators,
  markers,
  symbol,
  loading,
}: TradingViewChartProps) {
  const mainChartContainerRef = useRef<HTMLDivElement>(null);
  const rsiChartContainerRef = useRef<HTMLDivElement>(null);

  const mainChartRef = useRef<IChartApi | null>(null);
  const rsiChartRef = useRef<IChartApi | null>(null);

  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const sma200SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const sma50SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const rsiSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  const [hoverData, setHoverData] = useState<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    sma200?: number | null;
    rsi?: number | null;
  } | null>(null);

  const [selectedRange, setSelectedRange] = useState<'6M' | '1Y' | '3Y' | 'ALL'>('1Y');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const checkTheme = () => {
      const isLight = document.documentElement.classList.contains('light');
      setTheme(isLight ? 'light' : 'dark');
    };
    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!mainChartContainerRef.current || !rsiChartContainerRef.current || candles.length === 0) {
      return;
    }

    // Safe chart cleanup
    const cleanupCharts = () => {
      if (mainChartRef.current) {
        try {
          mainChartRef.current.remove();
        } catch (_) {}
        mainChartRef.current = null;
      }
      if (rsiChartRef.current) {
        try {
          rsiChartRef.current.remove();
        } catch (_) {}
        rsiChartRef.current = null;
      }
      if (mainChartContainerRef.current) {
        mainChartContainerRef.current.innerHTML = '';
      }
      if (rsiChartContainerRef.current) {
        rsiChartContainerRef.current.innerHTML = '';
      }
    };

    cleanupCharts();

    const isLight = theme === 'light';
    const chartBg = isLight ? '#FFFFFF' : '#0B0F17';
    const gridColor = isLight ? '#F1F5F9' : '#161F2E';
    const textColor = isLight ? '#475569' : '#64748B';
    const borderColor = isLight ? '#E2E8F0' : '#1F293D';

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const initialMainHeight = isMobile ? 270 : 380;
    const initialRsiHeight = isMobile ? 100 : 140;

    // 1. Initialize Main Candlestick Chart
    const mainChart = createChart(mainChartContainerRef.current, {
      width: mainChartContainerRef.current.clientWidth,
      height: initialMainHeight,
      layout: {
        background: { type: ColorType.Solid, color: chartBg },
        textColor,
        fontSize: isMobile ? 10 : 11,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor,
        scaleMargins: { top: 0.1, bottom: 0.15 },
      },
      timeScale: {
        borderColor,
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candleSeries = mainChart.addSeries(CandlestickSeries, {
      upColor: '#10B981',
      downColor: '#EF4444',
      borderUpColor: '#10B981',
      borderDownColor: '#EF4444',
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444',
    });

    const sma200Series = mainChart.addSeries(LineSeries, {
      color: '#F59E0B', // Amber
      lineWidth: 2,
      title: '200 SMA',
    });

    const sma50Series = mainChart.addSeries(LineSeries, {
      color: '#38BDF8', // Cyan
      lineWidth: 1,
      lineStyle: 0,
      title: '50 SMA',
    });

    // 2. Initialize RSI Sub-Chart
    const rsiChart = createChart(rsiChartContainerRef.current, {
      width: rsiChartContainerRef.current.clientWidth,
      height: initialRsiHeight,
      layout: {
        background: { type: ColorType.Solid, color: chartBg },
        textColor,
        fontSize: 10,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor,
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor,
        visible: true,
      },
    });

    const rsiSeries = rsiChart.addSeries(LineSeries, {
      color: '#A855F7', // Purple
      lineWidth: 2,
      title: 'RSI(14)',
    });

    // Add RSI Overbought (70) and Oversold (30) reference lines
    rsiSeries.createPriceLine({
      price: 70,
      color: '#EF4444',
      lineWidth: 1,
      lineStyle: 2,
      axisLabelVisible: true,
      title: '70 OVERBOUGHT',
    });

    rsiSeries.createPriceLine({
      price: symbol.includes('BTC') ? 30 : 35,
      color: '#10B981',
      lineWidth: 1,
      lineStyle: 2,
      axisLabelVisible: true,
      title: symbol.includes('BTC') ? '30 OVERSOLD' : '35 OVERSOLD',
    });

    // 3. Format & Set Data
    // Ensure chronological order
    const formattedCandles = candles.map((c) => ({
      time: c.time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    const formattedSma200 = indicators.sma200
      .map((p, i) => (p ? { time: candles[i].time, value: p.value } : null))
      .filter((p): p is { time: string; value: number } => p !== null);

    const formattedSma50 = indicators.sma50
      .map((p, i) => (p ? { time: candles[i].time, value: p.value } : null))
      .filter((p): p is { time: string; value: number } => p !== null);

    const formattedRsi = indicators.rsi14
      .map((p, i) => (p ? { time: candles[i].time, value: p.value } : null))
      .filter((p): p is { time: string; value: number } => p !== null);

    candleSeries.setData(formattedCandles);
    sma200Series.setData(formattedSma200);
    sma50Series.setData(formattedSma50);
    rsiSeries.setData(formattedRsi);

    // 4. Set Historical Dip Markers
    if (markers && markers.length > 0) {
      try {
        const sortedMarkers = [...markers]
          .sort((a, b) => (a.time > b.time ? 1 : a.time < b.time ? -1 : 0))
          .filter((item, index, self) => index === self.findIndex((m) => m.time === item.time));
        createSeriesMarkers(candleSeries, sortedMarkers);
      } catch (e) {
        console.warn('Failed to set series markers:', e);
      }
    }

    // 5. Synchronize Crosshair & Time Scale between main and RSI chart
    let isSyncing = false;
    const mainTimeScale = mainChart.timeScale();
    const rsiTimeScale = rsiChart.timeScale();

    mainTimeScale.subscribeVisibleLogicalRangeChange((range) => {
      if (isSyncing || !range) return;
      isSyncing = true;
      rsiTimeScale.setVisibleLogicalRange(range);
      isSyncing = false;
    });

    rsiTimeScale.subscribeVisibleLogicalRangeChange((range) => {
      if (isSyncing || !range) return;
      isSyncing = true;
      mainTimeScale.setVisibleLogicalRange(range);
      isSyncing = false;
    });

    // Hover tooltip subscription
    mainChart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || !param.seriesData) {
        return;
      }
      const candleData = param.seriesData.get(candleSeries) as any;
      const smaData = param.seriesData.get(sma200Series) as any;
      const rsiVal = indicators.rsi14.find((item) => item?.time === param.time)?.value;

      if (candleData) {
        setHoverData({
          date: param.time as string,
          open: candleData.open,
          high: candleData.high,
          low: candleData.low,
          close: candleData.close,
          sma200: smaData ? smaData.value : null,
          rsi: rsiVal ?? null,
        });
      }
    });

    // 6. Handle Responsive Resize
    const handleResize = () => {
      const mobile = window.innerWidth < 640;
      if (mainChartContainerRef.current) {
        mainChart.applyOptions({
          width: mainChartContainerRef.current.clientWidth,
          height: mobile ? 270 : 380,
        });
      }
      if (rsiChartContainerRef.current) {
        rsiChart.applyOptions({
          width: rsiChartContainerRef.current.clientWidth,
          height: mobile ? 100 : 140,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    // Zoom to selected default range
    mainTimeScale.fitContent();

    mainChartRef.current = mainChart;
    rsiChartRef.current = rsiChart;
    candleSeriesRef.current = candleSeries;
    sma200SeriesRef.current = sma200Series;
    sma50SeriesRef.current = sma50Series;
    rsiSeriesRef.current = rsiSeries;

    return () => {
      window.removeEventListener('resize', handleResize);
      cleanupCharts();
    };
  }, [candles, indicators, markers, symbol, theme]);

  const handleZoom = (range: '6M' | '1Y' | '3Y' | 'ALL') => {
    setSelectedRange(range);
    if (!mainChartRef.current || candles.length === 0) return;

    const timeScale = mainChartRef.current.timeScale();
    if (range === 'ALL') {
      timeScale.fitContent();
      return;
    }

    const days = range === '6M' ? 180 : range === '1Y' ? 365 : 1095;
    const fromIdx = Math.max(0, candles.length - days);
    timeScale.setVisibleRange({
      from: candles[fromIdx].time as any,
      to: candles[candles.length - 1].time as any,
    });
  };

  const latestCandle = candles[candles.length - 1];

  const askAdvisorAboutChart = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('open-copilot-query', {
          detail: {
            query: `What is happening in real time on the Layer 3 chart for ${symbol} right now?`,
          },
        })
      );
    }
  };

  return (
    <div className="bg-[#0F1420] border border-slate-800/90 rounded-2xl p-4 lg:p-6 shadow-xl relative">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <BarChart2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
              {symbol} Multi-Layer Dip Analysis Chart
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              TradingView Lightweight Engine • 200 SMA Overlay • Historical Dip Buy Signals
            </span>
          </div>
        </div>

        {/* Right Controls: AI Readout Button & Range Selectors */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Ask PEAK AI Advisor Button */}
          <button
            onClick={askAdvisorAboutChart}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono font-bold rounded-lg bg-gradient-to-r from-emerald-950/90 via-cyan-950/90 to-slate-900 hover:from-emerald-900 hover:to-cyan-900 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-white transition-all shadow-md cursor-pointer group"
            title="Ask PEAK AI Live Advisor: What is happening in real time on this Layer 3 chart right now?"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform animate-pulse" />
            <span className="hidden sm:inline">AI Chart Readout</span>
            <span className="sm:hidden">AI Readout</span>
          </button>

          {/* Range Buttons */}
          <div className="flex items-center gap-1 bg-[#080B11] p-1 rounded-lg border border-slate-800">
            {(['6M', '1Y', '3Y', 'ALL'] as const).map((r) => (
              <button
                key={r}
                onClick={() => handleZoom(r)}
                className={`px-2.5 py-1 text-[11px] font-mono font-semibold rounded-md transition-all ${
                  selectedRange === r
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Crosshair Tooltip / Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 my-3 text-xs font-mono bg-[#080B11]/70 px-3 py-2 rounded-lg border border-slate-800/60">
        <div className="text-slate-400">
          Date: <span className="text-white font-medium">{hoverData ? hoverData.date : latestCandle?.time || '—'}</span>
        </div>
        <div>
          O: <span className="text-slate-200">${hoverData ? hoverData.open : latestCandle?.open || '—'}</span>
        </div>
        <div>
          H: <span className="text-slate-200">${hoverData ? hoverData.high : latestCandle?.high || '—'}</span>
        </div>
        <div>
          L: <span className="text-slate-200">${hoverData ? hoverData.low : latestCandle?.low || '—'}</span>
        </div>
        <div>
          C:{' '}
          <span className="text-emerald-400 font-bold">
            ${hoverData ? hoverData.close : latestCandle?.close || '—'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
          <span className="text-slate-400">
            200 SMA:{' '}
            <span className="text-amber-400 font-medium">
              ${hoverData?.sma200 ? hoverData.sma200.toLocaleString() : '—'}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-500 inline-block"></span>
          <span className="text-slate-400">
            RSI(14):{' '}
            <span className="text-purple-400 font-bold">
              {hoverData?.rsi !== undefined && hoverData?.rsi !== null ? hoverData.rsi : '—'}
            </span>
          </span>
        </div>
      </div>

      {/* Main Candlestick Chart */}
      <div className="relative w-full rounded-xl overflow-hidden border border-slate-800/80">
        {loading && (
          <div className="absolute inset-0 z-20 bg-[#0B0F17]/80 flex items-center justify-center backdrop-blur-sm">
            <span className="font-mono text-xs text-emerald-400 animate-pulse">
              Rendering chart & analytical overlays...
            </span>
          </div>
        )}
        <div ref={mainChartContainerRef} className="w-full" />
      </div>

      {/* RSI Sub-Chart Header & Container */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1 mb-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-purple-400">RSI (14-period Wilder)</span>
            <span>• Reference: &lt;30 Oversold / &gt;70 Overbought</span>
          </div>
          <span className="text-[10px] text-slate-500">Synchronized Time Scale</span>
        </div>
        <div className="relative w-full rounded-xl overflow-hidden border border-slate-800/80">
          <div ref={rsiChartContainerRef} className="w-full" />
        </div>
      </div>
    </div>
  );
}
