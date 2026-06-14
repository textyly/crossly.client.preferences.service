import { expect } from 'chai';
import { PreferencesManager } from '../../src/managers/preferencesManager.js';
import { InMemoryPreferencesRepository } from '../../src/repository/preferencesRepository.js';

describe('PreferencesManager', () => {
    let manager: PreferencesManager;

    beforeEach(() => {
        manager = new PreferencesManager(new InMemoryPreferencesRepository());
    });

    it('returns defaults for a client with nothing saved', async () => {
        const prefs = await manager.get('user-1');

        expect(prefs).to.deep.equal({
            clientId: 'user-1',
            theme: 'system',
            language: 'en',
            settings: {},
        });
    });

    it('applies defaults for fields omitted on save', async () => {
        const saved = await manager.save('user-1', {});

        expect(saved).to.include({ clientId: 'user-1', theme: 'system', language: 'en' });
        expect(saved.settings).to.deep.equal({});
    });

    it('keeps caller-provided values on save', async () => {
        const saved = await manager.save('user-1', { theme: 'dark', language: 'bg' });

        expect(saved.theme).to.equal('dark');
        expect(saved.language).to.equal('bg');
    });

    it('reads back what was saved', async () => {
        await manager.save('user-1', { theme: 'dark' });

        const found = await manager.get('user-1');

        expect(found.clientId).to.equal('user-1');
        expect(found.theme).to.equal('dark');
    });

    it('merges partial updates, preserving unspecified fields', async () => {
        await manager.save('user-1', { theme: 'dark', language: 'bg' });

        const updated = await manager.save('user-1', { theme: 'light' });

        expect(updated.theme).to.equal('light');
        expect(updated.language).to.equal('bg'); // preserved
    });

    it('scopes preferences per client', async () => {
        await manager.save('user-1', { theme: 'dark' });

        const other = await manager.get('user-2');

        expect(other.theme).to.equal('system'); // defaults, not user-1's
    });

    it('reset deletes the stored record so get returns defaults again', async () => {
        await manager.save('user-1', { theme: 'dark' });
        expect((await manager.get('user-1')).theme).to.equal('dark');

        await manager.reset('user-1');
        expect((await manager.get('user-1')).theme).to.equal('system');
    });
});
