import { ATPUser } from "$lib/ATPUser.js"
import type { LocalSession } from "$lib/session"
import { error } from "@sveltejs/kit"

export const load = async ({ locals }) => { 
    const l = locals as LocalSession
    return {
        authed: l.user !== undefined
    }
}

export const actions = {
    chat: async ({ request, locals, params }) => {
        const l = locals as LocalSession
        if (!l.user) error(401, "Unauthorized")
        const [data, user] = await Promise.all([
            request.formData(),
            ATPUser.fromHandle(params.handle)
        ])
        const record = await user.agent.live.grayhaze.content.stream.get({
            repo: user.did,
            rkey: params.rkey
        })
        const text = data.get("chat")?.toString()
        if (text) {
            return await l.user.agent.live.grayhaze.interaction.chat.create({
                repo: l.user.did
            }, {
                stream: {
                    uri: record.uri,
                    cid: record.cid
                },
                text
            })
        }
    },
    ban: async ({ request, locals, params }) => {
        const l = locals as LocalSession
        if (!l.user) error(401, "Unauthorized")
        const data = await request.formData()
        const did = data.get("did")?.toString()

        console.log("submitted", did)
        if (did) {
            return await l.user.agent.live.grayhaze.interaction.ban.create({
                repo: l.user.did
            }, {
                subject: did
            })
        }
    }
}