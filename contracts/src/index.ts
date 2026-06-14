/**
 * Shared contracts for the Crossly Client Preferences service.
 *
 * These types describe the data exchanged over the API and are intended to be
 * consumed both by this service and by external TypeScript/JavaScript clients
 * such as `crossly.ui`. Keep this module free of runtime/server dependencies.
 */

/** Supported UI themes. */
export type Theme = 'light' | 'dark' | 'system';

/** A single client's persisted UI preferences. */
export interface ClientPreferences {
    /** Stable identifier of the client/user these preferences belong to. */
    clientId: string;
    /** Selected UI theme. */
    theme: Theme;
    /** BCP-47 language tag, e.g. "en", "bg". */
    language: string;
    /** Arbitrary additional UI settings, kept open for forward-compatibility. */
    settings: Record<string, unknown>;
}

/**
 * Payload to create/update the caller's preferences. All fields optional — a
 * partial update only changes what it provides. There is NO clientId: the server
 * derives identity from the session cookie, so a client can only write its own.
 */
export interface SaveClientPreferencesRequest {
    theme?: Theme;
    language?: string;
    settings?: Record<string, unknown>;
}
