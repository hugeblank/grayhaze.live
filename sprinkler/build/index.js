"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const promises_1 = require("fs/promises");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function adapt(repo, value) {
    let segments = "";
    let sum = 0;
    let isfmp4 = false;
    for (let segment of value["sequence"]) {
        const src = segment["src"];
        isfmp4 = (src["mimeType"] === "video/mp4" || src["mimeType"] === "video/iso.segment");
        sum += segment["duration"];
        segments += `#EXTINF:${segment["duration"]},\n${process.env.HOST}/blob/${repo}/${src["ref"]["$link"]}\n`;
    }
    return `#EXTM3U
#EXT-X-PLAYLIST-TYPE:${(value["end"] ? "VOD" : "EVENT")}
#EXT-X-VERSION:${value["version"]}
#EXT-X-MEDIA-SEQUENCE:${value["mediaSequence"] + (isfmp4 ? ("\n#EXT-X-MAP:URI=" + process.env.HOST + "/init.mp4") : "")}
#EXT-X-TARGETDURATION:${Math.floor(sum / value["sequence"].length)}
${segments + (value["end"] ? "#EXT-X-ENDLIST" : "")}`;
}
const app = (0, express_1.default)();
app.get("/adapt/:repo/:rkey\.m3u8", async (req, res) => {
    // TODO: resolve pds
    const pdsResponse = await fetch(`https://pds.atproto.hugeblank.dev/xrpc/com.atproto.repo.getRecord?repo=${req.params.repo}&collection=live.grayhaze.format.hls&rkey=${req.params.rkey}`);
    if (!pdsResponse.ok) {
        res.status(pdsResponse.status).send(pdsResponse.statusText);
        return;
    }
    res.setHeader("Access-Control-Allow-Origin", "*").setHeader("Content-Type", "application/vnd.apple.mpegurl").status(200).send(adapt(req.params.repo, (await pdsResponse.json())["value"]));
});
app.get("/blob/:repo/:src", async (req, res) => {
    const pdsResponse = await fetch(`https://pds.atproto.hugeblank.dev/xrpc/com.atproto.sync.getBlob?did=${req.params.repo}&cid=${req.params.src}`);
    const blob = await pdsResponse.blob();
    res.setHeaders(pdsResponse.headers).status(pdsResponse.status).contentType(blob.type).send(Buffer.from(await blob.arrayBuffer()));
});
app.use(express_1.default.static('static'));
app.get("/:repo/:rkey", async (req, res) => {
    let file = (await (0, promises_1.readFile)("index.html")).toString();
    file = file.replace(/:repo/g, req.params.repo).replace(/:rkey/g, req.params.rkey).replace(/:host/g, process.env.HOST);
    res.status(200).setHeader("Access-Control-Allow-Origin", "*").send(file);
});
app.listen(6080, () => {
    console.log("Ready");
});
