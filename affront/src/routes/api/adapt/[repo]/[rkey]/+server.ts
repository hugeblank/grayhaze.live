import { ATPUser } from "$lib/ATPUser.js"
import { TempCache } from "$lib/Cache"
import type { HlsSegment } from "$lib/lexicons/types/live/grayhaze/format/defs.js"
import { isRecord, type Record } from "$lib/lexicons/types/live/grayhaze/format/hls.js"
import { EphemeralStore } from "$lib/Stores.js"
import { error } from "@sveltejs/kit"

function adapt(repo: string, value: Record) {
    let segments = ""
    let sum = 0
    let isfmp4 = false
    for (let segment of value.sequence) {
        const duration = (segment.duration as number) / 1000000
        isfmp4 = (segment.src.mimeType === "video/mp4" || segment.src.mimeType === "video/iso.segment")
        sum += duration
        segments += `#EXTINF:${duration},\n/api/blob/${repo}/${segment.src.ref}\n`
    }
    return `#EXTM3U
#EXT-X-PLAYLIST-TYPE:${(value.end ? "VOD" : "EVENT")}
#EXT-X-VERSION:${value.version}
#EXT-X-MEDIA-SEQUENCE:${value.mediaSequence + (isfmp4 ? ("\n#EXT-X-MAP:URI=/public/init.mp4") : "")}
#EXT-X-TARGETDURATION:${Math.floor(sum / value.sequence.length)}
${segments + (value.end ? "#EXT-X-ENDLIST" : "")}`

}
const hour = 60*60
// const store = EphemeralStore.of("plrecords", hour*24)
const cache = new TempCache<string, Record>(hour)


export async function GET({ params, fetch }) {
    // TODO: Cache here if event is VOD, and more importantly the HLS segments
    const skey = params.repo + ":" + params.rkey
    let record: Record
    if (cache.has(skey)) {
        record = cache.get(skey)!
    } else {
        // let storage = await store.get(skey)
        // if (storage) {
        //     console.log("valkey")
        //     const out = JSON.parse(storage)
        //     isRecord(out)
        //     record = out
        // } else {
        const user = await ATPUser.fromDID(params.repo, fetch)
        record = (await user.agent.live.grayhaze.format.hls.get(params)).value
        // if (record.next) store.set(skey, JSON.stringify(record))
        // }
        if (record.prev) error(400, "Cannot assemble hls playlist from intermediary record")
        if (record.next) {
            cache.set(skey, record)
            let next: string | undefined = record.next
            while (next) {
                const nrecord: Record = (await user.agent.live.grayhaze.format.hls.get({
                    repo: params.repo,
                    rkey: next
                })).value
                record.sequence = record.sequence.concat(nrecord.sequence) as HlsSegment[]
                next = nrecord.next
                record.end = record.end || nrecord.end
            }
        }
    }
    const adapted = adapt(params.repo, record)
    return new Response(adapted, {
        headers: {
            ["Content-Type"]: "application/vnd.apple.mpegurl"
        }
    })
}