import { ATPUser } from "$lib/ATPUser.js"
import { error } from "@sveltejs/kit"
import { EphemeralStore } from "./Stores"

const content_type = "Content-Type"

function buildResponse(buf: Buffer, mime: string) {
    const resp = new Response(buf)
    resp.headers.set(content_type, mime)
    return resp
}

export function accept(blessed: string[], duration: number) {
    const cache = EphemeralStore.of("blob", duration)
    return async ({ params, fetch }: { params: { repo: string, cid: string }, fetch: { (input: RequestInfo | URL, init?: RequestInit): Promise<Response>; (input: string | URL | globalThis.Request, init?: RequestInit): Promise<Response>; } }) => {
        const ckey = ([params.repo, params.cid]).join(":")
        const cbuf = await cache.getBuffer(ckey)
        if (cbuf) {
            return buildResponse(cbuf.subarray(1), blessed[cbuf.readUInt8(0)])
        }
        const user = await ATPUser.fromDID(params.repo, fetch)
        const blob = await user.agent.com.atproto.sync.getBlob({
            did: user.did,
            cid: params.cid
        })
        if (!blob.success) error(400, "Error fetching blob")
        const type = blob.headers[content_type] ?? blob.headers[content_type.toLowerCase()]
        if (!blessed.includes(type)) error(400, "Blob does not match blessed MIME types")
        const buffer = Buffer.from(blob.data)
        cache.set(ckey, Buffer.concat([Uint8Array.of(blessed.indexOf(type)), buffer]))
        return buildResponse(buffer, type)
    }
}
