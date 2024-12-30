import { ATPUser } from '$lib/ATPUser.js'

export const load = async ({ data, parent }) => {
    const pdata = await parent()
    return {
        ...pdata,
        owner: data.owner,
        focus: ATPUser.fromDIDDoc(data.focusedDiddoc)
    }
}