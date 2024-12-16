// lex-cli does not generate the types in a way that I like. cleanup runs through and makes it how i like
import dotenv from 'dotenv'
dotenv.config()
import { readdir, readFile, stat, writeFile } from "fs/promises"
import path from 'path'

// Read in lexicons from given path
async function cleanup() {
    const basepath = './build/lexicons'
    if (!process.env.TARGET) throw new Error("Missing TARGET env variable")
    const jsons: any[] = []
    await Promise.all((await readdir(basepath, { recursive: true })).map(async (name) => {
        let fpath = path.resolve(`${basepath}/${name}`)
        let stats = await stat(fpath)
        if (!stats.isDirectory()) {
            
            let file = (await readFile(fpath)).toString()
            if (name === "index.ts") {
                // Add missing imports
                file = "import { ComAtprotoRepoCreateRecord, ComAtprotoRepoDeleteRecord, ComAtprotoRepoGetRecord, ComAtprotoRepoListRecords } from '@atproto/api'\n" + file.replace(/export \* as .*/g, "")
            }
            if (process.env.TARGET === "affront") {
                if (name.startsWith("types")) jsons.push(JSON.parse((await readFile(`${name.replace("types/", "").replace(".ts", ".json")}`)).toString()))
                await writeFile(fpath, file
                    // Replace all relative reference imports to atproto api classes
                    .replace(/import \* as (.*) from \'\.\.\/\.\.\/\.\.\/(com\/atproto|app\/bsky)\/.*\'/g, "import { $1 } from '@atproto/api'")
                    // Add the 'type' prefix to imported declarations where necessary
                    .replace(/import \{ (.*) \} from '@(.*)'/g, (sub, types, location) => {
                        return `import { ${types.replace(/(FetchHandler|LexiconDoc|ValidationResult|HeadersMap)/g, "type $1")} } from '@${location}'`
                    })
                    // Resolve to where $lib would be
                    .replace(/(import|export) (\{.*\}|\* as .*) from \'(\.\.?\/.*)\'/g, (sub, declaration, types, location) => {
                        const base = path.relative(path.resolve() + "/build", path.resolve(path.dirname(fpath), location))
                        return `${declaration} ${types} from '$lib/${base}'`
                    })
                    // Replace .Main calls appropriately with .Record
                    .replace(/LiveGrayhaze(.*)\.Main/g, "LiveGrayhaze$1.Record")
                )
            } else if (process.env.TARGET === "sprinkler") {
                await writeFile(fpath, file
                        // Replace all relative reference imports to atproto api classes
                        .replace(/import \* as (.*) from \'\.\.\/\.\.\/\.\.\/(com\/atproto|app\/bsky)\/.*\'/g, "import { $1 } from '@atproto/api'")
                        // Add .js all other relative reference imports 
                        .replace(/((import|export) (\{.*\}|\* as .*) from \'(\.\.?\/.*))\'/g, "$1.js'")
                        // Replace .Main calls appropriately with .Record
                        .replace(/LiveGrayhaze(.*)\.Main/g, "LiveGrayhaze$1.Record")
                )
            } else {
                throw new Error("No such cleanup operation" + process.env.TARGET)
            }
        }
    }))
    if (process.env.TARGET === "affront") await writeFile("build/lexicons.json", JSON.stringify(jsons))
    console.log("Cleaned.")
}

cleanup()