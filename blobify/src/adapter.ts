import { parse, stringify } from 'hls-parser'
import fs, { readdir } from 'fs/promises'
import chokidar from 'chokidar'
import { MediaPlaylist, Segment } from 'hls-parser/types'
import { Agent } from '@atproto/api'
import { JsonBlobRef } from '@atproto/lexicon'
import { PathLike } from 'fs'
import path from 'path'

// State of media in the stream directory
const playlistCache: Map<string, PlaylistHandler> = new Map()

const outputPath = process.env.OUTPUT_PATH as string

interface SegmentData {
    src: JsonBlobRef,
    duration: number
}

interface HlsData {
    $type: "live.grayhaze.format.hls",
    version: number,
    mediaSequence: number,
    sequence: SegmentData[],
    end?: boolean,
}

const segmentMimes: Map<string, string> = new Map()
segmentMimes.set("ts", "video/MP2T")
segmentMimes.set("m4s", "video/iso.segment")

class RecordHandler {
    private agent: Agent
    private rkey: string
    private segments: Segment[]
    private data: HlsData

    static async uploadSegment(agent: Agent, pth: PathLike) {
        const pstr = pth.toString()
        let buf = await fs.readFile(path.join(outputPath, pstr))
        const split = pstr.split(".")
        const { data, success } = await agent.uploadBlob(buf, {
            headers: {
                ["Content-Type"]: segmentMimes.get(split[split.length-1])!,
                ["Content-Length"]: buf.length.toString()
            }
        })
        if (success) return data.blob.original
    }
    private async uploadSegment(pth: PathLike) {
        return await RecordHandler.uploadSegment(this.agent, pth)
    }

    public peek(): Segment {
        return this.segments[this.segments.length-1]
    }

    public async close() {
        this.data.end = true
        const { success, data } = await this.agent.com.atproto.repo.putRecord({
            repo: this.agent.did!,
            rkey: this.rkey,
            collection: this.data.$type,
            record: this.data
        })
        if (success) {
            return data
        } else console.error(`Could not put record ${this.rkey}, failed to mark as ended`)
    }

    public async push(segment: Segment) {
        this.segments.push(segment)
        const emsg = `Could not put record ${this.rkey}, skipping segment ${segment.uri}`
        const blob = await this.uploadSegment(segment.uri)
        if (blob) {
            this.data.sequence.push({ src: blob, duration: segment.duration })
            const { success, data } = await this.agent.com.atproto.repo.putRecord({
                repo: this.agent.did!,
                rkey: this.rkey,
                collection: this.data.$type,
                record: this.data
            })
            if (success) {
                return data
            } else console.error(emsg)
        } else console.error(emsg)
    }

    constructor(agent: Agent, rkey: string, segments: Segment[], data: HlsData) {
        this.agent = agent
        this.rkey = rkey
        this.segments = segments
        this.data = data
    }

    static async create(agent: Agent, playlist: MediaPlaylist, blobs: SegmentData[]) {
        const data: HlsData = {
            $type: "live.grayhaze.format.hls",
            version: playlist.version || 3,
            mediaSequence: playlist.mediaSequenceBase || 0,
            sequence: blobs
        }
        const response = await agent.com.atproto.repo.createRecord({
            repo: agent.did!,
            collection: data.$type,
            record: data
        })
        if (response.success) {
            const aturi = response.data.uri.split("/")
            return new RecordHandler(agent, aturi[aturi.length-1], playlist.segments, data)
        } else {
            throw new Error("Could not create HLS Record")
        }
    }
}

// Class for handling pushing mpegts files up as blobs to the users PDS, then updating the live.grayhaze.content.hls record
class PlaylistHandler {
    private path: string
    private playlist: MediaPlaylist
    private handler: RecordHandler

    private static async readPlaylist(path: PathLike): Promise<MediaPlaylist> {
        return parse((await fs.readFile(path)).toString()) as MediaPlaylist
    }
    private async readPlaylist(): Promise<MediaPlaylist> {
        return PlaylistHandler.readPlaylist(this.path)
    }

    async update() {
        const newpl = await this.readPlaylist()
        const nsegment = newpl.segments[newpl.segments.length - 1]
        if (this.handler.peek().uri !== nsegment.uri) {
            console.log(`Push segment ${nsegment.uri}`)
            await this.handler.push(nsegment)
        }
        if (newpl.endlist) {
            this.playlist.endlist = true
            await this.handler.close()
            console.log("done")
        }
    }

    private constructor(path: string, playlist: MediaPlaylist, record: RecordHandler) {
        this.path = path
        this.playlist = playlist
        this.handler = record
    }

    static async create(agent: Agent, pth: string) {
        const parsed = await PlaylistHandler.readPlaylist(pth)
        let blobs = []
        for (let segment of parsed.segments) {
            const blob = await RecordHandler.uploadSegment(agent, segment.uri)
            if (blob) {
                blobs.push({ src: blob, duration: segment.duration })
            } else {
                console.error(`Failed to upload segment ${segment.uri}`)
            }
        }
        return new PlaylistHandler(pth, parsed, await RecordHandler.create(agent, parsed, blobs))
    }
}

export async function watch(agent: Agent) {
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
