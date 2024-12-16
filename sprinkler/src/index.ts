import { ComAtprotoRepoStrongRef, lexicons } from '@atproto/api'
import { isValidLexiconDoc, LexiconDoc, parseLexiconDoc, RepoRecord } from '@atproto/lexicon'
import * as xrpc from '@atproto/xrpc-server'
import express from 'express'
import { PathLike } from 'fs'
import { readdir, readFile, stat } from 'fs/promises'
import dotenv from 'dotenv'
import { Pipe } from './Pipe.js'
import { isRecord as isChatRecord, Record as ChatRecord } from './lexicons/types/live/grayhaze/interaction/chat.js'
import { isRecord as isBanRecord } from './lexicons/types/live/grayhaze/interaction/ban.js'
import { User } from './User.js'
import { ChatView, BanView } from './lexicons/types/live/grayhaze/interaction/defs.js'
import { IdResolver } from '@atproto/identity'
import { ATURI } from './ATURI.js'
dotenv.config()

import { logger } from '@atproto/xrpc-server/dist/stream/logger.js'
import { Create, Firehose } from '@atproto/sync'
import { Merged } from './Merged.js'
logger.level = 'debug'

interface Params { did: string, stream: string }

// Read in lexicons from given path
async function importLex(path: PathLike) {
    const docs: LexiconDoc[] = []
    await Promise.all((await readdir(path, { recursive: true })).map(async (file) => {
        let fpath = `${path}/${file}`
        let stats = await stat(fpath)
        if (!stats.isDirectory() && !file.endsWith("paths.json")) {
            const doc = JSON.parse((await readFile(fpath)).toString())
            if (!isValidLexiconDoc(doc)) console.error(`${fpath} is not a valid LexiconDoc`)
            let ldoc = parseLexiconDoc(doc)
            docs.push(ldoc)
            lexicons.add(ldoc)
        }
    }))
    return docs
}

async function main() {
    const app = express()
    const docs = await importLex("../lexicons")
    const server = xrpc.createServer(docs)

    let pipes: Pipe<Create>[] = []

    const firehose = new Firehose({
        idResolver: new IdResolver(),
        unauthenticatedCommits: true,
        async handleEvent(evt) {
            if (evt.event === "create" && typeof evt.record["$type"] === "string" && evt.record["$type"].startsWith("live.grayhaze.interaction.")) {
                pipes.forEach((pipe) => pipe.push(evt))
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
        try {
            const user = await User.fromDID(evt.did)
            if (!user.pds) throw new Error(`${evt.did} has no PDS!?`)
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
                ...channel.value.displayName && {displayName: channel.value.displayName},
                ...avatar && {avatar}
            }
        }  catch (e) {
            console.warn("Failed to resolve user:", e)
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
    app.listen(process.env.PORT, async () => {
        console.log(`oh no ${process.env.PORT}`)
        console.log(await firehose.start())
    }).on('all', (e) => {
        console.log(e)
    })
}

main()