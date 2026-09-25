import path from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createApp } from './backend/app';
import { ENV } from './backend/config/env';
import { testDbConnection } from './backend/config/db';

async function startServer() {
  const app = createApp();
  const PORT = ENV.PORT;

  // Mount Vite middleware for client-side development or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', async () => {
    console.log(`====================================================`);
    console.log(`🎓 SMART EXAMINATION PORTAL - BACKEND SERVER`);
    console.log(`🚀 Running at: http://localhost:${PORT}`);
    console.log(`🩺 Health API: http://localhost:${PORT}/api/health`);
    console.log(`ℹ️ System Info: http://localhost:${PORT}/api/info`);
    console.log(`====================================================`);
    
    // Test database connection asynchronously on startup
    await testDbConnection();
  });
}

startServer();
