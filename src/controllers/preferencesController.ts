import { Router, type Request, type Response } from 'express';
import type { IPreferencesManager } from '../managers/types.js';

/**
 * HTTP surface for client preferences. Translates requests/responses and
 * delegates all work to the {@link IPreferencesManager}.
 *
 * Mounted under `/preferences`:
 *   GET    /preferences            -> list all
 *   GET    /preferences/:clientId  -> read one
 *   POST   /preferences            -> save (create)
 *   PUT    /preferences/:clientId  -> edit (update)
 */
export class PreferencesController {
    public readonly router: Router;

    public constructor(private readonly manager: IPreferencesManager) {
        this.router = Router();
        this.registerRoutes();
    }

    private registerRoutes(): void {
        this.router.get('/', this.getAll);
        this.router.get('/:clientId', this.getById);
        this.router.post('/', this.save);
        this.router.put('/:clientId', this.edit);
    }

    private readonly getAll = async (_req: Request, res: Response): Promise<void> => {
        const all = await this.manager.getAll();
        res.json(all);
    };

    private readonly getById = async (req: Request, res: Response): Promise<void> => {
        const found = await this.manager.getById(req.params.clientId);
        if (!found) {
            res.status(404).json({ error: 'preferences not found' });
            return;
        }
        res.json(found);
    };

    private readonly save = async (req: Request, res: Response): Promise<void> => {
        const clientId: unknown = req.body?.clientId;
        if (typeof clientId !== 'string' || clientId.length === 0) {
            res.status(400).json({ error: 'clientId is required' });
            return;
        }

        const saved = await this.manager.save(req.body);
        res.status(201).json(saved);
    };

    private readonly edit = async (req: Request, res: Response): Promise<void> => {
        const updated = await this.manager.edit(req.params.clientId, req.body ?? {});
        if (!updated) {
            res.status(404).json({ error: 'preferences not found' });
            return;
        }
        res.json(updated);
    };
}
