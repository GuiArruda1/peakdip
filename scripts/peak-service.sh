#!/usr/bin/env bash

# ==============================================================================
# PEAK TRADING BOT — 24/7 PM2 Background Daemon Manager
# ==============================================================================

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

APP_NAME="peak-trading-bot"

case "$1" in
  start)
    echo "Starting PEAK 24/7 background process..."
    npx pm2 start ecosystem.config.js
    npx pm2 save
    echo "✅ PEAK is running 24/7 in background!"
    echo "   URL: http://localhost:3000"
    echo "   Hub: http://localhost:3000/quantfury"
    ;;

  stop)
    echo "Stopping PEAK 24/7 process..."
    npx pm2 stop "$APP_NAME"
    echo "✅ Process stopped."
    ;;

  restart)
    echo "Restarting PEAK 24/7 process..."
    npx pm2 restart "$APP_NAME"
    echo "✅ Process restarted."
    ;;

  status)
    npx pm2 status
    ;;

  logs)
    npx pm2 logs "$APP_NAME"
    ;;

  autoboot)
    echo "Configuring automatic launch on macOS boot / login..."
    npx pm2 startup
    npx pm2 save
    echo "✅ Auto-boot configured."
    ;;

  keep-awake)
    echo "☕ Preventing Mac from sleeping while plugged in..."
    nohup caffeinate -dimsu > /dev/null 2>&1 &
    echo "✅ Caffeinate daemon active. Your Mac will not sleep while plugged in."
    ;;

  *)
    echo "PEAK 24/7 Service Control Tool"
    echo "Usage: $0 {start|stop|restart|status|logs|autoboot|keep-awake}"
    exit 1
    ;;
esac
