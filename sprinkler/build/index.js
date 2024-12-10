"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const promises_1 = require("fs/promises");
const dotenv_1 = __importDefault(require("dotenv"));
const resolve_1 = require("./resolve");
const types_1 = require("./types");
dotenv_1.default.config();
function adapt(repo, value) {
    let segments = "";
    let sum = 0;
    let isfmp4 = false;
    for (let segment of value["sequence"]) {
        const src = segment["src"];
        isfmp4 = (src["mimeType"] === "video/mp4" || src["mimeType"] === "video/iso.segment");
        sum += segment["duration"];
        segments += `#EXTINF:${segment["duration"]},\n/blob/${repo}/${src["ref"]["$link"]}\n`;
    }
    return `#EXTM3U
#EXT-X-PLAYLIST-TYPE:${(value["end"] ? "VOD" : "EVENT")}
#EXT-X-VERSION:${value["version"]}
#EXT-X-MEDIA-SEQUENCE:${value["mediaSequence"] + (isfmp4 ? ("\n#EXT-X-MAP:URI=/static/init.mp4") : "")}
#EXT-X-TARGETDURATION:${Math.floor(sum / value["sequence"].length)}
${segments + (value["end"] ? "#EXT-X-ENDLIST" : "")}`;
}
function onCatch(e, res) {
    if (e instanceof types_1.SprinklerError) {
        e.emitResponse(res);
    }
    else {
        res.status(500).json({ error: "Unknown Error" });
    }
}
async function resolvePDS(did) {
    const doc = await (0, resolve_1.resolveDID)(did);
    for (let service of doc.service) {
        if (service.id === "#atproto_pds") {
            return service.serviceEndpoint;
        }
    }
    throw new types_1.SprinklerError(`did ${did} has no ATProto PDS`, 500);
}
const app = (0, express_1.default)();
app.get("/:handle", async (req, res) => {
    if (req.params.handle === "favicon.ico")
        return res.redirect("/static/favicon.ico");
    try {
        if (req.params.handle.at(0) !== "@")
            throw new types_1.SprinklerError(`Could not find handle ${req.params.handle}`, 404);
        req.params.handle = req.params.handle.replace("@", "");
        const apiResponse = await fetch(`https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=${req.params.handle}`);
        if (!apiResponse.ok)
            throw new types_1.SprinklerError(`Could not find handle ${req.params.handle}`, 404);
        const repo = (await apiResponse.json())["did"];
        const pds = await resolvePDS(repo);
        const pdsResponse = await fetch(`${pds}/xrpc/com.atproto.repo.getRecord?repo=${repo}&collection=live.grayhaze.actor.channel&rkey=self`);
        if (!pdsResponse.ok)
            throw new types_1.SprinklerError(`No such GrayHaze user ${req.params.handle}`, 404);
    }
    catch (e) {
        onCatch(e, res);
    }
});
app.get("/adapt/:repo/:rkey\.m3u8", async (req, res) => {
    try {
        const pds = await resolvePDS(req.params.repo);
        const pdsResponse = await fetch(`${pds}/xrpc/com.atproto.repo.getRecord?repo=${req.params.repo}&collection=live.grayhaze.format.hls&rkey=${req.params.rkey}`);
        if (!pdsResponse.ok)
            throw new types_1.SprinklerError(pdsResponse.statusText, pdsResponse.status);
        res.setHeader("Access-Control-Allow-Origin", "*").setHeader("Content-Type", "application/vnd.apple.mpegurl").status(200).send(adapt(req.params.repo, (await pdsResponse.json())["value"]));
    }
    catch (e) {
        onCatch(e, res);
    }
});
app.get("/blob/:repo/:src", async (req, res) => {
    try {
        const pds = await resolvePDS(req.params.repo);
        const pdsResponse = await fetch(`${pds}/xrpc/com.atproto.sync.getBlob?did=${req.params.repo}&cid=${req.params.src}`);
        if (!pdsResponse.ok)
            throw new types_1.SprinklerError("No such blob", 404);
        const blob = await pdsResponse.blob();
        res.setHeaders(pdsResponse.headers).status(pdsResponse.status).contentType(blob.type).send(Buffer.from(await blob.arrayBuffer()));
    }
    catch (e) {
        onCatch(e, res);
    }
});
app.use('/static', express_1.default.static('static'));
app.get("/:repo/:rkey", async (req, res) => {
    let file = (await (0, promises_1.readFile)("index.html")).toString();
    file = file.replace(/:repo/g, req.params.repo).replace(/:rkey/g, req.params.rkey);
    res.status(200).setHeader("Access-Control-Allow-Origin", "*").send(file);
});
app.listen(6080, () => {
    console.log("Ready");
});
