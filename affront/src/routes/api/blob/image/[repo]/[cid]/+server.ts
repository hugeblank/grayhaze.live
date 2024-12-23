import { accept } from "$lib/BlobManager"

export const GET = accept(["image/png", "image/jpeg"], 60*60*24)