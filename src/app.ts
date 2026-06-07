import { MongoClient } from 'mongodb';
import { createApp } from './createApp.js';
import { MongoPreferencesRepository } from './repository/mongoPreferencesRepository.js';

const port = 3000;
// Use 127.0.0.1 (not "localhost"): on Windows/Node "localhost" resolves to IPv6 ::1
// first, but a default mongod listens on IPv4 127.0.0.1 only.
const mongoUri = process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017';

// Entry point: connect to MongoDB, build the app via the shared factory, and listen.
const client = new MongoClient(mongoUri);
await client.connect();

const repository = new MongoPreferencesRepository(client);
const app = createApp(repository);

app.listen(port, () => {
    console.log(`crossly.client.preferences.service listening on port ${port}`);
});

export default app;
