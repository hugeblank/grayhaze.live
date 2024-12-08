import * as fs from 'fs'
import chokidar from 'chokidar'

// add, change, unlink
chokidar.watch("stream").on("all", (e, path) => {
    console.log(e, path)
})