import { jwtVerify } from 'jose';

/** Session cookie name — MUST match the one set by crossly.client.auth.service. */
export const SESSION_COOKIE = 'crossly_session';

// Shared HS256 secret with the auth service. The default matches the auth
// service's default so local dev works with zero configuration; override via
// AUTH_JWT_SECRET in any real environment (the same value across all services).
const secret = new TextEncoder().encode(
    process.env.AUTH_JWT_SECRET ?? 'dev-only-insecure-secret-change-me',
);

/** Identity carried by a verified session token. */
export interface SessionIdentity {
    clientId: string;
    guest: boolean;
}

/**
 * Verify a session JWT and extract its identity. Throws if the token is invalid
 * or expired. This is the interim "shared secret" model; when a gateway validates
 * tokens, this becomes an RS256/JWKS check instead — nothing else changes.
 */
export async function verifySession(token: string): Promise<SessionIdentity> {
    const { payload } = await jwtVerify(token, secret);
    return { clientId: payload.sub as string, guest: payload.guest as boolean };
}
