import { lexicons } from '@atproto/api'
import { isValidLexiconDoc, LexiconDoc, parseLexiconDoc } from '@atproto/lexicon'
import * as xrpc from '@atproto/xrpc-server'
import express from 'express'
import { PathLike } from 'fs'
import { readdir, readFile, stat } from 'fs/promises'
import { WebSocket } from 'ws'
import dotenv from 'dotenv'
import { Commit, JetMessage, Put } from './Jetstream.js'
import { Pipe } from './Pipe.js'
import { isRecord } from './lexicons/types/live/grayhaze/interaction/chat.js'
import { User } from './User.js'
import { AtpBaseClient } from './lexicons/index.js'
import { ChatView } from './lexicons/types/live/grayhaze/interaction/defs.js'
import { ATURI } from './ATURI.js'
dotenv.config()

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

    if (!process.env.JETSTREAM) throw new Error("Missing JETSTREAM .env variable")
    const ws = new WebSocket(`${process.env.JETSTREAM}/subscribe?wantedCollections=live.grayhaze.*`)
    ws.on("open", () => {
        console.log("connection")
    })

    const docs = await importLex("../lexicons")
    const server = xrpc.createServer(docs)


    const pipe = new Pipe<Commit<Put>>()

    ws.on("message", async (message) => {
        const jet = JSON.parse(message.toString()) as JetMessage
        if (jet.kind === "commit" && jet.commit.operation === "create" && jet.commit.collection === "live.grayhaze.interaction.chat") {
            console.log("push")
            pipe.push(jet as Commit<Put>)
        }
    })

    server.streamMethod("live.grayhaze.interaction.subscribeChat", async function* ({ params }) {
        console.log("invoked")
        const jet = await pipe.shift()
        console.log("shift", jet, isRecord(jet.commit.record), params.stream)
        if (isRecord(jet.commit.record) && typeof params.stream === "string" && params.stream === new ATURI(jet.commit.record.stream.uri).rkey) {
            console.log("we're in")
            try {
                const user = await User.fromDID(jet.did)
                if (!user.pds) throw new Error(`${jet.did} has no PDS!?`)
                const client = new AtpBaseClient(new URL(user.pds))
                const channel = await client.live.grayhaze.actor.channel.get({
                    repo: user.did,
                    rkey: "self"
                })
                let avatar
                if (channel.value.avatar) {
                    avatar = `${user.pds}/xrpc/com.atproto.sync.getBlob?did=${user.did}&cid=${channel.value.avatar.ref}`
                }
                let chatview: ChatView = {
                    src: jet.commit.record,
                    author: {
                        did: user.did,
                        handle: user.handle,
                        displayName: channel.value.displayName,
                        avatar,
                    }
                }
                yield chatview
            } catch (e) {
                console.warn("Failed to resolve user:", e)
            }
        }
    })
    
    app.use(server.router)
    app.listen(process.env.PORT, () => {
        console.log("oh no")
    })
}

main()