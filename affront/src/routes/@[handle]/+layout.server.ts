import { ATPUser } from "$lib/ATPUser.js"
import type { LocalSession } from "$lib/session.js"

export const load = async ({ params, fetch, locals }) => {
    const user = await ATPUser.fromHandle(params.handle, fetch)
    const l = locals as LocalSession
    return {
        diddoc: user.diddoc,
        owner: l.user?.did === user.did
    }
}