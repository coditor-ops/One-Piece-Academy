import 'dotenv/config';
import app from './app.js';
import { startJobs } from './jobs/scheduler.js';

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
  startJobs();
});
