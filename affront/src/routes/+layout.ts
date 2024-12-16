import { lexicons } from "@atproto/api"
import { isValidLexiconDoc, parseLexiconDoc } from "@atproto/lexicon"

export const load = async ({ fetch, data }) => { 
    const paths: any[] = (await (await fetch("/public/lexicons.json")).json())
    // Not too bothered about when these load in for now.
    Promise.all(paths.map(async (doc, ind) => {
        if (lexicons.get(doc["id"])) return
        if (!isValidLexiconDoc(doc)) console.error(`key ${ind} is not a valid LexiconDoc`)
        let ldoc = parseLexiconDoc(doc)
        lexicons.add(ldoc)
    }))
    return {
        ...data
    }
}