import type { NextFunction, Request, Response } from 'express';
import { SESSION_COOKIE, verifySession } from './session.js';

// Attach the verified identity to the Express request so route handlers can read
// `req.clientId` after this middleware has run.
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            clientId?: string;
            guest?: boolean;
        }
    }
}

/**
 * Require a valid session cookie. Verifies the JWT (shared secret with the auth
 * service) and attaches `req.clientId` / `req.guest`; responds 401 if the cookie
 * is missing or invalid. Routes downstream scope all work to `req.clientId`, so a
 * client can only ever read/write its own data.
 */
export async function requireClient(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const token = req.cookies?.[SESSION_COOKIE];
    if (typeof token !== 'string' || token.length === 0) {
        res.status(401).json({ error: 'no session' });
        return;
    }

    try {
        const identity = await verifySession(token);
        req.clientId = identity.clientId;
        req.guest = identity.guest;
        next();
    } catch {
        res.status(401).json({ error: 'invalid or expired session' });
    }
}
