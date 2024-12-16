import  { type Record as HlsRecord, isRecord } from '$lib/lexicons/types/live/grayhaze/format/hls'
import type { Record as StreamRecord, Thumbnail } from '$lib/lexicons/types/live/grayhaze/content/stream'
import type { LocalSession } from '$lib/session.js'
import { WrappedRecord } from '$lib/WrappedRecord'
import { error } from '@sveltejs/kit'
import { ATPUser } from '$lib/ATPUser.js'
import { ATURI } from '$lib/ATURI.js'

export const load = async ({ locals, params, parent }) => {
    const pdata = await parent()

    // TODO: Database this
    const formap: Map<string, WrappedRecord<HlsRecord>> = new Map()
    const existsfilter: Set<string> = new Set()

    // Get list of records, validate, then map to a typed WrappedRecord
    // Do this for content that's not associated to a stream, then 
    const l = locals as LocalSession
    let rawMedia: WrappedRecord<HlsRecord>[] | undefined
    let self = false
    if (l.user && l.user?.handle === params.handle) {
        const hlsdata = await l.user.agent.live.grayhaze.format.hls.list({ repo: l.user.did })
        rawMedia = WrappedRecord.wrap<HlsRecord>(hlsdata.records.filter((response) => isRecord(response.value))).filter((record) => record.valid)
        rawMedia.forEach((record) => formap.set(record.uri.rkey, record))
        self = true
    }

    const user = ATPUser.fromDIDDoc(pdata.diddoc)
    const publishedStreams = (await Promise.all(WrappedRecord.wrap<StreamRecord>(
        (await user.agent.live.grayhaze.content.stream.list({ repo: user.did })).records
    ).filter((record) => record.valid).map(async (record) => {
        const mime = record.value.thumbnail?.image.mimeType
        if (!(mime === "image/png" || mime === "image/jpeg") || !user.pds) return undefined
        const uri = new ATURI(record.value.content.uri)
        try {
            const hlsrecord = formap.has(uri.rkey) ? formap.get(uri.rkey) : WrappedRecord.wrap<HlsRecord>(await uri.fetch())
            if (!hlsrecord) return undefined
            existsfilter.add(hlsrecord.uri.toString())
            return { hlsrecord, streamrecord: record }
        } catch (e) {
            console.log(e)
            return undefined
        }
    }))).filter((records) => {
        return records !== undefined
    })

    rawMedia = rawMedia?.filter((record) => {
        return !existsfilter.has(record.uri.toString())
    })


    return {
        rawMedia,
        publishedStreams,
        self
    }
}

export const actions = {
    publish: async ({ request, locals }) => {
        const l = locals as LocalSession
        if (!l.user) error(401, "Unauthorized")
        const data = await request.formData()
        const title = data.get("title") as string
        const thumbfile = data.get("thumbnail") as File | null
        const hlsuri = new ATURI(data.get("uri") as string)
        const cid = data.get("cid") as string
        console.log("submitted?", title, hlsuri.toString())
        if (title) {
            let thumbnail: Thumbnail | undefined
            if (thumbfile) {
                try {
                    const response = await l.user?.agent.uploadBlob(thumbfile, {
                        headers: {
                            ["Content-Type"]: thumbfile.type
                        }
                    })
                    if (response && response.success) {
                        console.log("Image upload success")
                        thumbnail = { image: response.data.blob }
                    } else {
                        throw new Error("how")
                    }
                } catch {
                    console.warn(`Thumbnail upload failed for ${hlsuri.toString()}`)
                }
            }
            // TODO: Finding a hls record from a stream should be a query
            let cursor
            let matching: { uri: string; cid?: string; value: StreamRecord; } | undefined
            do {
                const list = await l.user?.agent.live.grayhaze.content.stream.list({ repo: l.user.did, cursor })
                cursor = list?.cursor
                console.log(cursor)
                list?.records.forEach((record) => {
                    const uri = new ATURI(record.value.content.uri)
                    if (uri.rkey === hlsuri.rkey) {
                        matching = record
                    }
                })
            } while (cursor);
            if (matching) {
                console.log("matching??")
                // TODO: Put record
            } else {
                const response = await l.user?.agent.live.grayhaze.content.stream.create({
                    repo: l.user.did,
                }, {
                    title,
                    thumbnail,
                    content: {
                        uri: hlsuri.toString(),
                        cid
                    }
                })
                console.log("created stream", response.uri)
            }
        }
    }
}