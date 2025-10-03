import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 8081,
    fs: {
      strict: false
    },
    proxy: {
      '/api/v1/lost-found/reports': {
        target: 'https://lerjhxchglztvhbsdjjn.supabase.co/functions/v1/lost-found-reports',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1\/lost-found\/reports/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
      '/api/v1/lost-found/community/stats': {
        target: 'https://lerjhxchglztvhbsdjjn.supabase.co/functions/v1/lost-found-reports',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1\/lost-found\/community\/stats/, '/stats'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
      '/api/v1/community-tips': {
        target: 'https://lerjhxchglztvhbsdjjn.supabase.co/functions/v1/community-tips',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1\/community-tips/, '')
      },
      '/api/v1/device-matches': {
        target: 'https://lerjhxchglztvhbsdjjn.supabase.co/functions/v1/device-matches',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1\/device-matches/, '')
      },
      '/api/v1/notifications': {
        target: 'https://lerjhxchglztvhbsdjjn.supabase.co/functions/v1/notifications',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1\/notifications/, '')
      },
      '/api/v1/community-events': {
        target: 'https://lerjhxchglztvhbsdjjn.supabase.co/functions/v1/community-events',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1\/community-events/, '')
      },
      '/api/v1/success-stories': {
        target: 'https://lerjhxchglztvhbsdjjn.supabase.co/functions/v1/success-stories',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1\/success-stories/, '')
      },
      '/api/v1/send-contact-notification': {
        target: 'https://lerjhxchglztvhbsdjjn.supabase.co/functions/v1/send-contact-notification',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1\/send-contact-notification/, '')
      },
      '/api/v1/admin/dashboard-stats': {
        target: 'https://lerjhxchglztvhbsdjjn.supabase.co/functions/v1/admin-dashboard-stats',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1\/admin\/dashboard-stats/, '')
      },
      '/api/v1/admin/approve-report': {
        target: 'https://lerjhxchglztvhbsdjjn.supabase.co/functions/v1/admin-approve-report',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1\/admin\/approve-report/, '')
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

