module.exports = {
  apps: [
    {
      name: 'stolen-app-dev',
      script: 'npm',
      args: 'run dev:network',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 8080
      },
      error_file: './logs/stolen-app-dev-error.log',
      out_file: './logs/stolen-app-dev-out.log',
      log_file: './logs/stolen-app-dev-combined.log',
      time: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 5000
    },
    {
      name: 'stolen-app-preview',
      script: 'npm',
      args: 'run preview',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 4173
      },
      error_file: './logs/stolen-app-preview-error.log',
      out_file: './logs/stolen-app-preview-out.log',
      log_file: './logs/stolen-app-preview-combined.log',
      time: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 5000
    },
    {
      name: 'server-monitor',
      script: 'server-monitor.js',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      error_file: './logs/server-monitor-error.log',
      out_file: './logs/server-monitor-out.log',
      log_file: './logs/server-monitor-combined.log',
      time: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 5000
    }
  ]
};
