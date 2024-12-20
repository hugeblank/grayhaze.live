import { ATPUser } from "$lib/ATPUser"
import type { LocalSession } from "$lib/session"
import { TempCache } from "$lib/TempCache.js"
import type { ComAtprotoRepoStrongRef } from "@atproto/api"
import { error } from "@sveltejs/kit"

export interface ChatActionResponse {
    chatRef: ComAtprotoRepoStrongRef.Main,
    streamRef: ComAtprotoRepoStrongRef.Main
}

const streamCache = new TempCache<string, ComAtprotoRepoStrongRef.Main>(60*60)

export const actions = {
    chat: async ({ request, locals }) => {
        const l = locals as LocalSession
        if (!l.user) error(401, "Unauthorized")
        const data = await request.formData()
        if (!data.has("did")) error(400, "Missing did")
        if (!data.has("rkey")) error(400, "Missing rkey")
        const user = await ATPUser.fromDID(data.get("did")?.toString()!)
        const rkey = data.get("rkey")?.toString()!
        if (!streamCache.has(rkey)) {
            const fullrecord = await user.agent.live.grayhaze.content.stream.get({
                repo: user.did,
                rkey: rkey
            })
            streamCache.set(rkey, { uri: fullrecord.uri, cid: fullrecord.cid })
        }
        const stream = streamCache.get(rkey)!
        const text = data.get("chat")?.toString()
        if (text) {
            return {
                chatRef: await l.user.agent.live.grayhaze.interaction.chat.create({ repo: l.user.did }, {
                    stream,
                    text
                }),
                streamRef: stream
            }
        }
    },
    ban: async ({ request, locals }) => {
        const l = locals as LocalSession
        if (!l.user) error(401, "Unauthorized")
        const data = await request.formData()
        if (!data.has("did")) error(400, "Missing did")
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