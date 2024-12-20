import { ATPUser } from "$lib/ATPUser.js"
import { error } from "@sveltejs/kit"

const content_type = "Content-Type"

export function accept(blessed: string[]) {
    return async ({ params, fetch }: { params: {repo: string, cid: string}, fetch: { (input: RequestInfo | URL, init?: RequestInit): Promise<Response>; (input: string | URL | globalThis.Request, init?: RequestInit): Promise<Response>; }})  => {
        const user = await ATPUser.fromDID(params.repo, fetch)
        const blob = await user.agent.com.atproto.sync.getBlob({
            did: user.did,
            cid: params.cid
        })
        if (!blob.success) error(400, "Error fetching blob")
        const type = blob.headers[content_type] ?? blob.headers[content_type.toLowerCase()]
        if (!blessed.includes(type)) error(400, "Blob does not match blessed MIME types")
        const resp = new Response(Buffer.from(blob.data))
        resp.headers.set(content_type, type)
        return resp
    }
}
