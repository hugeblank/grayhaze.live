import { ATPUser } from "$lib/ATPUser.js"

export const load = async ({ data }) => {
    //await parent()
    const user = ATPUser.fromDIDDoc(data.diddoc)
    return {
        user,
        ...data
    }
}