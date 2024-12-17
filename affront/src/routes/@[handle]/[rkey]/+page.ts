import { ATURI } from '$lib/ATURI.js'
import { error } from '@sveltejs/kit'

export const load = async ({ params, parent, data}) => {
    const pdata = await parent()
    try {
        const { value } = await pdata.user.agent.live.grayhaze.content.stream.get({
            repo: pdata.user.did,
            rkey: params.rkey
        })
        return {
            ...data,
            title: value.title,
            thumbnail: value.thumbnail,
            tags: value.tags,
            streamrkey: params.rkey,
            formatrkey: new ATURI(value.content.uri).rkey,
            owner: pdata.owner
        }
    } catch {
        error(400, "No stream Found")
    }
}