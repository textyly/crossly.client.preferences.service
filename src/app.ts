import express, { type Request, type Response } from 'express';
import { MongoClient } from 'mongodb';
import { PreferencesController } from './controllers/preferencesController.js';
import { PreferencesManager } from './managers/preferencesManager.js';
import { MongoPreferencesRepository } from './repository/mongoPreferencesRepository.js';

const app = express();
const port = 3000;
// Use 127.0.0.1 (not "localhost"): on Windows/Node "localhost" resolves to IPv6 ::1
// first, but a default mongod listens on IPv4 127.0.0.1 only.
const mongoUri = process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017';

app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
});

// Composition root: connect to MongoDB, then wire repository -> manager -> controller.
// For a database-free run, swap MongoPreferencesRepository for InMemoryPreferencesRepository.
const client = new MongoClient(mongoUri);
await client.connect();
const repository = new MongoPreferencesRepository(client);
const manager = new PreferencesManager(repository);
const controller = new PreferencesController(manager);
app.use('/preferences', controller.router);

app.listen(port, () => {
    console.log(`crossly.client.preferences.service listening on port ${port}`);
});

export default app;
