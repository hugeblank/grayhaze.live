import  { type Record as HlsRecord, isRecord } from '$lib/lexicons/types/live/grayhaze/format/hls'
import type { Record as StreamRecord, Thumbnail } from '$lib/lexicons/types/live/grayhaze/content/stream'
import type { LocalSession } from '$lib/session.js'
import { WrappedRecord } from '$lib/WrappedRecord'
import { error } from '@sveltejs/kit'
import { ATURI } from '$lib/ATURI.js'
import { ATPUser } from '$lib/ATPUser.js'

export const load = async ({ locals, params, parent }) => {
    const pdata = await parent()
    const focus = ATPUser.fromDIDDoc(pdata.focusedDiddoc)

    // TODO: List over cursors

    // TODO: Database this
    const formap: Map<string, WrappedRecord<HlsRecord>> = new Map()
    const existsfilter: Set<string> = new Set()

    // Get list of records, validate, then map to a typed WrappedRecord
    // Do this for content that's not associated to a stream 
    const l = locals as LocalSession
    let rawMedia: WrappedRecord<HlsRecord>[] | undefined
    let self = l.user && l.user?.handle === params.handle
    let user
    if (self) {
        user = l.user!
    } else {
        user = await ATPUser.fromHandle(params.handle)
    }

    const hlsdata = await user.agent.live.grayhaze.format.hls.list({ repo: user.did })
    const seqrefs: Map<string, HlsRecord> = new Map()
    rawMedia = WrappedRecord.wrap<HlsRecord>(hlsdata.records.filter((response) => isRecord(response.value))).filter((record) => {
        if (!record.valid) return false
        if (seqrefs.has(record.uri.rkey)) { // If there's a prior record that references us
            const prec = seqrefs.get(record.uri.rkey)! 
            seqrefs.delete(record.uri.rkey)
            record.value.sequence = record.value.sequence.concat(prec.sequence)
            record.value.end = prec.end || record.value.end
        }
        if (record.value.prev) {
            seqrefs.set(record.value.prev, record.value) // Put this record in for the previous record to grab
        }
        return !record.value.prev
    })
    rawMedia.forEach((record) => formap.set(record.uri.rkey, record))

    const publishedStreams = (await Promise.all(WrappedRecord.wrap<StreamRecord>(
        (await focus.agent.live.grayhaze.content.stream.list({ repo: focus.did })).records
    ).filter((record) => record.valid).map(async (record) => {
        const mime = record.value.thumbnail?.image.mimeType
        if (!(mime === "image/png" || mime === "image/jpeg") || !focus.pds) return undefined
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

    let channel
    try {
        channel = WrappedRecord.wrap(await focus.agent.live.grayhaze.actor.channel.get({ repo: focus.did, rkey: "self" }))
    } catch {
        error(404, "Channel not found")
    }

    rawMedia = rawMedia?.filter((record) => {
        return !existsfilter.has(record.uri.toString())
    })


    return {
        rawMedia: self ? rawMedia : undefined,
        publishedStreams,
        self,
        channel
    }
}

export const actions = {
    publish: async ({ request, locals }) => {
        const l = locals as LocalSession
        if (!l.user) error(401, "Unauthorized")
        const data = await request.formData()
        const title = data.get("title") as string | null
        const rawtags = (data.get("tags") as string | null) ?? ""
        const thumbfile = data.get("thumbnail") as File | null
        const hlsuri = new ATURI(data.get("uri") as string)
        const cid = data.get("cid") as string
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
                // Split by comma, trim whitespace, replace spaces with underscore, strip initial octothorpe if present, lowercase, then filter out empty tags.
                const tags = rawtags.split(",").map((tag) => tag.trim().replace(/\s/g, "_").replace(/^#/, "").toLocaleLowerCase()).filter((tag) => tag.length > 0)

                const response = await l.user?.agent.live.grayhaze.content.stream.create({
                    repo: l.user.did,
                }, {
                    title,
                    thumbnail,
                    content: {
                        uri: hlsuri.toString(),
                        cid
                    },
                    tags
                })
                console.log("created stream", response.uri)
            }
        }
    }
}