// ============================================================================
// PEAK BRAIN GUIDES: Institutional Trading Roadmaps & Masterclasses
// Step-by-step blueprints for beginner to professional execution.
// ============================================================================

export interface BrainGuideSection {
  title: string;
  badge?: string;
  content: string;
  bullets?: string[];
  callout?: {
    type: 'tip' | 'warning' | 'pro';
    title: string;
    text: string;
  };
}

export interface BrainGuide {
  id: string;
  title: string;
  subtitle: string;
  category: 'beginner_starter' | 'instruments' | 'options' | 'crypto' | 'discipline' | 'leverage';
  readingTimeMin: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  summary: string;
  sections: BrainGuideSection[];
}

export const BRAIN_GUIDES: BrainGuide[] = [
  // --------------------------------------------------------------------------
  // GUIDE 1: HOW TO START TRADING S&P 500
  // --------------------------------------------------------------------------
  {
    id: 'how_to_trade_sp500',
    title: 'How to Start Trading the S&P 500 (Beginner to Pro)',
    subtitle: 'The complete step-by-step roadmap: instruments, European & global brokers, capital requirements, and execution timing.',
    category: 'beginner_starter',
    readingTimeMin: 7,
    difficulty: 'Beginner',
    tags: ['S&P 500', 'SPY', 'Brokers', 'Getting Started', 'Futures'],
    summary: 'The S&P 500 is the most liquid and mathematically predictable financial index in the world. This blueprint gives you the exact instruments, broker choices, account types, and timing rules needed to place your first trade safely.',
    sections: [
      {
        title: '1. What is the S&P 500 & Why is it the World’s #1 Market?',
        badge: 'Foundation',
        content: 'The Standard & Poor’s 500 tracks the 500 largest publicly traded companies in the United States, weighted by market capitalization. Over 30% of the index is concentrated in top cash-flow tech giants (Apple, Microsoft, Nvidia, Amazon, Alphabet, Meta). Because of this diversification, the S&P 500 historically recovers from all secular drawdowns, making it the premier vehicle for quantitative dip-buying.',
        bullets: [
          'Average historical annual return: ~10% over the past 50 years.',
          'Extreme liquidity: Trillions of dollars trade weekly with virtually zero slippage.',
          'Mean-reversion tendency: Extended pullbacks to the 200-day SMA have historically presented favorable risk-reward setups.',
        ],
      },
      {
        title: '2. The 3 Core Ways to Trade the S&P 500',
        badge: 'Vehicle Comparison',
        content: 'You do not buy individual shares of 500 companies; you trade synthetic or index-tracking derivatives:',
        bullets: [
          'A. Spot ETF (SPY / VOO / European UCITS like CSPX & VUAA): Safest method. Zero margin calls, zero liquidation wicks. You buy units and hold for days or months. Ideal for the PEAK $100 -> $1,000 Vanguard compounding challenge.',
          'B. Micro E-mini Futures (/MES on CME): Trades 23 hours a day, 5 days a week. High leverage with small margin (~$100-$150 per contract). Direct access to overnight gaps and European session moves.',
          'C. Options Contracts (SPY / SPX): High leverage with defined risk. You buy Calls for dips and Puts for hedges. However, options suffer from Theta decay, meaning you must manage expiration dates carefully.',
        ],
        callout: {
          type: 'tip',
          title: 'European & Portuguese Trader Tip',
          text: 'Due to EU PRIIPs regulations, European retail traders usually cannot directly buy US-domiciled ETFs like SPY through retail brokers. Instead, use UCITS equivalent ETFs (ticker CSPX, VUAA, or SXR8 on Euronext/XETRA) or trade Micro Futures (/MES) on Interactive Brokers.',
        },
      },
      {
        title: '3. Best Brokers for Trading the S&P 500',
        badge: 'Broker Setup',
        content: 'Choosing the right broker determines your fees, speed, and whether you have access to real exchange order flow:',
        bullets: [
          'Interactive Brokers (IBKR): The global institutional gold standard. Available in Portugal, Europe, US, and 150+ countries. Lowest margin rates, real CME futures (/MES), and full options access.',
          'Trade Republic / Degiro: Best for European beginners looking to accumulate physical UCITS ETFs (like VUAA or CSPX) with zero commissions and fractional shares starting at just €10.',
          'Charles Schwab / Fidelity: Top choices for US residents with commission-free stock and ETF trading.',
        ],
      },
      {
        title: '4. The 5-Step Blueprint to Your First Trade',
        badge: 'Execution Protocol',
        content: 'Follow this exact systematic protocol to avoid the standard beginner traps:',
        bullets: [
          'Step 1: Open and verify your brokerage account (opt for a Cash account first to avoid accidental margin liquidation).',
          'Step 2: Paper-trade for 10-14 days. Place limit orders and practice setting automatic stop-losses.',
          'Step 3: Consult the PEAK Terminal. Verify that composite timing score is >= 50 (or >= 70 for capitulation value).',
          'Step 4: Check the session clock! Never open fresh positions during the 16:30–18:30 Lisbon (11:30–13:30 ET) Lunch Chop Zone.',
          'Step 5: Size your risk to max 1%–2% of total account value. If your stop gets hit, cut it frictionlessly like a Tom Hougaard pro.',
        ],
        callout: {
          type: 'warning',
          title: 'Avoid CFDs (Contracts for Difference)',
          text: 'Many aggressive marketing apps push CFDs. CFDs charge exorbitant overnight financing fees and trade against the broker’s internal book. Always prioritize real ETFs or regulated CME futures.',
        },
      },
    ],
  },

  // --------------------------------------------------------------------------
  // GUIDE 2: FUTURES VS ETFS VS CFDS
  // --------------------------------------------------------------------------
  {
    id: 'futures_vs_etf_vs_cfd',
    title: 'Micro Futures (/MES) vs. SPY ETF vs. CFDs',
    subtitle: 'Which trading instrument matches your capital, schedule, and risk tolerance?',
    category: 'instruments',
    readingTimeMin: 5,
    difficulty: 'Intermediate',
    tags: ['Futures', 'MES', 'ETFs', 'CFDs', 'Leverage'],
    summary: 'A side-by-side comparison of the 3 most popular instruments for trading the S&P 500, breaking down leverage, hours, and tax advantages.',
    sections: [
      {
        title: 'Instrument Comparison Matrix',
        badge: 'Breakdown',
        content: 'Understand the structural mechanics of each instrument before committing real capital:',
        bullets: [
          'SPY / VOO ETF: $1 move in index = $1 move in share. 0x leverage. Trades 09:30–16:00 ET. Safest for beginners.',
          'Micro E-mini (/MES): $1 move in S&P 500 = $5 per contract. ~10x to 20x leverage. Trades 23 hours a day. Excellent for active intraday scalping and overnight protection.',
          'CFDs (Contracts for Difference): Synthetic derivatives offered by retail brokers. High spreads and expensive overnight holding swaps. Generally discouraged for systematic swing trading.',
        ],
        callout: {
          type: 'pro',
          title: 'The /MES Advantage',
          text: 'With /MES, you only need ~$150 in intraday margin on discount futures brokers (NinjaTrader, Tradovate, or IBKR) to trade a full micro contract representing ~$25,000 of S&P 500 equity.',
        },
      },
    ],
  },

  // --------------------------------------------------------------------------
  // GUIDE 3: OPTIONS 101 & 0DTE DANGER
  // --------------------------------------------------------------------------
  {
    id: 'options_101_and_0dte',
    title: 'Options 101: Calls, Puts & Avoiding the 0DTE Trap',
    subtitle: 'How to use options for asymmetric 5:1 reward without getting wiped out by Theta decay.',
    category: 'options',
    readingTimeMin: 6,
    difficulty: 'Intermediate',
    tags: ['Options', '0DTE', 'Theta', 'Calls', 'Puts'],
    summary: 'Options provide explosive leverage, but over 85% of retail options traders lose money because they buy out-of-the-money lotto tickets with zero time remaining. Learn how institutional desks use the 30–45 DTE sweet spot.',
    sections: [
      {
        title: 'The Anatomy of an Option',
        badge: 'Basics',
        content: 'An option gives you the right, but not the obligation, to buy (Call) or sell (Put) 100 shares of an asset at a predetermined Strike Price before an Expiration Date.',
        bullets: [
          'Call Option: Profit when price rises above Strike + Premium paid.',
          'Put Option: Profit when price drops below Strike - Premium paid.',
          'Intrinsic Value: Real mathematical in-the-money profit.',
          'Extrinsic Value (Time & Volatility): The speculative premium that decays to zero at expiration.',
        ],
      },
      {
        title: 'Why Retail Traders Lose on 0DTE Options',
        badge: 'The Trap',
        content: 'Zero Days to Expiration (0DTE) contracts expire the same afternoon. Their Theta decay curve is vertical. If the market doesn’t make a massive directional explosion within 15 minutes of your purchase, your contract rapidly loses 80% to 100% of its value.',
        bullets: [
          'The Institutional Sweet Spot: Buy 30 to 45 Days to Expiration (DTE) slightly In-The-Money (0.65 to 0.75 Delta).',
          'Benefits: Gentle Theta decay, absorbs intraday pullbacks, and allows your trade thesis time to play out.',
        ],
        callout: {
          type: 'warning',
          title: 'PEAK Copilot Warning',
          text: 'PEAK AI actively blocks recommendations for same-day 0DTE purchases in the afternoon due to negative mathematical expectancy.',
        },
      },
    ],
  },

  // --------------------------------------------------------------------------
  // GUIDE 4: BITCOIN WITH INSTITUTIONAL DISCIPLINE
  // --------------------------------------------------------------------------
  {
    id: 'bitcoin_institutional_discipline',
    title: 'How to Trade Bitcoin Dips with Institutional Discipline',
    subtitle: 'Navigating 24/7 liquidity, weekend discount drops, and perpetual futures liquidation cascades.',
    category: 'crypto',
    readingTimeMin: 6,
    difficulty: 'Beginner',
    tags: ['Bitcoin', 'Crypto', 'Sunday Discount', 'Perpetuals', 'Spot'],
    summary: 'Crypto markets run 24 hours a day without market makers during the weekend. Learn how to exploit Sunday night discount dumps and avoid leverage liquidation wicks.',
    sections: [
      {
        title: 'The 200-SMA & Sunday Night Effect',
        badge: 'Edge Analysis',
        content: 'Bitcoin follows distinct macro cyclicality. During secular bull markets, Sunday nights (between 22:00 UTC and 02:00 UTC) frequently experience liquidity air pockets as weekend market-making spreads widen. Algorithmic buying often kicks in as Asian equity desks open Monday morning.',
        bullets: [
          'Trigger Rule: Enter spot BTC only when RSI(14) is <= 30 on the 4H or daily chart.',
          'Never use > 3x leverage on Bitcoin: Weekend scam wicks can liquidate 10x positions even if the long-term direction was 100% correct.',
        ],
      },
    ],
  },

  // --------------------------------------------------------------------------
  // GUIDE 5: THE 5-POINT PRE-FLIGHT CHECKLIST
  // --------------------------------------------------------------------------
  {
    id: 'preflight_checklist',
    title: 'The 5-Point Checklist Before Clicking "Buy"',
    subtitle: 'The mandatory pre-flight routine executed by professional prop desks before entering any position.',
    category: 'discipline',
    readingTimeMin: 4,
    difficulty: 'Beginner',
    tags: ['Checklist', 'Discipline', 'Risk Control', 'Pre-Flight'],
    summary: 'Amateurs click buy on impulse; professionals treat every entry like an airplane takeoff. Verify all 5 pre-flight checks before risking a single dollar.',
    sections: [
      {
        title: 'The Pre-Flight Checklist',
        badge: 'Standard Operating Procedure',
        content: 'Print this out or check every item before pressing confirm in your broker:',
        bullets: [
          '1. Is the Timing Conviction Score >= 50? (Never buy extended markets when conviction is < 30).',
          '2. Is the setup offering at least 2.5:1 or 3:1 Asymmetry? (PTJ Rule: Never risk $1 to make less than $2.50).',
          '3. Is your Invalidation Stop-Loss predetermined and entered in the order ticket? (No mental stops).',
          '4. Are you outside the Lunch Danger Chop Zone? (Check the Lisbon 16:30–18:30 clock).',
          '5. Is total risk on this trade capped at <= 1%–2% of total equity? (Capital preservation first).',
        ],
        callout: {
          type: 'pro',
          title: 'The Mark Douglas Rule',
          text: 'If even ONE item fails this checklist, the trade is rejected. There will always be another setup tomorrow.',
        },
      },
    ],
  },

  // --------------------------------------------------------------------------
  // GUIDE 6: MASTERING LEVERAGE (ALAVANCAGEM)
  // --------------------------------------------------------------------------
  {
    id: 'mastering_leverage_alavancagem',
    title: 'Mastering Leverage (Alavancagem): Pros vs. Retail Trap',
    subtitle: 'How institutions use leverage as capital efficiency without increasing risk, and why 20x+ is mathematical ruin.',
    category: 'leverage',
    readingTimeMin: 6,
    difficulty: 'Intermediate',
    tags: ['Leverage', 'Alavancagem', 'Liquidation', 'Margin', 'Risk Control'],
    summary: 'Leverage (Alavancagem) allows you to control larger positions with less upfront collateral. However, leverage is a double-edged sword: a 10x position liquidates your account on a simple -10% drop, while a 50x position dies on a -2% market wick. Learn how pros size by risk, not by maximum borrowing power.',
    sections: [
      {
        title: '1. What is Leverage (O Que É Alavancagem)?',
        badge: 'The Basics',
        content: 'Leverage is borrowing capital from your broker to increase market exposure. If you have $1,000 in your account: At 1x (Cash/Spot), you control $1,000 of assets. At 5x leverage (like Micro Futures /MES), you control $5,000. At 20x, you control $20,000. At 100x (crypto perps/CFDs), your $1,000 controls $100,000 of notional equity.',
        bullets: [
          'Purchasing Power ≠ Risk Capacity: Just because a broker gives you 20x margin does NOT mean you should use all of it.',
          'Gains and losses are magnified equally: If your $1,000 account controls $10,000 (10x), a +5% move makes +$500 (+50% gain), but a -5% move loses -$500 (-50% loss!).',
        ],
      },
      {
        title: '2. The Mathematics of Liquidation (Threshold Formula)',
        badge: 'Liquidation Math',
        content: 'Your liquidation threshold is the exact percentage drop where your losses equal 100% of your account collateral:',
        bullets: [
          'Liquidation Drop % = 100% / Leverage Multiplier',
          'At 1x: Asset must drop -100% (impossible for diversified indices like the S&P 500).',
          'At 5x: Account is liquidated on a -20.0% bear market crash.',
          'At 10x: Account is liquidated on a -10.0% standard intermediate correction.',
          'At 20x: Account is wiped out on a -5.0% move (a normal intraday volatility wick!).',
          'At 50x to 100x: Account is wiped out on a -1.0% to -2.0% random noise wobble. Over 20 trades, liquidation probability is virtually 100%.',
        ],
        callout: {
          type: 'warning',
          title: 'The Crypto & CFD Trap',
          text: 'Offshore crypto and retail CFD brokers heavily advertise 50x to 100x leverage because they know the mathematical odds: random market noise will liquidate your account within days, and the broker keeps the spread and fees.',
        },
      },
      {
        title: '3. Nominal Leverage vs. Effective Leverage',
        badge: 'The Institutional Secret',
        content: 'In "Market Wizards", legendary macro trader Bruce Kovner explains how hedge funds use futures contracts with 15x nominal leverage while maintaining conservative 1x effective leverage:',
        bullets: [
          'Nominal Leverage: What the exchange requires as collateral (e.g. CME requires ~$150 margin for 1 /MES contract worth ~$29,000).',
          'Effective Leverage: How much total dollar risk you expose to your total net worth.',
          'Example: You have a $10,000 account. You trade 1 Micro contract (/MES). You only put up ~$150 margin, but your stop-loss is set at 20 points ($100). Your real risk on the trade is exactly 1.0% ($100 / $10,000). This is safe, disciplined execution!',
        ],
        callout: {
          type: 'pro',
          title: 'The Bruce Kovner Rule',
          text: 'Size your trade based on your invalidation stop-loss in dollars, NEVER by the maximum margin the broker permits you to borrow.',
        },
      },
      {
        title: '4. Summary Rules for Safe Leverage Execution',
        badge: 'Execution Rules',
        content: 'Follow these 4 non-negotiable rules to avoid ever suffering a margin call:',
        bullets: [
          'Rule 1: Never trade > 5x effective leverage on swing trades (Spot ETFs or 1-2 Micro contracts).',
          'Rule 2: Never use leverage on Bitcoin or volatile crypto beyond 2x or 3x due to weekend liquidation wicks.',
          'Rule 3: Always place a hard Stop-Loss in the market the exact millisecond you enter.',
          'Rule 4: If you want explosive upside, use defined-risk Options (30-45 DTE) or 1.618R asymmetric targets, not high leverage.',
        ],
      },
    ],
  },
];

