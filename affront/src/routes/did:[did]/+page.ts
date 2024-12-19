import { ATPUser } from "$lib/ATPUser"
import { error, redirect } from "@sveltejs/kit"

export const load = async ({ params, fetch, url }) => {
    // TODO redirect all pages out to a handle
    //console.log(url.pathname)
    const user = await ATPUser.fromDID(`did:${params.did}`, fetch)
    if (!user.handle) error(400, "Handle required to use GrayHaze")
    redirect(302, `/@${user.handle}`)
}