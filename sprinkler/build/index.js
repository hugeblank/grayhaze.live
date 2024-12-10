"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const promises_1 = require("fs/promises");
function adapt(repo, value) {
    let segments = "";
    let sum = 0;
    for (let segment of value["sequence"]) {
        sum += segment["duration"];
        segments += `#EXTINF:${segment["duration"]},\nhttps://pds.atproto.hugeblank.dev/xrpc/com.atproto.sync.getBlob?did=${repo}&cid=${segment["src"]["ref"]["$link"]}\n`;
    }
    return `#EXTM3U
#EXT-X-VERSION:${value["version"]}
#EXT-X-MEDIA-SEQUENCE:${value["mediaSequence"]}
#EXT-X-TARGETDURATION:${sum / segments.length}
${segments}
${value["end"] ? "#EXT-X-ENDLIST" : ""}`;
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
app.use(express_1.default.static('static'));
app.get("/:repo/:rkey", async (req, res) => {
    let file = (await (0, promises_1.readFile)("index.html")).toString();
    file = file.replace(":repo", req.params.repo).replace(":rkey", req.params.rkey);
    res.status(200).setHeader("Access-Control-Allow-Origin", "*").send(file);
});
app.listen(6080, () => {
    console.log("http://localhost:6080/did:web:hugeblank.dev/3lcwgxk5qc22w");
});
