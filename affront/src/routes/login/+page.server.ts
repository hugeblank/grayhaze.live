import { redirect } from "@sveltejs/kit"
import { type LocalSession } from "$lib/session"

export const load = async ({ locals }) => {
    let l = locals as LocalSession
    if (l.user) {
        redirect(302, "/")
    }
}