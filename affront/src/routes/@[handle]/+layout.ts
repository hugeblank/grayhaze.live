import { ATPUser } from "$lib/ATPUser.js"

export const load = async ({ params }) => {
    const user = await ATPUser.fromHandle(params.handle)
    return {
        user
    }
}