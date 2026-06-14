import { expect } from 'chai';
import request from 'supertest';
import { SignJWT } from 'jose';
import type {
    ClientPreferences,
    SaveClientPreferencesRequest,
} from '@textyly/crossly-client-preferences-contracts';
import { createApp } from '../../src/createApp.js';
import { InMemoryPreferencesRepository } from '../../src/repository/preferencesRepository.js';

// Integration tests drive the full HTTP stack (requireClient -> controller ->
// manager -> repository) through supertest, using the in-memory repository so no
// database is required. Identity is asserted via a session cookie carrying a JWT
// minted with the shared dev secret — exactly what the auth service issues.
const secret = new TextEncoder().encode('dev-only-insecure-secret-change-me');

async function sessionCookie(clientId: string, guest = false): Promise<string> {
    const token = await new SignJWT({ guest })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(clientId)
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(secret);
    return `crossly_session=${token}`;
}

describe('preferences API (integration, cookie auth)', () => {
    let app: ReturnType<typeof createApp>;

    beforeEach(() => {
        app = createApp(new InMemoryPreferencesRepository());
    });

    it('GET /health returns ok (no auth required)', async () => {
        const response = await request(app).get('/health');
        expect(response.status).to.equal(200);
        expect(response.body).to.deep.equal({ status: 'ok' });
    });

    it('rejects /preferences with no session cookie (401)', async () => {
        expect((await request(app).get('/api/v1/preferences')).status).to.equal(401);
        expect((await request(app).patch('/api/v1/preferences').send({ theme: 'dark' })).status).to.equal(
            401,
        );
    });

    it('rejects an invalid/tampered session cookie (401)', async () => {
        const response = await request(app)
            .get('/api/v1/preferences')
            .set('Cookie', 'crossly_session=not-a-jwt');
        expect(response.status).to.equal(401);
    });

    it("saves then reads back the caller's own preferences", async () => {
        const cookie = await sessionCookie('user-1');
        const payload: SaveClientPreferencesRequest = { theme: 'dark', language: 'bg' };

        const put = await request(app).patch('/api/v1/preferences').set('Cookie', cookie).send(payload);
        expect(put.status).to.equal(200);

        const get = await request(app).get('/api/v1/preferences').set('Cookie', cookie);
        expect(get.status).to.equal(200);
        const body = get.body as ClientPreferences;
        expect(body).to.include({ clientId: 'user-1', theme: 'dark', language: 'bg' });
    });

    it('returns defaults when nothing is saved', async () => {
        const response = await request(app)
            .get('/api/v1/preferences')
            .set('Cookie', await sessionCookie('fresh-user'));

        expect(response.status).to.equal(200);
        expect(response.body as ClientPreferences).to.include({ theme: 'system', language: 'en' });
    });

    it('merges partial updates, preserving unspecified fields', async () => {
        const cookie = await sessionCookie('user-1');
        await request(app)
            .patch('/api/v1/preferences')
            .set('Cookie', cookie)
            .send({ theme: 'dark', language: 'bg' });

        const response = await request(app)
            .patch('/api/v1/preferences')
            .set('Cookie', cookie)
            .send({ theme: 'light' });

        const body = response.body as ClientPreferences;
        expect(body.theme).to.equal('light');
        expect(body.language).to.equal('bg');
    });

    it('scopes preferences to the caller (different cookie = different data)', async () => {
        await request(app)
            .patch('/api/v1/preferences')
            .set('Cookie', await sessionCookie('user-1'))
            .send({ theme: 'dark' });

        const other = await request(app)
            .get('/api/v1/preferences')
            .set('Cookie', await sessionCookie('user-2'));

        expect((other.body as ClientPreferences).theme).to.equal('system'); // defaults
    });

    it('DELETE resets preferences to defaults', async () => {
        const cookie = await sessionCookie('user-1');
        await request(app).patch('/api/v1/preferences').set('Cookie', cookie).send({ theme: 'dark' });

        const deleted = await request(app).delete('/api/v1/preferences').set('Cookie', cookie);
        expect(deleted.status).to.equal(204);

        const after = await request(app).get('/api/v1/preferences').set('Cookie', cookie);
        expect((after.body as ClientPreferences).theme).to.equal('system'); // back to defaults
    });

    it('rejects DELETE with no session cookie (401)', async () => {
        expect((await request(app).delete('/api/v1/preferences')).status).to.equal(401);
    });
});
