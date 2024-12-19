import { parse } from 'hls-parser'
import fs, { readdir, writeFile } from 'fs/promises'
import chokidar from 'chokidar'
import { MediaPlaylist, Segment } from 'hls-parser/types.js'
import { PathLike } from 'fs'
import path from 'path'
import { GrayhazeAgent } from './Merged.js'
import { HlsSegment } from './lexicons/types/live/grayhaze/format/defs.js'
import { Record } from './lexicons/types/live/grayhaze/format/hls.js'
import { ComAtprotoRepoPutRecord } from '@atproto/api'

// State of media in the stream directory
const playlistCache: Map<string, PlaylistHandler> = new Map()

const outputPath = process.env.OUTPUT_PATH as string

const segmentMimes: Map<string, string> = new Map()
segmentMimes.set("ts", "video/MP2T")
segmentMimes.set("m4s", "video/iso.segment")

const collection = "live.grayhaze.format.hls"

class RecordHandler {
    private agent: GrayhazeAgent
    private rkey: string
    private playlist: MediaPlaylist
    private record: Record

    private static async uploadSegment(agent: GrayhazeAgent, pth: PathLike) {
        const pstr = pth.toString()
        let buf = await fs.readFile(path.join(outputPath, pstr))
        const split = pstr.split(".")
        const { data, success } = await agent.uploadBlob(buf, {
            headers: {
                ["Content-Type"]: segmentMimes.get(split[split.length-1])!,
                ["Content-Length"]: buf.length.toString()
            }
        })
        if (success) return data.blob
    }
    private async uploadSegment(pth: PathLike) {
        return await RecordHandler.uploadSegment(this.agent, pth)
    }

    public peek(): Segment {
        return this.playlist.segments[this.playlist.segments.length-1]
    }

    public get length(): number {
        return this.playlist.segments.length
    }

    public async close() {
        this.record.end = true
        const { success, data } = await this.update()
        if (success) {
            return data
        } else console.error(`Could not put record ${this.rkey}, failed to mark as ended`)
    }

    public async update(): Promise<{ success: boolean, data: ComAtprotoRepoPutRecord.OutputSchema}> {
        return await this.agent.com.atproto.repo.putRecord({
            repo: this.agent.did!,
            rkey: this.rkey,
            record: this.record,
            collection
        })
    }

    public async push(segment: Segment) {
        this.playlist.segments.push(segment)
        const emsg = `Could not put record ${this.rkey}, skipping segment ${segment.uri}`
        const blob = await this.uploadSegment(segment.uri)
        if (blob) {
            this.record.sequence.push({ src: blob, duration: Math.floor(segment.duration * 1000000 ) })
            const { success, data } = await this.update()
            if (success) {
                return data
            } else console.error(emsg)
        } else console.error(emsg)
    }

    public async next() {
        const { record, rkey } = await RecordHandler.makeRecord(this.agent, this.playlist, [], this.rkey)
        if (!rkey) throw new Error("Failed to push next record")
        this.record.next = rkey
        const { success } = await this.update()
        if (!success) throw new Error("Could not append next reference onto old record")
        return new RecordHandler(this.agent, rkey, this.playlist, record)
    }

    constructor(agent: GrayhazeAgent, rkey: string, playlist: MediaPlaylist, record: Record) {
        this.agent = agent
        this.rkey = rkey
        this.playlist = playlist
        this.record = record
    }

    private static async makeRecord(agent: GrayhazeAgent, playlist: MediaPlaylist, blobs: HlsSegment[], prev?: string): Promise<{ record: Record, rkey: string }> {
        const record = {
            $type: "live.grayhaze.format.hls",
            version: playlist.version || 3,
            mediaSequence: playlist.mediaSequenceBase || 0,
            sequence: blobs,
            prev
        }
        const response = await agent.live.grayhaze.format.hls.create({
            repo: agent.did!,
        }, record)
        if (response) {
            const aturi = response.uri.split("/")
            return { record, rkey: aturi[aturi.length-1] }
        } else {
            throw new Error("Could not create HLS Record")
        }
    }

    static async create(agent: GrayhazeAgent, playlist: MediaPlaylist) {
        let blobs: HlsSegment[] = []
        for (let segment of playlist.segments) {
            const blob = await RecordHandler.uploadSegment(agent, segment.uri)
            if (blob) {
                blobs.push({ src: blob, duration: Math.floor(segment.duration*1000000) })
            } else {
                console.error(`Failed to upload segment ${segment.uri}`)
            }
        }
        const { record, rkey } = await this.makeRecord(agent, playlist, blobs)
        return new RecordHandler(agent, rkey, playlist, record)
    }
}

// Class for handling pushing mpegts files up as blobs to the users PDS, then updating the live.grayhaze.format.hls record
class PlaylistHandler {
    private path: string
    private handler: RecordHandler

    private async readPlaylist(): Promise<MediaPlaylist> {
        return parse((await fs.readFile(this.path)).toString()) as MediaPlaylist
    }

    async update() {
        const newpl = await this.readPlaylist()
        const nsegment = newpl.segments[newpl.segments.length - 1]
        if (this.handler.peek().uri !== nsegment.uri) {
            console.log(`Push segment ${nsegment.uri}`)
            await this.handler.push(nsegment)
            try {
                await writeFile("temp/counter.txt", "Segments: " + this.handler.length.toString())
            } catch {
                console.log("failed to write " + this.handler.length.toString())
            }
            if (this.handler.length % 512 == 0) {
                console.log("Creating next record")
                this.handler = await this.handler.next()
                try {
                    await writeFile("temp/next.txt", "SUCCESS!?")
                } catch {
                    console.log("failed to write...")
                }
            }
        }
        if (newpl.endlist) {
            await this.handler.close()
            console.log("done")
        }
    }

    private constructor(path: string, record: RecordHandler) {
        this.path = path
        this.handler = record
    }

    static async create(agent: GrayhazeAgent, pth: string) {
        return new PlaylistHandler(pth, await RecordHandler.create(agent, parse((await fs.readFile(pth)).toString()) as MediaPlaylist)) 
    }
}

export async function watch(agent: GrayhazeAgent) {
    // add, change, unlink
    await fs.mkdir(outputPath, {
        recursive: true
    })
    const paths = await readdir(outputPath)
    chokidar.watch(outputPath).on("all", async (e: string, path: string) => {
        const m3u8 = path.endsWith(".m3u8")
        if (e == "add" && m3u8) {
            const split = path.split("/")
            if (!paths.includes(split[split.length-1])) { // Exclude playlists that already exist
                console.log("new shiny")
                playlistCache.set(path, await PlaylistHandler.create(agent, path))
            }
        } else if (e == "change" && m3u8) {
            if (playlistCache.has(path)) {
                await playlistCache.get(path)!.update()
            }
        }
    })
}
