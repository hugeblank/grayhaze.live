import type { Record as HlsRecord } from '$lib/lexicons/types/live/grayhaze/format/hls'
import type { Record as StreamRecord } from '$lib/lexicons/types/live/grayhaze/content/stream'
import type { LocalSession } from '$lib/session.js'
import { WrappedRecord } from '$lib/WrappedRecord'
import { lexicons } from '@atproto/api'
import { redirect } from '@sveltejs/kit'
import { ATPUser } from '$lib/ATPUser.js'
import { ATURI } from '$lib/ATURI.js'

export const load = async ({ locals, params, parent }) => {
    const pdata = await parent()


    const formap: Map<string, WrappedRecord<HlsRecord>> = new Map()

    // Get list of records, validate, then map to a typed WrappedRecord
    // Do this for content that's not associated to a stream, then 
    const l = locals as LocalSession
    let rawMedia: WrappedRecord<HlsRecord>[] | undefined
    let self = false
    if (l.user && l.user?.handle === params.handle) {
        const hlsdata = await l.user.agent.live.grayhaze.format.hls.list({ repo: l.user.did })
        rawMedia = WrappedRecord.wrap<HlsRecord>(hlsdata.records.filter((record) => lexicons.validate("live.grayhaze.format.hls", record.value).success))
        rawMedia.forEach((record) => formap.set(record.uri.rkey, record))
        self = true
    }

    const user = ATPUser.fromDIDDoc(pdata.diddoc)
    const publishedStreams = (await Promise.all(WrappedRecord.wrap<StreamRecord>(
        (await user.agent.live.grayhaze.content.stream.list({ repo: user.did })).records
            .filter((record) => lexicons.validate("live.grayhaze.content.stream", record.value).success)
    ).map(async (record) => {
        const mime = record.value.thumbnail?.image.mimeType
        if (!(mime === "image/png" || mime === "image/jpeg") || !user.pds) return undefined
        const uri = new ATURI(record.value.content.uri)
        try {
            const hlsrecord = formap.has(uri.rkey) ? formap.get(uri.rkey) : WrappedRecord.wrap<HlsRecord>(await uri.fetch(user.agent))
            if (!hlsrecord) return undefined
            return { hlsrecord, streamrecord: record }
        } catch {
            return undefined
        }
    }))).filter((records) => {
        return records !== undefined
    })

    return {
        rawMedia,
        publishedStreams,
        self
    }
}

export const actions = {
    publish: async ({ cookies, request, locals }) => {
        const l = locals as LocalSession
        const data = await request.formData()
        const title = data.get("title") as string | null
        const rkey = data.get("rkey") as string
        const cid = data.get("cid") as string
        console.log("submitted?")
        if (title) {
            // TODO: Finding a hls record from a stream should be a query
            // let cursor
            // let existing: { uri: string; cid: string; value: Record; } | undefined
            // do {
            //     const list = await l.user?.getAgent().live.grayhaze.content.stream.list({ repo: l.user.getDID() })
            //     cursor = list?.cursor
            //     list?.records.forEach((record) => {
            //         const uri = new ATURI(record.value.content.uri)
            //         if (uri.rkey === rkey) {
            //             existing = record
            //         }
            //     })
            // } while (cursor);
            // await l.user?.getAgent().live.grayhaze.content.stream.create({
            //     repo: l.user.getDID(),
                
            // }, {
            //     title,
            //     content: {
            //         uri: `at://${l.user.getDID()}/live.grayhaze.format.`
            //     }
            // })
        }
        redirect(302, request.url.replace(/\?\/publish$/, ""))
    }
}