import dotenv from 'dotenv'
dotenv.config()

import { lexicons } from "@atproto/api";
import { getAgent } from "./agent";
import { PathLike } from "fs";
import { readdir, readFile, stat } from "fs/promises";
import { isValidLexiconDoc, parseLexiconDoc } from "@atproto/lexicon";
import { watch } from './adapter';


// Read in lexicons from given path
async function importLex(path: PathLike) {
    await Promise.all((await readdir(path, { recursive: true })).map(async (file) => {
        let fpath = `${path}/${file}`
        let stats = await stat(fpath)
        if (!stats.isDirectory() && !file.endsWith("paths.json")) {
            const doc = JSON.parse((await readFile(fpath)).toString())
            if (!isValidLexiconDoc(doc)) console.error(`${fpath} is not a valid LexiconDoc`)
            let ldoc = parseLexiconDoc(doc)
            lexicons.add(ldoc)
        }
    }))
}

async function main() {
    console.log("Loading agent")
    const agent = await getAgent()
    console.log("Loading lexicons")
    await importLex("../lexicons")
    console.log("Initializing watcher")
    await watch(agent)
    console.log("Ready")
}

main()