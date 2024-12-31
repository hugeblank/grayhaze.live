import { client, generateSessionToken, localSessionStore } from "$lib/session";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { ATPUser } from "$lib/ATPUser";
import { Agent } from "@atproto/api";
import { grayhazeAgent } from "$lib/Merged";

export const load: PageServerLoad = async ({ cookies, url, fetch }) => {
    console.log("a")
    const { session } = await client!.callback(url.searchParams)
    console.log("b")
    const nkey = generateSessionToken()
    console.log("c")
	localSessionStore.set(nkey, session.did)
    console.log("d")
    cookies.set("session", nkey, { path: "/" })
    console.log("e")
    const user = await ATPUser.fromDID(session.did, fetch, grayhazeAgent(session))
    console.log("f")
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
    console.log("g")
    redirect(302, "/")
}