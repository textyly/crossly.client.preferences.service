import express, { type Request, type Response } from 'express';
import { PreferencesController } from './controllers/preferencesController.js';
import { PreferencesManager } from './managers/preferencesManager.js';
import { InMemoryPreferencesRepository } from './repository/preferencesRepository.js';

const app = express();
const port = 3000;

app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
});

// Composition root: wire repository -> manager -> controller.
const repository = new InMemoryPreferencesRepository();
const manager = new PreferencesManager(repository);
const controller = new PreferencesController(manager);
app.use('/preferences', controller.router);

app.listen(port, () => {
    console.log(`crossly.client.preferences.service listening on port ${port}`);
});

export default app;
