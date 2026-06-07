import type { ClientPreferences } from 'crossly.client.preferences.contracts';
import type { IPreferencesRepository } from './types.js';

/**
 * In-memory implementation of {@link IPreferencesRepository}.
 *
 * State lives in a plain Map and is lost on restart. Used by the unit tests and
 * for running locally without a database; {@link MongoPreferencesRepository} is
 * the durable implementation wired into the service at runtime. Values are cloned
 * on the way in and out so callers cannot mutate stored state by reference.
 */
export class InMemoryPreferencesRepository implements IPreferencesRepository {
    private readonly store: Map<string, ClientPreferences> = new Map();

    public async save(preferences: ClientPreferences): Promise<ClientPreferences> {
        this.store.set(preferences.clientId, { ...preferences });
        return { ...preferences };
    }

    public async getById(clientId: string): Promise<ClientPreferences | undefined> {
        const found = this.store.get(clientId);
        return found ? { ...found } : undefined;
    }

    public async getAll(): Promise<ReadonlyArray<ClientPreferences>> {
        return Array.from(this.store.values()).map((preferences) => ({ ...preferences }));
    }

    public async edit(
        clientId: string,
        changes: Partial<ClientPreferences>,
    ): Promise<ClientPreferences | undefined> {
        const existing = this.store.get(clientId);
        if (!existing) {
            return undefined;
        }

        // clientId is the identity and must never be changed by an edit.
        const updated: ClientPreferences = { ...existing, ...changes, clientId };
        this.store.set(clientId, updated);
        return { ...updated };
    }
}
