# @textyly/crossly-client-preferences-contracts

Shared TypeScript contracts (types / DTOs) for the Crossly **Client Preferences** service.

These types describe the data exchanged over the service's HTTP API and are meant to be
consumed by any TypeScript/JavaScript client — for example [`crossly.ui`](https://github.com/textyly) —
so that clients and the service agree on the same shapes.

## Install

```bash
npm install @textyly/crossly-client-preferences-contracts
```

## Usage

```ts
import type {
    ClientPreferences,
    SaveClientPreferencesRequest,
    EditClientPreferencesRequest,
    Theme,
} from '@textyly/crossly-client-preferences-contracts';
```

The package ships only type declarations and has no runtime or server dependencies.

## License

Apache-2.0 — part of the [textyly / crossly](https://github.com/textyly) open-source project.
