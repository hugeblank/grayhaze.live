import { client, generateSessionToken, localSessionStore, type LocalSession } from "$lib/session";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad, PageServerLoadEvent } from "./$types";

export const load: PageServerLoad = async ({ locals, cookies, url }) => {
    const { session } = await client.callback(url.searchParams)
    const nkey = generateSessionToken()
	localSessionStore.set(nkey, session.did)
    cookies.set("session", nkey, { path: "/" })
    const l = locals as LocalSession
    l.session = session
    redirect(302, "/")
}