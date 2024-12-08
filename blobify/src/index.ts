import hls from 'hls-parser'
import fs from 'fs/promises'
import chokidar from 'chokidar'
import { MediaPlaylist, Segment } from 'hls-parser/types'

let playlistCache: Map<string, Buffer> = new Map()

// add, change, unlink
fs.mkdir("stream", {
    recursive: true
})
chokidar.watch("stream").on("all", async (e: string, path: string) => {
    if (e == "add") {
        if (path.endsWith(".m3u8")) { // Playlist
            let out = await fs.readFile(path)
            playlistCache.set(path, out)
            let pl = hls.parse(out.toString()) as MediaPlaylist
            console.log(pl.segments[0])
        } else if (path.endsWith(".ts")) { // MPEG-2 Segment

        }
    } else if (e == "change" && path.endsWith(".m3u8")) {
        let oldFile = playlistCache.get(path)
        let newFile = await fs.readFile(path)
        
        playlistCache.set(path, newFile)
        const diff = newFile?.subarray(oldFile?.length).toString()
    }
})