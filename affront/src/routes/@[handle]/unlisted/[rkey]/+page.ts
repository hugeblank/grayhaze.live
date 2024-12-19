export const load = async ({ params, parent }) => {
    const pdata = await parent()
    return {
        rkey: params.rkey,
        ...pdata
    }
}