import { ATPUser } from '$lib/ATPUser.js'

export const load = async ({ data, parent }) => {
    const pdata = await parent()
    const focus = ATPUser.fromDIDDoc(data.focusedDiddoc)
    return {
        ...pdata,
        owner: data.owner,
        focus
    }
}