import { lexicons } from '@atproto/api'

export const load = async ({ parent }) => {
    const data = await parent()
    const hlsdata = await data.user.listRecords("live.grayhaze.format.hls")
    const hlsrecords = hlsdata.records.map((record) => {
        const split = record.uri.split("/")
        return split[split.length-1]
    })
    return {
        hlsrecords
    }
}