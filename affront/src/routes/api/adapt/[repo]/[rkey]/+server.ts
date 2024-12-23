
import { ATPUser } from "$lib/ATPUser.js"
import { PerItemTempCache, TempCache } from "$lib/TempCache"
import { type Record } from "$lib/lexicons/types/live/grayhaze/format/hls.js"
import { error } from "@sveltejs/kit"
import { cloneDeep } from 'lodash-es'

function adapt(repo: string, value: Record) {
    let segments = ""
    let sum = 0
    let isfmp4 = false
    for (let segment of value.sequence) {
        const duration = (segment.duration as number) / 1000000
        isfmp4 = (segment.src.mimeType === "video/mp4" || segment.src.mimeType === "video/iso.segment")
        sum += duration
        segments += `#EXTINF:${duration},\n/api/blob/segment/${repo}/${segment.src.ref}\n`
    }
    return "#EXTM3U\n#EXT-X-PLAYLIST-TYPE:" + (value.end ? "VOD" : "EVENT") + "\n#EXT-X-VERSION:" + value.version + "\n#EXT-X-MEDIA-SEQUENCE:" + value.mediaSequence +
        (isfmp4 ? ("\n#EXT-X-MAP:URI=/public/init.mp4") : "") + "\n#EXT-X-TARGETDURATION:" + Math.floor(sum / value.sequence.length) + (segments + (value.end ? "\n#EXT-X-ENDLIST" : ""))

}
const hour = 60*60
// const store = EphemeralStore.of("plrecords", hour*24)
const cache = new TempCache<string, Record>(hour)
const plcache = new PerItemTempCache<string, string>()

export async function GET({ params, fetch }) {
    // const plckey = `${params.repo}|${params.rkey}`
    // if (plcache.has(plckey)) {
    //     console.log("playlist cache hit")
    //     new Response(plcache.get(plckey), {
    //         headers: {
    //             ["Content-Type"]: "application/vnd.apple.mpegurl"
    //         }
    //     })
    // }

    // TODO: Cache here if event is VOD, and more importantly the HLS segments
    const user = await ATPUser.fromDID(params.repo, fetch)
    
    let initial: Record | undefined
    let next: string | undefined = params.rkey
    let visited: string[] = []
    while (next) {
        let record: Record
        const skey = params.repo + ":" + next
        if (cache.has(next)) {
            record = cache.get(skey)!
        } else {
            try {
                const response = await user.agent.live.grayhaze.format.hls.get({
                    repo: params.repo,
                    rkey: next
                })
                record = response.value
            } catch {
                error(500, `Unknown error occured while getting hls record: ${next}`)
            }
            if (record.next) cache.set(skey, record)
        }
        if (record.prev && visited.length === 0) error(400, "Cannot assemble hls playlist from intermediary record")
        
        if (record.next) {
            visited.push(next)
            if (visited.includes(record.next)) error(400, "While it would be really funny, Cannot assemble cyclic hls playlist")
        } 
        
        if (initial) {
            initial.sequence = initial.sequence.concat(record.sequence)
            initial.end = initial.end || record.end
        } else {
            initial = cloneDeep(record)
        }
        next = record.next
    }
    
    if (initial) {
        const adapted = adapt(params.repo, initial)
        // If this is a VOD, cache the playlist string for an hour, otherwise keep it for the duration of the last segment.
        // It seems that most, if not all clients are smart enough to know that if the playlist is a VOD that the document is unchanging.
        // We cache just in case.
        // console.log("Caching playlist for ", initial.end ? 3600 : initial.sequence[initial.sequence.length-1].duration/1000000)
        // plcache.set(plckey, adapted, initial.end ? 3600 : initial.sequence[initial.sequence.length-1].duration/1000000)
        return new Response(adapted, {
            headers: {
                ["Content-Type"]: "application/vnd.apple.mpegurl"
            }
        })
    } else {
        error(404, "HLS Playlist Record Not found")
    }

}