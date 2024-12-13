import { ATPUser } from "$lib/ATPUser.js"

export const load = async ({ params, fetch }) => {
    const user = await ATPUser.fromHandle(params.handle, fetch)
    return {
        diddoc: user.diddoc
    }
}