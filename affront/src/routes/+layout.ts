import { lexicons } from "@atproto/api"
import { isValidLexiconDoc, parseLexiconDoc } from "@atproto/lexicon"

export const load = async ({ data }) => { 
    // Not too bothered about when these load in for now.
    data.docs.forEach((doc: any, ind: number) => {
        if (lexicons.get(doc["id"])) return
        if (!isValidLexiconDoc(doc)) console.error(`key ${ind} is not a valid LexiconDoc`)
        let ldoc = parseLexiconDoc(doc)
        lexicons.add(ldoc)
    })
    return {
        diddoc: data.diddoc,
        placeholder: data.placeholder
    }
}