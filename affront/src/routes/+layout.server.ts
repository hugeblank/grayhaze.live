import { type LocalSession } from '$lib/session.js'

export const prerender = false;

export const load = async ({ locals, fetch }) => { 
    const docs: any[] = (await import("../../static/lexicons.json")).default
    const placeholders = [
        "Ponder",
        "I'm feeling lucky",
        "Search",
        "Gaze",
        "Query",
        "Type here, if you wish",
        "Shout into abyss"
    ]
    return {
        placeholder: placeholders[Math.floor(Math.random() * placeholders.length)],
        diddoc: (locals as LocalSession).user?.diddoc,
        docs
    }
}