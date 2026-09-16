import { MarketDigestData } from './types';

export function renderMarketDigestHTML(data: MarketDigestData): string {
  const { generatedAt, btc, spy } = data;

  const renderAssetCard = (
    name: string,
    symbol: string,
    asset: typeof btc,
    accentColor: string
  ) => {
    const isDip = asset.score >= 50;
    const badgeBg =
      asset.score >= 70
        ? '#064e3b'
        : asset.score >= 50
        ? '#164e63'
        : asset.score < 30
        ? '#78350f'
        : '#1e293b';

    const badgeText =
      asset.score >= 70
        ? '#6ee7b7'
        : asset.score >= 50
        ? '#67e8f9'
        : asset.score < 30
        ? '#fcd34d'
        : '#94a3b8';

    return `
      <div style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <!-- Card Header -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px;">
          <tr>
            <td align="left">
              <div style="font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace; font-size: 18px; font-weight: 700; color: #ffffff;">
                ${name} <span style="font-size: 13px; color: #64748b; font-weight: 600;">(${symbol})</span>
              </div>
              <div style="font-family: monospace; font-size: 22px; font-weight: 800; color: #ffffff; margin-top: 4px;">
                $${asset.price.toLocaleString()}
                <span style="font-size: 14px; font-weight: 600; color: ${
                  asset.change24h >= 0 ? '#10b981' : '#f43f5e'
                };">
                  ${asset.change24h >= 0 ? '+' : ''}${asset.change24h.toFixed(2)}%
                </span>
              </div>
            </td>
            <td align="right" valign="top">
              <div style="display: inline-block; background-color: ${badgeBg}; color: ${badgeText}; border: 1px solid ${accentColor}40; border-radius: 8px; padding: 6px 12px; font-family: monospace; font-size: 12px; font-weight: 700; text-align: center;">
                SCORE: ${asset.score}/100<br/>
                <span style="font-size: 10px; font-weight: 800; letter-spacing: 0.5px;">${asset.signalLabel.replace(/_/g, ' ')}</span>
              </div>
            </td>
          </tr>
        </table>

        <!-- Key Metrics Grid -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #090d16; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
          <tr>
            <td width="33%" style="padding: 6px 8px; border-right: 1px solid #1e293b;">
              <div style="font-family: monospace; font-size: 10px; color: #64748b; text-transform: uppercase;">RSI(14) Wilder</div>
              <div style="font-family: monospace; font-size: 14px; font-weight: 700; color: ${
                asset.rsi14 < 35 ? '#10b981' : asset.rsi14 > 65 ? '#f59e0b' : '#cbd5e1'
              }; margin-top: 2px;">
                ${asset.rsi14.toFixed(1)}
              </div>
            </td>
            <td width="33%" style="padding: 6px 8px; border-right: 1px solid #1e293b;">
              <div style="font-family: monospace; font-size: 10px; color: #64748b; text-transform: uppercase;">200-SMA Retest</div>
              <div style="font-family: monospace; font-size: 14px; font-weight: 700; color: #cbd5e1; margin-top: 2px;">
                ${asset.dist200Pct > 0 ? '+' : ''}${asset.dist200Pct.toFixed(1)}%
              </div>
            </td>
            <td width="33%" style="padding: 6px 8px;">
              <div style="font-family: monospace; font-size: 10px; color: #64748b; text-transform: uppercase;">Drawdown Z-Score</div>
              <div style="font-family: monospace; font-size: 14px; font-weight: 700; color: ${
                asset.drawdownZScore <= -2.5 ? '#10b981' : '#cbd5e1'
              }; margin-top: 2px;">
                ${asset.drawdownZScore.toFixed(2)}σ
              </div>
            </td>
          </tr>
          <tr>
            <td width="33%" style="padding: 10px 8px 4px 8px; border-right: 1px solid #1e293b;">
              <div style="font-family: monospace; font-size: 10px; color: #64748b; text-transform: uppercase;">Sentiment Panic</div>
              <div style="font-family: monospace; font-size: 13px; font-weight: 700; color: #cbd5e1; margin-top: 2px;">
                ${asset.sentimentVal} <span style="font-size: 11px; color: #94a3b8;">(${asset.sentimentLabel})</span>
              </div>
            </td>
            <td width="33%" style="padding: 10px 8px 4px 8px; border-right: 1px solid #1e293b;">
              <div style="font-family: monospace; font-size: 10px; color: #64748b; text-transform: uppercase;">ML Market Regime</div>
              <div style="font-family: monospace; font-size: 13px; font-weight: 700; color: ${
                asset.regime === 'BULL_TREND' ? '#10b981' : asset.regime === 'BEAR_TREND' ? '#f43f5e' : '#f59e0b'
              }; margin-top: 2px;">
                ${asset.regime}
              </div>
            </td>
            <td width="33%" style="padding: 10px 8px 4px 8px;">
              <div style="font-family: monospace; font-size: 10px; color: #64748b; text-transform: uppercase;">14d Win Probability</div>
              <div style="font-family: monospace; font-size: 13px; font-weight: 700; color: #10b981; margin-top: 2px;">
                ${asset.winProb14d}%
              </div>
            </td>
          </tr>
        </table>

        <!-- Executive Advice Box -->
        <div style="background-color: ${
          isDip ? 'rgba(16, 185, 129, 0.08)' : 'rgba(30, 41, 59, 0.5)'
        }; border-left: 4px solid ${accentColor}; padding: 12px 14px; border-radius: 4px;">
          <div style="font-family: monospace; font-size: 11px; font-weight: 700; color: ${accentColor}; text-transform: uppercase;">
            Executive Verdict: ${asset.verdict}
          </div>
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; color: #e2e8f0; margin-top: 4px; line-height: 1.4;">
            ${asset.action}
          </div>
          <div style="font-family: monospace; font-size: 12px; color: #f59e0b; margin-top: 6px;">
            🛡️ Recommended Invalidation Stop-Loss: <strong>$${asset.stopLossPrice.toFixed(2)}</strong> (-${asset.stopLossPct.toFixed(1)}%)
          </div>
        </div>
      </div>
    `;
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>PEAK Dip Hunter • Hourly Market Timing Digest</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #06090e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #cbd5e1;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #06090e; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Container -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 640px; background-color: #0b0f17; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
          <!-- Header -->
          <tr>
            <td style="padding: 28px 24px; background: linear-gradient(135deg, #0b0f17 0%, #0f172a 100%); border-bottom: 1px solid #1e293b;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <div style="display: inline-block; background-color: #064e3b; color: #34d399; font-family: monospace; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                      ● LIVE HOURLY DISPATCH
                    </div>
                    <div style="font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                      PEAK Dip Hunter Intelligence
                    </div>
                    <div style="font-family: monospace; font-size: 12px; color: #64748b; margin-top: 4px;">
                      Generated on ${new Date(generatedAt).toUTCString()}
                    </div>
                  </td>
                  <td align="right">
                    <a href="http://localhost:3000" target="_blank" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; font-family: monospace; font-size: 11px; font-weight: 700; padding: 8px 14px; border-radius: 8px;">
                      Open Terminal →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 24px 24px 8px 24px;">
              <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 0 0 20px 0;">
                Here is your automated hourly executive timing report, tracking the 5 core quantitative triggers, machine learning market regimes, and asymmetrical dip opportunities across Crypto and Equities.
              </p>

              <!-- Bitcoin Section -->
              ${renderAssetCard('Bitcoin', 'BTC/USDT', btc, '#10b981')}

              <!-- S&P 500 Section -->
              ${renderAssetCard('S&P 500 ETF', 'SPY', spy, '#06b6d4')}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 24px; background-color: #080c14; border-top: 1px solid #1e293b; text-align: center;">
              <p style="font-family: monospace; font-size: 11px; color: #64748b; margin: 0 0 8px 0;">
                PEAK Timing & Dip Hunter Engine • 4-Layer Quantitative System
              </p>
              <p style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 10px; color: #475569; margin: 0; line-height: 1.4;">
                This automated digest is generated for systematic timing and risk management. Past performance does not guarantee future results.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
