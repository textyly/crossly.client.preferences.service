import type {
    ClientPreferences,
    SaveClientPreferencesRequest,
} from '@textyly/crossly-client-preferences-contracts';

/**
 * Business operations for a single client's preferences. Identity (clientId) is
 * supplied by the caller (derived from the session cookie), never trusted from a
 * request body.
 */
export interface IPreferencesManager {
    /** The client's saved preferences, or sensible defaults if none exist yet. */
    get(clientId: string): Promise<ClientPreferences>;

    /**
     * Create or update the client's preferences. A partial request only changes
     * the fields it provides; unspecified fields are preserved.
     */
    save(clientId: string, request: SaveClientPreferencesRequest): Promise<ClientPreferences>;
}
