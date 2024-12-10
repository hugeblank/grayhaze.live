import { onCatch, SprinklerError } from "$lib/error"
import { resolvePDS } from "$lib/resolve"

function adapt(repo: string, value: any) {
    let segments = ""
    let sum = 0
    let isfmp4 = false
    for (let segment of value["sequence"]) {
        const src = segment["src"]
        isfmp4 = (src["mimeType"] === "video/mp4" || src["mimeType"] === "video/iso.segment")
        sum += segment["duration"] as number
        segments += `#EXTINF:${segment["duration"]},\n/blob/${repo}/${src["ref"]["$link"]}\n`
    }
    return `#EXTM3U
#EXT-X-PLAYLIST-TYPE:${(value["end"] ? "VOD" : "EVENT")}
#EXT-X-VERSION:${value["version"]}
#EXT-X-MEDIA-SEQUENCE:${value["mediaSequence"] + (isfmp4 ? ("\n#EXT-X-MAP:URI=/public/init.mp4") : "")}
#EXT-X-TARGETDURATION:${Math.floor(sum / value["sequence"].length)}
${segments + (value["end"] ? "#EXT-X-ENDLIST" : "")}`

}

export async function GET({ params }) {
    try {
        const pds = await resolvePDS(params.repo)
        const pdsResponse = await fetch(`${pds}/xrpc/com.atproto.repo.getRecord?repo=${params.repo}&collection=live.grayhaze.format.hls&rkey=${params.rkey}`)
        if (!pdsResponse.ok) throw new SprinklerError(pdsResponse.statusText, pdsResponse.status)
        const record = await pdsResponse.json()
        return new Response(adapt(params.repo, record["value"]), {
            headers: {
                ["Content-Type"]: "application/vnd.apple.mpegurl"
            }
        })
    } catch (e) { onCatch(e) }
}