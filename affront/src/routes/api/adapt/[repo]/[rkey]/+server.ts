import { ATPUser } from "$lib/ATPUser.js"
import type { BlobRef } from "@atproto/api"

function adapt(repo: string, value: any) {
    let segments = ""
    let sum = 0
    let isfmp4 = false
    for (let segment of value["sequence"]) {
        const src = segment["src"] as BlobRef
        const duration = (segment["duration"] as number) / 1000000
        isfmp4 = (src.mimeType === "video/mp4" || src.mimeType === "video/iso.segment")
        sum += duration
        segments += `#EXTINF:${duration},\n/api/blob/${repo}/${src.ref}\n`
    }
    return `#EXTM3U
#EXT-X-PLAYLIST-TYPE:${(value["end"] ? "VOD" : "EVENT")}
#EXT-X-VERSION:${value["version"]}
#EXT-X-MEDIA-SEQUENCE:${value["mediaSequence"] + (isfmp4 ? ("\n#EXT-X-MAP:URI=/public/init.mp4") : "")}
#EXT-X-TARGETDURATION:${Math.floor(sum / value["sequence"].length)}
${segments + (value["end"] ? "#EXT-X-ENDLIST" : "")}`

}

export async function GET({ params, fetch }) {
    // TODO: Cache here if event is VOD, and more importantly the HLS segments
    const user = await ATPUser.fromDID(params.repo, fetch)
    const record = await user.agent.live.grayhaze.format.hls.get(params)
    const adapted = adapt(params.repo, record.value)
    return new Response(adapted, {
        headers: {
            ["Content-Type"]: "application/vnd.apple.mpegurl"
        }
    })
}