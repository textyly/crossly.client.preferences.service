import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import { PreferencesController } from './controllers/preferencesController.js';
import { PreferencesManager } from './managers/preferencesManager.js';
import type { IPreferencesRepository } from './repository/types.js';

/**
 * Builds the configured Express application (JSON middleware, /health, and the
 * preferences routes) for a given repository, WITHOUT binding a port.
 *
 * The entry point (app.ts) and the integration tests share this factory so they
 * exercise the same wiring; only the injected repository differs (MongoDB at
 * runtime, in-memory in tests).
 */
export function createApp(repository: IPreferencesRepository): Express {
    const app = express();

    app.use(cors());
    app.use(express.json());

    app.get('/health', (_req: Request, res: Response) => {
        res.json({ status: 'ok' });
    });

    const manager = new PreferencesManager(repository);
    const controller = new PreferencesController(manager);
    app.use('/preferences', controller.router);

    return app;
}
