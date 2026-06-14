import { Router, type Request, type Response } from 'express';
import type { IPreferencesManager } from '../managers/types.js';

/**
 * HTTP surface for the *caller's own* client preferences. Identity comes from the
 * verified session cookie (see requireClient → `req.clientId`), so there is no
 * clientId in the path or body — a client can only ever touch its own data.
 *
 * Mounted under `/preferences`:
 *   GET    /preferences -> read the caller's preferences (defaults if none saved)
 *   PATCH  /preferences -> partial update of the caller's preferences (merge)
 *   DELETE /preferences -> reset the caller's preferences to defaults
 */
export class PreferencesController {
    public readonly router: Router;

    public constructor(private readonly manager: IPreferencesManager) {
        this.router = Router();
        this.registerRoutes();
    }

    private registerRoutes(): void {
        this.router.get('/', this.get);
        this.router.patch('/', this.save);
        this.router.delete('/', this.reset);
    }

    private readonly get = async (req: Request, res: Response): Promise<void> => {
        const preferences = await this.manager.get(req.clientId as string);
        res.json(preferences);
    };

    private readonly save = async (req: Request, res: Response): Promise<void> => {
        const saved = await this.manager.save(req.clientId as string, req.body ?? {});
        res.json(saved);
    };

    private readonly reset = async (req: Request, res: Response): Promise<void> => {
        await this.manager.reset(req.clientId as string);
        res.status(204).end();
    };
}
