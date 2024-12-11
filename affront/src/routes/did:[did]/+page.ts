import { ATPUser } from "$lib/ATPUser"
import { redirect } from "@sveltejs/kit"

export const load = async ({ params }) => {
    const user = await ATPUser.fromDID(`did:${params.did}`)
    redirect(302, `/@${user.getHandle().replace("at://", "")}`)
}