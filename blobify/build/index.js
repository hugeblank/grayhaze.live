"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hls_parser_1 = __importDefault(require("hls-parser"));
const promises_1 = __importDefault(require("fs/promises"));
const chokidar_1 = __importDefault(require("chokidar"));
let playlistCache = new Map();
// add, change, unlink
promises_1.default.mkdir("stream", {
    recursive: true
});
chokidar_1.default.watch("stream").on("all", (e, path) => __awaiter(void 0, void 0, void 0, function* () {
    if (e == "add") {
        if (path.endsWith(".m3u8")) { // Playlist
            let out = yield promises_1.default.readFile(path);
            playlistCache.set(path, out);
            let pl = hls_parser_1.default.parse(out.toString());
            console.log(pl.segments[0]);
        }
        else if (path.endsWith(".ts")) { // MPEG-2 Segment
        }
    }
    else if (e == "change" && path.endsWith(".m3u8")) {
        let oldFile = playlistCache.get(path);
        let newFile = yield promises_1.default.readFile(path);
        playlistCache.set(path, newFile);
        const diff = newFile === null || newFile === void 0 ? void 0 : newFile.subarray(oldFile === null || oldFile === void 0 ? void 0 : oldFile.length).toString();
    }
}));
