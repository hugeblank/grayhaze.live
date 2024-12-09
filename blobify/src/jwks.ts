import { JoseKey } from '@atproto/jwk-jose'
import fs from 'fs/promises'
import dotenv from 'dotenv'
import { createHash } from 'crypto'
dotenv.config()
// Just a little something to generate a jwk using the pkey passed in from the environment
export async function getJWK() {
    const pkey = (await fs.readFile(process.env.PRIVATE_KEY_PATH as string))
    return await JoseKey.fromImportable(pkey.toString(), createHash("SHA256").update(pkey).digest('hex'))
}

export async function showJWKJSON(key: JoseKey) {
    console.log(JSON.stringify({ keys: [key.publicJwk] }))
}