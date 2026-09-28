import express from 'express';
import cors from 'cors';
import { errorHandler, notFound } from './middleware/errors.js';
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/auth/users.routes.js';
import listingsRoutes from './modules/listings/listings.routes.js';
import requestsRoutes from './modules/requests/requests.routes.js';
import sessionsRoutes from './modules/sessions/sessions.routes.js';
import ratingsRoutes from './modules/ratings/ratings.routes.js';
import walletRoutes from './modules/wallet/wallet.routes.js';
import marketRoutes from './modules/market/market.routes.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/v1/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/skills', listingsRoutes);
app.use('/api/v1/requests', requestsRoutes);
app.use('/api/v1/sessions', sessionsRoutes);
app.use('/api/v1', ratingsRoutes);
app.use('/api/v1/wallet', walletRoutes);
app.use('/api/v1/market', marketRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
