import { expect } from 'chai';
import request from 'supertest';
import type {
    ClientPreferences,
    EditClientPreferencesRequest,
    SaveClientPreferencesRequest,
} from '@textyly/crossly-client-preferences-contracts';
import { createApp } from '../../src/createApp.js';
import { InMemoryPreferencesRepository } from '../../src/repository/preferencesRepository.js';

// Integration tests drive the full HTTP stack (controller -> manager -> repository)
// through supertest, using the in-memory repository so no database is required.
//
// Request/response bodies are typed with the public `contracts` package — the same
// types an external client (e.g. crossly.ui) consumes — so these tests exercise the
// published contract rather than internal types. A breaking change to a contract DTO
// breaks this test at compile time, which is intentional.
describe('preferences API (integration)', () => {
    let app: ReturnType<typeof createApp>;

    beforeEach(() => {
        app = createApp(new InMemoryPreferencesRepository());
    });

    it('GET /health returns ok', async () => {
        const response = await request(app).get('/health');

        expect(response.status).to.equal(200);
        expect(response.body).to.deep.equal({ status: 'ok' });
    });

    it('saves then reads back a client (POST then GET)', async () => {
        const payload: SaveClientPreferencesRequest = { clientId: 'user-1', theme: 'dark', language: 'bg' };

        const created = await request(app).post('/preferences').send(payload);
        expect(created.status).to.equal(201);

        const read = await request(app).get('/preferences/user-1');
        expect(read.status).to.equal(200);
        const body = read.body as ClientPreferences;
        expect(body).to.include({ clientId: 'user-1', theme: 'dark', language: 'bg' });
    });

    it('applies default theme and language on save', async () => {
        const payload: SaveClientPreferencesRequest = { clientId: 'user-2' };

        const response = await request(app).post('/preferences').send(payload);

        expect(response.status).to.equal(201);
        const body = response.body as ClientPreferences;
        expect(body).to.include({ theme: 'system', language: 'en' });
    });

    it('edits an existing client (PUT)', async () => {
        const create: SaveClientPreferencesRequest = { clientId: 'user-1', theme: 'dark' };
        await request(app).post('/preferences').send(create);

        const edit: EditClientPreferencesRequest = { theme: 'light' };
        const response = await request(app).put('/preferences/user-1').send(edit);

        expect(response.status).to.equal(200);
        const body = response.body as ClientPreferences;
        expect(body.theme).to.equal('light');
    });

    it('lists all saved clients', async () => {
        const first: SaveClientPreferencesRequest = { clientId: 'user-1' };
        const second: SaveClientPreferencesRequest = { clientId: 'user-2' };
        await request(app).post('/preferences').send(first);
        await request(app).post('/preferences').send(second);

        const response = await request(app).get('/preferences');

        expect(response.status).to.equal(200);
        const body = response.body as ClientPreferences[];
        expect(body).to.have.length(2);
    });

    it('returns 400 when clientId is missing on save', async () => {
        // Deliberately invalid against the contract (clientId is required), so this
        // payload is intentionally not typed as SaveClientPreferencesRequest.
        const response = await request(app).post('/preferences').send({ theme: 'dark' });

        expect(response.status).to.equal(400);
    });

    it('returns 404 for an unknown client', async () => {
        const response = await request(app).get('/preferences/missing');

        expect(response.status).to.equal(404);
    });
});
