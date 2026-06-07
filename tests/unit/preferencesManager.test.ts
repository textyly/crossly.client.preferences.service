import { expect } from 'chai';
import { PreferencesManager } from '../../src/managers/preferencesManager.js';
import { InMemoryPreferencesRepository } from '../../src/repository/preferencesRepository.js';

describe('PreferencesManager', () => {
    let manager: PreferencesManager;

    beforeEach(() => {
        manager = new PreferencesManager(new InMemoryPreferencesRepository());
    });

    it('applies default theme and language when omitted on save', async () => {
        const saved = await manager.save({ clientId: 'user-1' });

        expect(saved.theme).to.equal('system');
        expect(saved.language).to.equal('en');
        expect(saved.settings).to.deep.equal({});
    });

    it('keeps caller-provided values on save', async () => {
        const saved = await manager.save({ clientId: 'user-1', theme: 'dark', language: 'bg' });

        expect(saved.theme).to.equal('dark');
        expect(saved.language).to.equal('bg');
    });

    it('reads a saved client by id', async () => {
        await manager.save({ clientId: 'user-1', theme: 'dark' });

        const found = await manager.getById('user-1');

        expect(found?.clientId).to.equal('user-1');
    });

    it('returns undefined for an unknown client', async () => {
        expect(await manager.getById('missing')).to.equal(undefined);
    });

    it('lists all saved clients', async () => {
        await manager.save({ clientId: 'user-1' });
        await manager.save({ clientId: 'user-2' });

        const all = await manager.getAll();

        expect(all).to.have.length(2);
    });

    it('edits an existing client', async () => {
        await manager.save({ clientId: 'user-1', theme: 'dark' });

        const updated = await manager.edit('user-1', { theme: 'light' });

        expect(updated?.theme).to.equal('light');
    });

    it('returns undefined when editing an unknown client', async () => {
        const updated = await manager.edit('missing', { theme: 'light' });

        expect(updated).to.equal(undefined);
    });
});
