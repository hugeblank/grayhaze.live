import express from 'express'
import { readFile } from 'fs/promises'
import dotenv from 'dotenv'
dotenv.config()

function adapt(repo: string, value: any) {
    let segments = ""
    let sum = 0
    for (let segment of value["sequence"]) {
        sum += segment["duration"] as number
        segments += `#EXTINF:${segment["duration"]},\nhttps://pds.atproto.hugeblank.dev/xrpc/com.atproto.sync.getBlob?did=${repo}&cid=${segment["src"]["ref"]["$link"]}\n`
    }
    return `#EXTM3U
#EXT-X-VERSION:${value["version"]}
#EXT-X-MEDIA-SEQUENCE:${value["mediaSequence"]}
#EXT-X-TARGETDURATION:${sum/segments.length}
${segments}
${value["end"] ? "#EXT-X-ENDLIST" : ""}`
}

const app = express()
app.get("/adapt/:repo/:rkey\.m3u8", async (req, res) => {
    // TODO: resolve pds
    const pdsResponse = await fetch(`https://pds.atproto.hugeblank.dev/xrpc/com.atproto.repo.getRecord?repo=${req.params.repo}&collection=live.grayhaze.format.hls&rkey=${req.params.rkey}`)
    if (!pdsResponse.ok) {
        res.status(pdsResponse.status).send(pdsResponse.statusText)
        return
    }
    res.setHeader("Access-Control-Allow-Origin", "*").setHeader("Content-Type", "application/vnd.apple.mpegurl").status(200).send(adapt(req.params.repo, (await pdsResponse.json())["value"]))

})

app.use(express.static('static'))

app.get("/:repo/:rkey", async (req, res) => {
    let file = (await readFile("index.html")).toString()
    file = file.replace(":repo", req.params.repo).replace(":rkey", req.params.rkey).replace(":host", process.env.HOST as string)
    res.status(200).setHeader("Access-Control-Allow-Origin", "*").send(file)
})

app.listen(6080, () => {
    console.log("Ready")
})