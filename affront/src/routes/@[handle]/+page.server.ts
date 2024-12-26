import  { type Record as HlsRecord, isRecord } from '$lib/lexicons/types/live/grayhaze/format/hls'
import type { Record as StreamRecord, Thumbnail } from '$lib/lexicons/types/live/grayhaze/content/stream'
import type { LocalSession } from '$lib/session.js'
import { WrappedRecord } from '$lib/WrappedRecord'
import { error } from '@sveltejs/kit'
import { ATURI } from '$lib/ATURI.js'
import { ATPUser } from '$lib/ATPUser.js'

interface StreamRecordDetails {
    progress: string;
    title: string;
    thumbnail: string | undefined;
    tags: string[] | undefined;
}

interface BasicRecordView<T> {
    uri: ATURI,
    cid: string | undefined,
    live: boolean;
    to: string; // Relative path to resource, from the user's channel
    id: string;
    duration: number;
    details: T
}

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
    let rawMedia: BasicRecordView<undefined>[] | undefined
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
    }).map((record) => {
        let duration = 0
        record.value.sequence.forEach((seg) => {
            duration += seg.duration/1000000
        })
        formap.set(record.uri.rkey, record)
        return {
            uri: record.uri,
            cid: record.cid,
            live: !record.value.end,
            to: `/unlisted/${record.uri.rkey}`,
            id: record.uri.toString(),
            details: undefined,
            duration
        }
    })

    const publishedStreams: BasicRecordView<StreamRecordDetails>[] = (await Promise.all(WrappedRecord.wrap<StreamRecord>(
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
    }).map(({ streamrecord, hlsrecord }) => {
        // TODO: Support more than hls record format
        let duration = 0
        hlsrecord.value.sequence.forEach((seg) => {
            duration += seg.duration/1000000
        })
        return {
            uri: streamrecord.uri,
            cid: streamrecord.cid,
            live: !hlsrecord.value.end,
            to: `/${streamrecord.uri.rkey}`,
            id: streamrecord.uri.toString(),
            duration,
            details: {
                progress: hlsrecord.uri.rkey,
                thumbnail: (streamrecord.value.thumbnail !== undefined) ? `/api/blob/image/${streamrecord.uri.repo}/${streamrecord.value.thumbnail.image.ref.toString()}` : undefined,
                title: streamrecord.value.title,
                tags: streamrecord.value.tags
            }
        }
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
        const cid = data.get("cid")?.toString() ?? undefined
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
                // The generated code from lex-cli doesn't show that `cid` is a value in `list` response records.
                // It seems to be wrong, but just in case this isn't something that's enforced at a protocol level, we catch it here.
                // To be clear, this would be a game-ender for any user that wants to stream on GrayHaze, as now because of their PDS they can't publish streams.
                if (!cid) error(400, "Unable to publish stream. PDS failed to provide Record CIDs.")

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