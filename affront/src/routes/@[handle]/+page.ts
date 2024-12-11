import type { Record } from '@atproto/api/dist/client/types/com/atproto/repo/listRecords.js'

interface HLSRecord extends Record {

}

export const load = async ({ parent }) => {
    const data = await parent()
    const hlsdata = await data.user.listRecords("live.grayhaze.format.hls")
    return {
        records: hlsdata.records
    }
}