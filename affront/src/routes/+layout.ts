import { lexicons } from "@atproto/api"
import { isValidLexiconDoc, parseLexiconDoc } from "@atproto/lexicon"

export const load = async ({ fetch, data }) => { 
    const paths: string[] = (await (await fetch("/public/lexicons/paths.json")).json())["paths"]
    await Promise.all(paths.map(async (url) => {
        let fpath = `/public/lexicons/${url}`
        const doc = await (await fetch(fpath)).json()
        if (lexicons.get(doc["id"])) return
        if (!isValidLexiconDoc(doc)) console.error(`${fpath} is not a valid LexiconDoc`)
        let ldoc = parseLexiconDoc(doc)
        lexicons.add(ldoc)
    }))
    return {
        placeholder: data.placeholder
    }
}