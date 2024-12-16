import { TokenBucket } from "$lib/rate-limit";
import { sequence } from "@sveltejs/kit/hooks";
import type { Handle } from "@sveltejs/kit";
import { client, localSessionStore, type LocalSession } from "$lib/session";
import { ATPUser } from "$lib/ATPUser";
import { grayhazeAgent } from "$lib/Merged";

const bucket = new TokenBucket<string>(100, 1);

const rateLimitHandle: Handle = async ({ event, resolve }) => {
	// Note: Assumes X-Forwarded-For will always be defined.
	const clientIP = event.request.headers.get("X-Forwarded-For");
	if (clientIP === null) {
		return resolve(event);
	}
	let cost: number;
	if (event.request.method === "GET" || event.request.method === "OPTIONS") {
		cost = 1;
	} else {
		cost = 3;
	}
	if (!bucket.consume(clientIP, cost)) {
		return new Response("Too many requests", {
			status: 429
		});
	}
	return resolve(event);
};

const authHandle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith("/api")) return resolve(event)
	const locals = event.locals as LocalSession
	function clear(key?: string) {
		// Clears the browser session in the event something doesn't look right
		locals.user = undefined
		event.cookies.delete("session", { path: "/" })
		if (key) localSessionStore.del(key)
		return resolve(event);
	}
	const skey = event.cookies.get("session") ?? null; // get the session key
	if (skey === null) return clear() // If it doesn't exist
	const did = await localSessionStore.get(skey) // get the user did from this session key
	if (!did) return clear() // If there was no matching session key in the store
	const session = await client.restore(did)
	locals.user = await ATPUser.fromDID(did, event.fetch, grayhazeAgent(session)) // Restore the oauth session
	// At this point if the session restore causes an error I deserve it.
	return resolve(event);
};

export const handle = sequence(rateLimitHandle, authHandle);