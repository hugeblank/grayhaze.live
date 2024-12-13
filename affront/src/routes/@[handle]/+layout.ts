import { ATPUser } from "$lib/ATPUser.js"

export const load = async ({ data }) => {
    const user = ATPUser.fromDIDDoc(data.diddoc)
    return {
        user
    }
}