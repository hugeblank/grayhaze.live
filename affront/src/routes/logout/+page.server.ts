import type { LocalSession } from "$lib/session.js"
import type { OAuthSession } from "@atproto/oauth-client-node"
import { redirect } from "@sveltejs/kit"

export const load = async ({ locals }) => {
    const l = locals as LocalSession
    const session = l.user?.agent.sessionManager as OAuthSession
    session.signOut()
    redirect(302, "/")
}