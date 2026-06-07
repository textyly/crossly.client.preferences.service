import type { ClientPreferences } from 'crossly.client.preferences.contracts';

/**
 * Persistence boundary for client preferences.
 * Implementations may be in-memory, MongoDB, etc. — the rest of the service
 * depends only on this interface.
 */
export interface IPreferencesRepository {
    /** Create or overwrite the preferences for a client. Returns the stored value. */
    save(preferences: ClientPreferences): Promise<ClientPreferences>;

    /** Read a single client's preferences, or `undefined` if none exist. */
    getById(clientId: string): Promise<ClientPreferences | undefined>;

    /** Read all stored preferences. */
    getAll(): Promise<ReadonlyArray<ClientPreferences>>;

    /** Apply a partial change to an existing client's preferences. */
    edit(clientId: string, changes: Partial<ClientPreferences>): Promise<ClientPreferences | undefined>;
}
