import { ATURI } from '$lib/ATURI.js'
import { error } from '@sveltejs/kit'

export const load = async ({ params, parent}) => {
    const pdata = await parent()
    try {
        const { value } = await pdata.focus.agent.live.grayhaze.content.stream.get({
            repo: pdata.focus.did,
            rkey: params.rkey
        })
        return {
            title: value.title,
            thumbnail: value.thumbnail,
            tags: value.tags,
            streamrkey: params.rkey,
            formatrkey: new ATURI(value.content.uri).rkey,
            ...pdata
        }
    } catch {
        error(400, "No stream Found")
    }
}