import { localSessionStore, type LocalSession } from "$lib/session.js"
import type { OAuthSession } from "@atproto/oauth-client-node"
import { redirect } from "@sveltejs/kit"

export const load = async ({ locals, cookies }) => {
    const l = locals as LocalSession
    const session = l.user?.agent.sessionManager as OAuthSession
    session.signOut()
    l.user = undefined
    const nkey = cookies.get("session")
    if (nkey) await localSessionStore.del(nkey)
    cookies.delete("session", { path: "/" })
    redirect(302, "/")
}