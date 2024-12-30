import { ATPUser } from "$lib/ATPUser.js"
import type { LocalSession } from "$lib/session.js"

export const load = async ({ params, fetch, locals }) => {
    const focus = await ATPUser.fromHandle(params.handle, fetch)
    return {
        owner: (locals as LocalSession).user?.did === focus.did,
        focusedDiddoc: focus.diddoc
    }
}