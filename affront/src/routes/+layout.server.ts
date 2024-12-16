import { type LocalSession } from '$lib/session.js'

export const load = async ({ locals }) => { 
    const docs: any[] = await (await fetch("http://localhost:6080/public/lexicons.json")).json()
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