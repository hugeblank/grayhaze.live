import { resolvePDS } from "$lib/resolve"
import { onCatch, SprinklerError } from "$lib/error"

export async function GET({ params }) {
    try {
        const pds = await resolvePDS(params.repo)
        const pdsResponse = await fetch(`${pds}/xrpc/com.atproto.sync.getBlob?did=${params.repo}&cid=${params.src}`)
        if (!pdsResponse.ok) throw new SprinklerError("No such blob", 404)
        const blob = await pdsResponse.blob()
        return new Response(Buffer.from(await blob.arrayBuffer()))
    } catch (e) { onCatch(e) }
}