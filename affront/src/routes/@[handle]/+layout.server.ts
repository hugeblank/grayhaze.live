import { ATPUser } from "$lib/ATPUser.js"
import type { LocalSession } from "$lib/session.js"

export const load = async ({ params, fetch, locals }) => {
    const focus = await ATPUser.fromHandle(params.handle, fetch)
    const l = locals as LocalSession
    return {
        owner: l.user?.did === focus.did,
        focusedDiddoc: focus.diddoc
    }
}