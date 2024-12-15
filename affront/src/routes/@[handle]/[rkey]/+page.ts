import { ATURI } from '$lib/ATURI.js'
import { error } from '@sveltejs/kit'

export const load = async ({ params, parent }) => {
    const data = await parent()
    try {
        const { value } = await data.user.agent.live.grayhaze.content.stream.get({
            repo: data.user.did,
            rkey: params.rkey
        })
        return {
            title: value.title,
            thumbnail: value.thumbnail,
            tags: value.tags,
            streamrkey: params.rkey,
            formatrkey: new ATURI(value.content.uri).rkey
        }
    } catch {
        error(400, "No stream Found")
    }
}