import { ATPUser } from "$lib/ATPUser"
import type { CertainLocalSession, LocalSession } from "$lib/session"
import { TempCache } from "$lib/TempCache.js"
import type { ComAtprotoRepoStrongRef } from "@atproto/api"
import { error } from "@sveltejs/kit"

export interface ChatActionResponse {
    chatRef: ComAtprotoRepoStrongRef.Main,
    streamRef: ComAtprotoRepoStrongRef.Main
}

const streamCache = new TempCache<string, ComAtprotoRepoStrongRef.Main>(60*60)

async function unwrap({ request, locals }: { request: Request, locals: App.Locals}) {
    const l = locals as LocalSession
    if (!l.user) error(401, "Unauthorized")
    return {
        data: await request.formData(),
        locals: l as CertainLocalSession
    }
}

export const actions = {
    profile: async (wrapped) => {
        const { data, locals } = await unwrap(wrapped)
        let currChannel
        try {
            const resp = await locals.user.agent.live.grayhaze.actor.channel.get({
                repo: locals.user.did,
                rkey: "self"
            })
            currChannel = resp.value
        } catch {
            console.warn(`No channel record for user ${locals.user.handle}`)
        }

        let avablob
        let banblob
        if (data.has("avatar")) {
            const file = data.get("avatar") as File
            if (file.size > 0) avablob = await locals.user.uploadBlob(file, file.type)
        }
        if (data.has("banner")) {
            const file = data.get("banner") as File
            if (file.size > 0) banblob = await locals.user.uploadBlob(file, file.type)
        }

        const displayName = (data.has("displayName") ? data.get("displayName")?.toString() : currChannel?.displayName) ?? ""
        const description = (data.has("description") ? data.get("description")?.toString() : currChannel?.description) ?? ""
        // TODO: autogen put function
        const record = {
            avatar: avablob ?? currChannel?.avatar,
            banner: banblob ?? currChannel?.banner,
            displayName: displayName.length > 0 ? displayName : undefined,
            description: description.length > 0 ? description : undefined
        }
        await locals.user.agent.live.grayhaze.actor.channel.put({
            repo: locals.user.did
        }, record)
        return record
    },
    chat: async (wrapped) => {
        const {data, locals} = await unwrap(wrapped)
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
                chatRef: await locals.user.agent.live.grayhaze.interaction.chat.create({ repo: locals.user.did }, {
                    stream,
                    text
                }),
                streamRef: stream
            }
        }
    },
    ban: async (wrapped) => {
        const {data, locals} = await unwrap(wrapped)
        if (!data.has("did")) error(400, "Missing did")
        const did = data.get("did")?.toString()

        console.log("submitted", did)
        if (did) {
            return await locals.user.agent.live.grayhaze.interaction.ban.create({
                repo: locals.user.did
            }, {
                subject: did
            })
        }
    }
}