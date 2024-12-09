import { Keyset, NodeOAuthClient, NodeSavedSession, NodeSavedState, Session } from "@atproto/oauth-client-node";
import { SimpleStore, Value } from "@atproto-labs/simple-store"
import { getJWK } from "./jwks";
import fs from "fs/promises";
import { PathLike } from "fs";

async function writeIfNotExists(path: PathLike, data: string) {
    await fs.stat(path).catch(async () => {
        await fs.writeFile(path, data)
    })
}

class JSONStore<T extends Value> implements SimpleStore<string, T> {
    private path: string
    async set(key: string, data: T) {
        const file = JSON.parse((await fs.readFile(this.path)).toString())
        file[key] = data
        await fs.writeFile(this.path, JSON.stringify(file))
    }
    async get(key: string): Promise<T | undefined> {
        const file = JSON.parse((await fs.readFile(this.path)).toString())
        return file[key] as T | undefined
    }
    async del(key: string) {
        const file = JSON.parse((await fs.readFile(this.path)).toString())
        file[key] = undefined
        await fs.writeFile(this.path, JSON.stringify(file))
    }

    constructor(path: string) {
        this.path = path
    }
}

async function main() {
    await fs.mkdir(".oauth", { recursive: true })    
    await Promise.all([
        writeIfNotExists(".oauth/state.json", "{}"),
        writeIfNotExists(".oauth/session.json", "{}")
    ])

    const client = new NodeOAuthClient({
        // This object will be used to build the payload of the /client-metadata.json
        // endpoint metadata, exposing the client metadata to the OAuth server.
        clientMetadata: {
            // Must be a URL that will be exposing this metadata
            client_id: 'https://grayhaze.live/oauth/public/client-metadata.json',
            client_name: 'GrayHaze',
            client_uri: 'https://grayhaze.live',
            logo_uri: 'https://grayhaze.live/logo.png',
            tos_uri: 'https://grayhaze.live/tos',
            policy_uri: 'https://grayhaze.live/policy',
            redirect_uris: ['http://127.0.0.1:3000/callback'],
            grant_types: ['authorization_code', 'refresh_token'],
            scope: "atproto",
            response_types: ['code'],
            application_type: 'web',
            token_endpoint_auth_method: 'private_key_jwt',
            token_endpoint_auth_signing_alg: 'PS512',
            dpop_bound_access_tokens: true,
            jwks_uri: 'https://grayhaze.live/oauth/public/jwks.json',
        },
    
        // Used to authenticate the client to the token endpoint. Will be used to
        // build the jwks object to be exposed on the "jwks_uri" endpoint.
        keyset: [
            await getJWK(),
        ],
    
        // Interface to store authorization state data (during authorization flows)
        stateStore: new JSONStore(".oauth/state.json"),
    
        // Interface to store authenticated session data
        sessionStore: new JSONStore(".oauth/session.json"),
    })
    
}

main()