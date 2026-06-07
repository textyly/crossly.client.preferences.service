import { expect } from 'chai';
import request from 'supertest';
import { createApp } from '../../src/createApp.js';
import { InMemoryPreferencesRepository } from '../../src/repository/preferencesRepository.js';

// Integration tests drive the full HTTP stack (controller -> manager -> repository)
// through supertest, using the in-memory repository so no database is required.
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
        const created = await request(app)
            .post('/preferences')
            .send({ clientId: 'user-1', theme: 'dark', language: 'bg' });
        expect(created.status).to.equal(201);

        const read = await request(app).get('/preferences/user-1');
        expect(read.status).to.equal(200);
        expect(read.body).to.include({ clientId: 'user-1', theme: 'dark', language: 'bg' });
    });

    it('applies default theme and language on save', async () => {
        const response = await request(app).post('/preferences').send({ clientId: 'user-2' });

        expect(response.status).to.equal(201);
        expect(response.body).to.include({ theme: 'system', language: 'en' });
    });

    it('edits an existing client (PUT)', async () => {
        await request(app).post('/preferences').send({ clientId: 'user-1', theme: 'dark' });

        const response = await request(app).put('/preferences/user-1').send({ theme: 'light' });

        expect(response.status).to.equal(200);
        expect(response.body.theme).to.equal('light');
    });

    it('lists all saved clients', async () => {
        await request(app).post('/preferences').send({ clientId: 'user-1' });
        await request(app).post('/preferences').send({ clientId: 'user-2' });

        const response = await request(app).get('/preferences');

        expect(response.status).to.equal(200);
        expect(response.body).to.have.length(2);
    });

    it('returns 400 when clientId is missing on save', async () => {
        const response = await request(app).post('/preferences').send({ theme: 'dark' });

        expect(response.status).to.equal(400);
    });

    it('returns 404 for an unknown client', async () => {
        const response = await request(app).get('/preferences/missing');

        expect(response.status).to.equal(404);
    });
});
