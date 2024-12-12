import { client, generateSessionToken, localSessionStore, type LocalSession } from "$lib/session";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { ATPUser } from "$lib/ATPUser";
import { Agent } from "@atproto/api";

export const load: PageServerLoad = async ({ locals, cookies, url }) => {
    const { session } = await client.callback(url.searchParams)
    const nkey = generateSessionToken()
	localSessionStore.set(nkey, session.did)
    cookies.set("session", nkey, { path: "/" })
    const l = locals as LocalSession
    l.session = session
    const agent = new Agent(l.session)
    const user = ATPUser.fromDIDDoc(await ATPUser.resolveDID(session.did), agent)
    try {
        await user.getAgent().live.grayhaze.actor.channel.get({
            repo: user.getDID(),
            rkey: "self"
        })
    } catch {
        const channel = await user.getAgent().live.grayhaze.actor.channel.create({
            repo: user.getDID(),
            rkey: "self"
        }, {})
        console.log(`created channel ${channel.uri}`)
    }
    redirect(302, "/")
}