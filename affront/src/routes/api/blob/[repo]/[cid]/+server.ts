import { ATPUser } from "$lib/ATPUser.js"

export async function GET({ params }) {
    const blob = await (await ATPUser.fromDID(params.repo)).getBlob(params.cid)
    return new Response(Buffer.from(blob))
}