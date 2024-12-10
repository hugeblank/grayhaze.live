import { NodeOAuthClient } from "@atproto/oauth-client-node";
import { SimpleStore, Value } from "@atproto-labs/simple-store"
import { getJWK } from "./jwks";
import fs from "fs/promises";
import { PathLike } from "fs";
import express from "express";
import { Agent } from "@atproto/api";

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

async function loadClient() {
    await fs.mkdir(".oauth", { recursive: true })
    await Promise.all([
        writeIfNotExists(".oauth/state.json", "{}"),
        writeIfNotExists(".oauth/session.json", "{}")
    ])

    return new NodeOAuthClient({
        // This object will be used to build the payload of the /client-metadata.json
        // endpoint metadata, exposing the client metadata to the OAuth server.
        clientMetadata: {
            // Must be a URL that will be exposing this metadata
            client_id: 'https://grayhaze.live/oauth/public/client-metadata.json',
            client_name: 'Blobify - A GrayHaze Utility',
            client_uri: 'https://grayhaze.live',
            logo_uri: 'https://grayhaze.live/logo.png',
            tos_uri: 'https://grayhaze.live/tos',
            policy_uri: 'https://grayhaze.live/policy',
            redirect_uris: ['https://grayhaze.live/oauth/public/callback'],
            application_type: "web",
            grant_types: ['authorization_code', 'refresh_token'],
            scope: "atproto transition:generic",
            response_types: ['code'],
            token_endpoint_auth_method: 'private_key_jwt',
            token_endpoint_auth_signing_alg: 'ES256',
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

async function authenticate(client: NodeOAuthClient): Promise<Agent | undefined > {
    const app = express()
    let agent: Agent | undefined = undefined

    const server = app.listen(6090, () => {
        // Create an endpoint to initiate the OAuth flow
        app.get('/', async (req, res, next) => {
            try {
        
                // Revoke any pending authentication requests if the connection is closed (optional)
                const ac = new AbortController()
                req.on('close', () => ac.abort())
    
                if (!process.env.DID) {
                    throw new Error("Set DID in .env before attempting to log in")
                }
        
                const url = await client.authorize(process.env.DID as string, {
                    signal: ac.signal,
                })
        
                res.redirect(url.toString())
            } catch (err) {
                next(err)
            }
        })
        
        // Create an endpoint to handle the OAuth callback
        app.get('/callback', async (req, res, next) => {
            try {
                const params = new URLSearchParams(req.url.split('?')[1])
        
                const { session } = await client.callback(params)
        
                console.log('Authenticated as:', session.did)
        
                agent = new Agent(session)
        
                // Make Authenticated API calls
                const profile = await agent.getProfile({ actor: agent.did! })
                console.log('Bsky profile:', profile.data)
        
                res.json({ ok: true })
                server.close()
            } catch (err) {
                next(err)
            }
        })

        console.log("Log into your PDS via: http://localhost:6090")
    })
    return agent
}

async function restore(client: NodeOAuthClient) {
    if (!process.env.DID) {
        throw new Error("Set DID in .env before attempting to log in")
    }
    const oauthSession = await client.restore(process.env.DID as string)
  
    // Note: If the current access_token is expired, the session will automatically
    // (and transparently) refresh it. The new token set will be saved though
    // the client's session store.
  
    const agent = new Agent(oauthSession)
  
    // Make Authenticated API calls
    const profile = await agent.getProfile({ actor: agent.did! })

    return agent
}


export async function getAgent(): Promise<Agent> {
    const client = await loadClient()
    let agent: Agent | undefined;
    try {
        agent = await restore(client)
    } catch {
        agent = await authenticate(client)
    }
    if (!agent) {
        throw new Error("could not load agent")
    } else {
        return agent
    }
}