import { JoseKey } from '@atproto/jwk-jose'
import fs from 'fs/promises'
import { createHash } from 'crypto'
import dotenv from 'dotenv'
dotenv.config()
// Just a little something to generate a jwk
export async function getJWK() {
    const pkey = (await fs.readFile("rs256.pem"))
    return await JoseKey.fromImportable(pkey.toString(), createHash("SHA256").update(pkey).digest('hex'))
}

export async function showJWKJSON(key: JoseKey) {
    console.log(JSON.stringify({ keys: [key.publicJwk] }))
}

async function main() {
    await showJWKJSON(await getJWK())
}

main()