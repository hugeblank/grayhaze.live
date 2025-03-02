// import whyIsNodeRunning from 'why-is-node-running'
import { lexicons } from '@atproto/api'
import * as xrpc from '@atproto/xrpc-server'
import express from 'express'
import dotenv from 'dotenv'
import { Pipe } from './Pipe.js'
import { isRecord as isChatRecord, Record as ChatRecord } from './lexicons/types/live/grayhaze/interaction/chat.js'
import { isRecord as isBanRecord } from './lexicons/types/live/grayhaze/interaction/ban.js'
import { User } from './User.js'
import { ChatView, BanView } from './lexicons/types/live/grayhaze/interaction/defs.js'
import { IdResolver } from '@atproto/identity'
import { ATURI } from './ATURI.js'
import { shutdown as storesShutdown, updateCache } from './Stores.js'
dotenv.config()

import { logger } from '@atproto/xrpc-server/dist/stream/logger.js'
import { Create, Firehose } from '@atproto/sync'
import { Merged } from './Merged.js'
import { lexicons as lex } from './lexicons/lexicons.js'
logger.level = 'debug'

interface Params { did: string, stream: string }

// Read in lexicons from given path
function importLex(server: xrpc.Server) {
    for (const doc of lex.docs.values()) {
        server.addLexicon(doc)
    }
    return lexicons
}

const app = express()
const server = xrpc.createServer()
importLex(server)

let pipes: Pipe<Create>[] = []

const firehose = new Firehose({
    idResolver: new IdResolver(),
    unauthenticatedCommits: true,
    async handleEvent(evt) {
        if (evt.event === "create" || evt.event === "update" || evt.event === "delete") {
            await updateCache(evt)
            if (evt.event === "create" && evt.collection.startsWith("live.grayhaze.interaction.")) {
                pipes.forEach((pipe) => pipe.push(evt))
            }
        }
    },
    async onError(err) {
        console.error(err)
    },
})

const banned: Map<string, string[]> = new Map()

function isForStream(params: Params, record: ChatRecord) {
    const uri = new ATURI(record.stream.uri)
    return uri.rkey === params.stream && uri.repo === params.did
}

function canBan(params: Params, evt: Create | NonNullable<Create>) {
    return evt.did === params.did
}

function isBanned(params: Params, evt: Create | NonNullable<Create>) {
    if (!banned.has(params.stream)) return false
    return banned.get(params.stream)?.includes(evt.did)
}

async function getProfileView(evt: Create | NonNullable<Create>) {
    let user: User | undefined
    try {
        user = await User.fromDID(evt.did)
    } catch (e) {
        console.warn("Failed to resolve user:", e)
        user = undefined
    }
    if (!user || !user.pds) return undefined
    const client = Merged.agent(new URL(user.pds))
    const channel = await client.live.grayhaze.actor.channel.get({
        repo: user.did,
        rkey: "self"
    })
    let avatar
    if (channel.value.avatar) {
        // TODO: Cache avatar
        avatar = `${user.pds}/xrpc/com.atproto.sync.getBlob?did=${user.did}&cid=${channel.value.avatar.ref}`
    }
    return {
        did: user.did,
        handle: user.handle,
        displayName: channel.value.displayName,
        avatar
    }
}

// Baby's first subscription
server.streamMethod("live.grayhaze.interaction.subscribeChat", async function* (metadata) {
    const params = metadata.params as unknown as Params
    // TODO: throw new xrpc.InvalidRequestError("This stream has ended.", "StreamEnded")
    console.log(`subscription ${params.did} ${params.stream}`)
    const pipe = new Pipe<Create>()
    metadata.signal.addEventListener("abort", () => pipes = pipes.filter((p) => p !== pipe))
    pipes.push(pipe)
    for await (const evt of pipe) {
        if (!isBanned(params, evt) && isChatRecord(evt.record) && isForStream(params, evt.record)) {
            const author = await getProfileView(evt)
            if (!author) continue
            let chatview: ChatView = {
                src_uri: evt.uri.toString(),
                src: evt.record,
                author
            }
            Object.keys(chatview).forEach(key => chatview[key] === undefined ? delete chatview[key] : {});
            yield chatview
        } else if (canBan(params, evt) && isBanRecord(evt.record)) {
            if (!banned.has(evt.did)) banned.set(evt.did, [])
            banned.get(evt.did)?.push(evt.record.subject)
            const author = await getProfileView(evt)
            if (!author) continue
            let banview: BanView = {
                src_uri: evt.uri.toString(),
                src: evt.record,
                author
            }
            Object.keys(banview).forEach(key => banview[key] === undefined ? delete banview[key] : {});
            yield banview
        }
    }
})

app.use(server.router)

const sprinkler = app.listen(process.env.PORT, async () => {
    console.log(`oh no ${process.env.PORT}`)
    //await firehose.start()
})

async function shutdown() {
    sprinkler.close()
    await firehose.destroy()
    await storesShutdown()
	// setTimeout(() => {
	// 	console.log("Still shutting down?");
	// 	whyIsNodeRunning();
	// }, 1000).unref();
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

