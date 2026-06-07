import { expect } from 'chai';
import { InMemoryPreferencesRepository } from '../../src/repository/preferencesRepository.js';
import type { ClientPreferences } from '@textyly/crossly-client-preferences-contracts';

describe('InMemoryPreferencesRepository', () => {
    let repository: InMemoryPreferencesRepository;

    const sample: ClientPreferences = {
        clientId: 'user-1',
        theme: 'dark',
        language: 'bg',
        settings: {},
    };

    beforeEach(() => {
        repository = new InMemoryPreferencesRepository();
    });

    it('saves and reads back a client\'s preferences', async () => {
        await repository.save(sample);

        const found = await repository.getById('user-1');

        expect(found).to.deep.equal(sample);
    });

    it('returns undefined when reading an unknown client', async () => {
        const found = await repository.getById('missing');

        expect(found).to.equal(undefined);
    });

    it('lists all saved preferences', async () => {
        await repository.save(sample);
        await repository.save({ ...sample, clientId: 'user-2' });

        const all = await repository.getAll();

        expect(all).to.have.length(2);
    });

    it('edits an existing client and leaves untouched fields intact', async () => {
        await repository.save(sample);

        const updated = await repository.edit('user-1', { theme: 'light' });

        expect(updated?.theme).to.equal('light');
        expect(updated?.language).to.equal('bg');
    });

    it('returns undefined when editing an unknown client', async () => {
        const updated = await repository.edit('missing', { theme: 'light' });

        expect(updated).to.equal(undefined);
    });

    it('never lets clientId be changed by an edit', async () => {
        await repository.save(sample);

        const updated = await repository.edit('user-1', { clientId: 'hacker' });

        expect(updated?.clientId).to.equal('user-1');
    });

    it('clones on read so callers cannot mutate stored state', async () => {
        await repository.save(sample);

        const first = await repository.getById('user-1');
        first!.theme = 'light';
        const second = await repository.getById('user-1');

        expect(second?.theme).to.equal('dark');
    });
});
