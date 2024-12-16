import { encode } from "@atcute/base32";
import { SessionStore } from "./Stores";
import { StateStore } from "./Stores";
import { NodeOAuthClient } from "@atproto/oauth-client-node"
import { JoseKey } from "@atproto/jwk-jose";
import { EphemeralStore } from "./Stores";
import type { ATPUser } from "./ATPUser";
import { PRIVATE_KEY } from "$env/static/private";

export const localSessionStore = EphemeralStore.of("localsession")

export interface LocalSession extends App.Locals {
	user?: ATPUser
}
export const client = await NodeOAuthClient.fromClientId({
    clientId: "https://grayhaze.live/oauth/client-metadata.json",
    sessionStore: new SessionStore(),
	stateStore: new StateStore(1000 * 60 * 60),
	keyset: [
		await JoseKey.fromImportable(PRIVATE_KEY, "2f49d966b3688d47cce4d3555889a3d54ddffcbea365bcaca7c43f3a9c8df75e")
	]
})

export function generateSessionToken(): string {
	const tokenBytes = new Uint8Array(20);
	crypto.getRandomValues(tokenBytes);
	const token = encode(tokenBytes).toLowerCase();
	return token;
}