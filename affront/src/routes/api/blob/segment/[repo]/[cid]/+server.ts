import { accept } from "$lib/BlobManager"

export const GET = accept(["video/MP2T", "video/iso.segment"], 60*60*6)