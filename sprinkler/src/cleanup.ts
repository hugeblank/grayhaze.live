// lex-cli does not generate the types in a way that I like. cleanup runs through and makes it how i like

import { readdir, readFile, stat, writeFile } from "fs/promises"

// Read in lexicons from given path
async function cleanup() {
    console.log("Let me fix that...")
    const path = 'src/lexicons'
    await Promise.all((await readdir(path, { recursive: true })).map(async (name) => {
        let fpath = `${path}/${name}`
        let stats = await stat(fpath)
        if (!stats.isDirectory()) {
            
            let file = (await readFile(fpath)).toString()
            if (name === "index.ts") {
                // Add missing imports
                file = "import { ComAtprotoRepoCreateRecord, ComAtprotoRepoDeleteRecord, ComAtprotoRepoGetRecord, ComAtprotoRepoListRecords } from '@atproto/api'\n" + file
            }
            await writeFile(fpath, file
                // Replace all relative reference imports to atproto api classes
                .replace(/import \* as (.*) from \'\.\.\/\.\.\/\.\.\/(com\/atproto|app\/bsky)\/.*\'/g, "import { $1 } from '@atproto/api'")
                // Add .js all other relative reference imports 
                .replace(/((import|export) (\{.*\}|\* as .*) from \'\.\.?\/.*)\'/g, "$1.js'")
                // Replace .Main calls appropriately with .Record
                .replace(/LiveGrayhaze(.*)\.Main/, "LiveGrayhaze$1.Record")
            )
            //console.log(fpath, file.replace(/import \* as (.*) from \'\.\.\/\.\.\/\.\.\/(com\/atproto|app\/bsky)\/.*\'/g, "import { $1 } from '@atproto/api'").replace(/(import \{.*\} from \'\.\.?\/.*)\'/g, "$1.js"))
        }
    }))
    console.log("There.")
}

cleanup()