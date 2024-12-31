import { error, redirect } from "@sveltejs/kit"
import { client, type LocalSession } from "$lib/session"

export const load = async ({ request, locals }) => {
    let l = locals as LocalSession
    if (l.user) {
        redirect(302, "/")
    }
    const did = new URL(request.url).searchParams.get("did")
    if (!did) error(500, "Missing DID query param")
    const [type, method] = did.split(":")
    if (type !== "did") error(500, "Invalid DID");
    if (method !== "plc" && method !== "web") error(500, `Method ${method} is not blessed`);
    const url = await client!.authorize(did)
    redirect(302, url)
}