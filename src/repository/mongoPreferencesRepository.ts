import type { Collection, MongoClient } from 'mongodb';
import type { ClientPreferences } from '@textyly/crossly-client-preferences-contracts';
import type { IPreferencesRepository } from './types.js';

/**
 * MongoDB document shape for a single client's preferences.
 *
 * `clientId` is a natural unique key, so it is stored directly as the document
 * `_id` — no generated ObjectId is needed (unlike crossly.persistence.service,
 * whose patterns have no natural key).
 */
interface PreferencesDocument {
    _id: string;
    theme: ClientPreferences['theme'];
    language: string;
    settings: Record<string, unknown>;
}

/**
 * MongoDB-backed implementation of {@link IPreferencesRepository}.
 *
 * Mirrors the persistence pattern of crossly.persistence.service's
 * MongoDbPersistence: a single class owns the driver, a connected MongoClient is
 * injected, and the collection is resolved once in the constructor. The client's
 * lifecycle (connect/close) is owned by the caller / composition root.
 */
export class MongoPreferencesRepository implements IPreferencesRepository {
    private readonly collection: Collection<PreferencesDocument>;

    public constructor(
        client: MongoClient,
        dbName: string = 'CrosslyDb',
        collectionName: string = 'ClientPreferences',
    ) {
        this.collection = client.db(dbName).collection<PreferencesDocument>(collectionName);
    }

    public async save(preferences: ClientPreferences): Promise<ClientPreferences> {
        // Upsert: create the document, or overwrite it if this client already exists.
        await this.collection.replaceOne(
            { _id: preferences.clientId },
            this.toDocument(preferences),
            { upsert: true },
        );

        return preferences;
    }

    public async getById(clientId: string): Promise<ClientPreferences | undefined> {
        const document = await this.collection.findOne({ _id: clientId });
        return document ? this.toDomain(document) : undefined;
    }

    public async getAll(): Promise<ReadonlyArray<ClientPreferences>> {
        const documents = await this.collection.find().toArray();
        return documents.map((document) => this.toDomain(document));
    }

    public async edit(
        clientId: string,
        changes: Partial<ClientPreferences>,
    ): Promise<ClientPreferences | undefined> {
        // Identity is the _id and must never be changed by an edit, so drop clientId.
        const { clientId: _identity, ...fields } = changes;

        const document = await this.collection.findOneAndUpdate(
            { _id: clientId },
            { $set: fields },
            { returnDocument: 'after' },
        );

        return document ? this.toDomain(document) : undefined;
    }

    public async delete(clientId: string): Promise<boolean> {
        const result = await this.collection.deleteOne({ _id: clientId });
        return result.deletedCount === 1;
    }

    private toDocument(preferences: ClientPreferences): PreferencesDocument {
        return {
            _id: preferences.clientId,
            theme: preferences.theme,
            language: preferences.language,
            settings: preferences.settings,
        };
    }

    private toDomain(document: PreferencesDocument): ClientPreferences {
        return {
            clientId: document._id,
            theme: document.theme,
            language: document.language,
            settings: document.settings,
        };
    }
}
