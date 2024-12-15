import { lexicons } from '@atproto/api'
import { isValidLexiconDoc, LexiconDoc, parseLexiconDoc } from '@atproto/lexicon'
import * as xrpc from '@atproto/xrpc-server'
import express from 'express'
import { PathLike } from 'fs'
import { readdir, readFile, stat } from 'fs/promises'
import dotenv from 'dotenv'
import { Pipe } from './Pipe.js'
import { isRecord } from './lexicons/types/live/grayhaze/interaction/chat.js'
import { User } from './User.js'
import { AtpBaseClient } from './lexicons/index.js'
import { ChatView } from './lexicons/types/live/grayhaze/interaction/defs.js'
import { IdResolver } from '@atproto/identity'
import { ATURI } from './ATURI.js'
dotenv.config()

import { logger } from '@atproto/xrpc-server/dist/stream/logger.js'
import { Create, Firehose } from '@atproto/sync'
logger.level = 'debug'

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

    const pipes: Pipe<Create>[] = []

    const firehose = new Firehose({
        idResolver: new IdResolver(),
        unauthenticatedCommits: true,
        async handleEvent(evt) {
            if (evt.event === "create" && evt.record["$type"] === "live.grayhaze.interaction.chat") {
                pipes.forEach((pipe) => pipe.push(evt))
            }
        },
        async onError(err) {
            console.error(err)
        },
    })

    // Baby's first subscription
    server.streamMethod("live.grayhaze.interaction.subscribeChat", async function* ({ params, signal }) {
        console.log(`subscription ${params.stream}`)
        const pipe = new Pipe<Create>()
        signal.addEventListener("abort", () => pipes.filter((p) => p == pipe))
        pipes.push(pipe)
        for await (const evt of pipe) {
            if (isRecord(evt.record) && typeof params.stream === "string" && params.stream === new ATURI(evt.record.stream.uri).rkey) {
                // TODO: throw new xrpc.InvalidRequestError("This stream has ended.", "StreamEnded")
                try {
                    const user = await User.fromDID(evt.did)
                    if (!user.pds) throw new Error(`${evt.did} has no PDS!?`)
                    const client = AtpBaseClient.agent(new URL(user.pds))
                    const channel = await client.live.grayhaze.actor.channel.get({
                        repo: user.did,
                        rkey: "self"
                    })
                    let avatar
                    if (channel.value.avatar) {
                        // TODO: Cache avatar
                        avatar = `${user.pds}/xrpc/com.atproto.sync.getBlob?did=${user.did}&cid=${channel.value.avatar.ref}`
                    }
                    let chatview: ChatView = {
                        src: evt.record,
                        author: {
                            did: user.did,
                            handle: user.handle,
                            ...channel.value.displayName && {displayName: channel.value.displayName},
                            ...avatar && {avatar}
                        }
                    }
                    Object.keys(chatview).forEach(key => chatview[key] === undefined ? delete chatview[key] : {});
                    console.log(chatview)
                    yield chatview
                } catch (e) {
                    console.warn("Failed to resolve user:", e)
                }
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