import { lexicons } from '$lib/lexicons/lexicons.js'

export const load = async ({ parent }) => {
    const data = await parent()
    const agent = data.user.getAgent()
    const hlsdata = await agent.live.grayhaze.format.hls.list({ repo: data.user.getDID() })
    const streamdata = await agent.live.grayhaze.content.stream.list({ repo: data.user.getDID() })
    return {
        records: hlsdata.records.filter((record) => lexicons.validate("live.grayhaze.format.hls", record.value).success),
        streams: streamdata.records,
        self: data.diddoc?.id == data.user.getDID()
    }
}