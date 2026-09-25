import { createApp } from './app';
import { ENV } from './config/env';
import { testDbConnection } from './config/db';

const app = createApp();
const PORT = ENV.PORT || 5000;

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`====================================================`);
  console.log(`🎓 Smart Examination Portal - Standalone Backend API`);
  console.log(`🚀 Server listening on port: ${PORT}`);
  console.log(`🩺 Health API: http://localhost:${PORT}/api/health`);
  console.log(`ℹ️ Info API: http://localhost:${PORT}/api/info`);
  console.log(`====================================================`);

  // Test MySQL connection
  await testDbConnection();
});
