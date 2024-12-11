import { ATPUser } from "$lib/ATPUser.js"

export async function GET({ params, fetch }) {
    const blob = await (await ATPUser.fromDID(params.repo, fetch)).getBlob(params.cid)
    return new Response(Buffer.from(blob))
}