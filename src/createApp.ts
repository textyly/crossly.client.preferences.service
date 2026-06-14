import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { PreferencesController } from './controllers/preferencesController.js';
import { PreferencesManager } from './managers/preferencesManager.js';
import { requireClient } from './auth/requireClient.js';
import type { IPreferencesRepository } from './repository/types.js';

// Browser origin allowed to send the credentialed (cookie-bearing) requests.
const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5000';

/**
 * Builds the configured Express application (credentialed CORS, JSON + cookie
 * parsing, /health, and the cookie-protected preferences routes) for a given
 * repository, WITHOUT binding a port.
 *
 * The entry point (app.ts) and the integration tests share this factory so they
 * exercise the same wiring; only the injected repository differs (MongoDB at
 * runtime, in-memory in tests).
 */
export function createApp(repository: IPreferencesRepository): Express {
    const app = express();

    // Credentialed CORS so the browser sends the httpOnly session cookie.
    app.use(cors({ origin: corsOrigin, credentials: true }));
    app.use(express.json());
    app.use(cookieParser());

    app.get('/health', (_req: Request, res: Response) => {
        res.json({ status: 'ok' });
    });

    const manager = new PreferencesManager(repository);
    const controller = new PreferencesController(manager);
    // requireClient verifies the session cookie and sets req.clientId for every
    // /preferences route, so handlers only ever act on the caller's own data.
    app.use('/api/v1/preferences', requireClient, controller.router);

    return app;
}
