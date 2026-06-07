import type {
    ClientPreferences,
    SaveClientPreferencesRequest,
    EditClientPreferencesRequest,
} from '@textyly/crossly-client-preferences-contracts';

/**
 * Business operations for client preferences. Sits between the controllers
 * (HTTP) and the repository (persistence), applying defaults and rules.
 */
export interface IPreferencesManager {
    save(request: SaveClientPreferencesRequest): Promise<ClientPreferences>;
    getById(clientId: string): Promise<ClientPreferences | undefined>;
    getAll(): Promise<ReadonlyArray<ClientPreferences>>;
    edit(clientId: string, request: EditClientPreferencesRequest): Promise<ClientPreferences | undefined>;
}
