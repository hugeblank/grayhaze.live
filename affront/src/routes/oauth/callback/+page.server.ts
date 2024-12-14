import { client, generateSessionToken, localSessionStore, type LocalSession } from "$lib/session";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { ATPUser } from "$lib/ATPUser";
import { Agent } from "@atproto/api";

export const load: PageServerLoad = async ({ locals, cookies, url, fetch }) => {
    const { session } = await client.callback(url.searchParams)
    const nkey = generateSessionToken()
	localSessionStore.set(nkey, session.did)
    cookies.set("session", nkey, { path: "/" })
    const user = await ATPUser.fromDID(session.did, fetch, new Agent(session))
    try {
        await user.agent.live.grayhaze.actor.channel.get({
            repo: user.did,
            rkey: "self"
        })
    } catch {
        const channel = await user.agent.live.grayhaze.actor.channel.create({
            repo: user.did,
            rkey: "self"
        }, {})
        console.log(`created channel ${channel.uri}`)
    }
    redirect(302, "/")
}