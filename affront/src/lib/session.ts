import { encode } from "@atcute/base32";
import { SessionStore } from "./Stores";
import { StateStore } from "./Stores";
import { NodeOAuthClient } from "@atproto/oauth-client-node"
import { JoseKey } from "@atproto/jwk-jose";
import { EphemeralStore } from "./Stores";
import type { ATPUser } from "./ATPUser";
import { env } from "$env/dynamic/private";
import { building } from "$app/environment";

export const localSessionStore = EphemeralStore.of("localsession")

export interface LocalSession extends App.Locals {
	user?: ATPUser
}

export interface CertainLocalSession extends App.Locals {
	user: ATPUser
}

export const client = building ? undefined : await NodeOAuthClient.fromClientId({
    clientId: env.PRIVATE_CLIENT_META_URL as `https://${string}/${string}`,
    sessionStore: new SessionStore(),
	stateStore: new StateStore(1000 * 60 * 60),
	keyset: [
		await JoseKey.fromImportable(env.PRIVATE_KEY, env.PRIVATE_KID)
	]
})

export function generateSessionToken(): string {
	const tokenBytes = new Uint8Array(20);
	crypto.getRandomValues(tokenBytes);
	const token = encode(tokenBytes).toLowerCase();
	return token;
}