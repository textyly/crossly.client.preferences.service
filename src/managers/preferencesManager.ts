import type {
    ClientPreferences,
    EditClientPreferencesRequest,
    SaveClientPreferencesRequest,
    Theme,
} from '@textyly/crossly-client-preferences-contracts';
import type { IPreferencesManager } from './types.js';
import type { IPreferencesRepository } from '../repository/types.js';

const DEFAULT_THEME: Theme = 'system';
const DEFAULT_LANGUAGE: string = 'en';

/**
 * Default {@link IPreferencesManager} implementation. Holds no state itself —
 * it applies defaults/validation and delegates storage to the repository.
 */
export class PreferencesManager implements IPreferencesManager {
    public constructor(private readonly repository: IPreferencesRepository) {}

    public save(request: SaveClientPreferencesRequest): Promise<ClientPreferences> {
        const preferences: ClientPreferences = {
            clientId: request.clientId,
            theme: request.theme ?? DEFAULT_THEME,
            language: request.language ?? DEFAULT_LANGUAGE,
            settings: request.settings ?? {},
        };

        return this.repository.save(preferences);
    }

    public getById(clientId: string): Promise<ClientPreferences | undefined> {
        return this.repository.getById(clientId);
    }

    public getAll(): Promise<ReadonlyArray<ClientPreferences>> {
        return this.repository.getAll();
    }

    public edit(
        clientId: string,
        request: EditClientPreferencesRequest,
    ): Promise<ClientPreferences | undefined> {
        return this.repository.edit(clientId, request);
    }
}
