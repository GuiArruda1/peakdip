module.exports = {
  apps: [
    {
      name: 'peak-trading-bot',
      script: 'node_modules/next/dist/bin/next',
      args: 'dev -p 3000',
      cwd: __dirname,
      autorestart: true,
      max_restarts: 100,
      restart_delay: 2000,
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
    },
  ],
};
