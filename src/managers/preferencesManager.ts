import type {
    ClientPreferences,
    SaveClientPreferencesRequest,
    Theme,
} from '@textyly/crossly-client-preferences-contracts';
import type { IPreferencesManager } from './types.js';
import type { IPreferencesRepository } from '../repository/types.js';

const DEFAULT_THEME: Theme = 'system';
const DEFAULT_LANGUAGE: string = 'en';

/**
 * Default {@link IPreferencesManager} implementation. Holds no state itself —
 * it applies defaults, merges partial updates, and delegates storage to the
 * repository. All operations are scoped to the clientId the caller passes in.
 */
export class PreferencesManager implements IPreferencesManager {
    public constructor(private readonly repository: IPreferencesRepository) {}

    public async get(clientId: string): Promise<ClientPreferences> {
        const found = await this.repository.getById(clientId);
        return found ?? this.defaults(clientId);
    }

    public async save(
        clientId: string,
        request: SaveClientPreferencesRequest,
    ): Promise<ClientPreferences> {
        // Merge onto whatever exists (or defaults), so a partial update only
        // changes the fields it actually provides.
        const current = await this.get(clientId);
        const updated: ClientPreferences = {
            clientId,
            theme: request.theme ?? current.theme,
            language: request.language ?? current.language,
            settings: request.settings ?? current.settings,
        };

        return this.repository.save(updated);
    }

    private defaults(clientId: string): ClientPreferences {
        return { clientId, theme: DEFAULT_THEME, language: DEFAULT_LANGUAGE, settings: {} };
    }
}
