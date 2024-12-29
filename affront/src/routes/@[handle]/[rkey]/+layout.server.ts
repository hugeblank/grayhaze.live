import { ATPUser } from "$lib/ATPUser.js"
import type { LocalSession } from "$lib/session.js"

export const load = async ({ locals }) => {
    const l = locals as LocalSession
    if (l.user) {
        try {
            const record = await l.user.agent.live.grayhaze.actor.channel.get({
                repo: l.user.did,
                rkey: "self"
            })
            return {
                channel: record.value
            }
        } catch {
            // ignore
        }
    }
}