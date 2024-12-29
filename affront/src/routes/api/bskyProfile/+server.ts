import type { CertainLocalSession, LocalSession } from '$lib/session.js'
import { error } from '@sveltejs/kit'

// export async function GET({ locals, fetch }) {
//     const l = locals as LocalSession
//     if (!l.user) error(401, "Unauthorized")
//     const { user } = locals as CertainLocalSession
//     let response
//     try {
//         response = await user.agent.app.bsky.actor.profile.get({
//             repo: user.did,
//             rkey: "self"
//         })
//     } catch {
//         // TODO: Error popup dialog
//         error(404, `No such record in repo ${user.did}`)
//     }
//     const record = response.value
//     let avatar = undefined
//     let banner = undefined
//     if (record.avatar) {
//         try {
//             avatar = await (await fetch(`/api/blob/image/${user.did}/${record.avatar.ref}`)).arrayBuffer()
//         } catch {
//             console.warn(`failed to fetch avatar at ${record.avatar}`)
//         }
//     }
//     if (record.banner) {
//         try {
//             banner = await (await fetch(`/api/blob/image/${user.did}/${record.banner.ref}`)).arrayBuffer()
//         } catch {
//             console.warn(`failed to fetch banner at ${record.banner}`)
//         }
//     }
// }