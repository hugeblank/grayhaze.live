import { parse, stringify } from 'hls-parser'
// import hls from 'hls-parser' <- does not work despite the linter not complaining
import fs from 'fs/promises'
import chokidar from 'chokidar'
import { MediaPlaylist } from 'hls-parser/types'

// 
let playlistCache: Map<string, MediaPlaylist> = new Map()

async function readPlaylist(path: string): Promise<MediaPlaylist> {
    return parse((await fs.readFile(path)).toString()) as MediaPlaylist
}

// add, change, unlink
fs.mkdir("stream", {
    recursive: true
})
chokidar.watch("stream").on("all", async (e: string, path: string) => {
    if (e == "add") {
        if (path.endsWith(".ts")) { // Segment
            
        }
        if (path.endsWith(".m3u8")) { // Playlist
            const pl = await readPlaylist(path)
            playlistCache.set(path, pl)
            console.log("new shiny")
        }
    } else if (e == "change" && path.endsWith(".m3u8")) {
        const pl = playlistCache.get(path)!
        const newpl = await readPlaylist(path)
        if (pl.segments[pl.segments.length - 1].uri !== newpl.segments[newpl.segments.length - 1].uri) {
            console.log(`Push segment ${newpl.segments[newpl.segments.length-1].uri}`)
            pl.segments.push(newpl.segments[newpl.segments.length-1])
        }
        if (newpl.endlist) {
            pl.endlist = true
            fs.writeFile(`${path.substring(0, path.length-5)}_full.m3u8`, stringify(pl))
            console.log("done")
        }
    }
})