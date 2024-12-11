import { ATPUser } from "$lib/ATPUser"
import { redirect } from "@sveltejs/kit"

export const load = async ({ params, fetch }) => {
    const user = await ATPUser.fromDID(`did:${params.did}`, fetch)
    redirect(302, `/@${user.getHandle().replace("at://", "")}`)
}