import { Agent, lexicons } from "@atproto/api";
import { error } from "@sveltejs/kit"

const resolvers: Map<string, (structure: string) => string> = new Map([
    ["plc", (structure) => {
        return `https://plc.directory/did:plc:${structure}`
    }],
    ["web", (structure) => {
        return `https://${structure}/.well-known/did.json`
    }],
    // Room for future DID methods
])

export interface DIDDoc {
    ["@context"]: string[],
    id: string,
    alsoKnownAs: string[] | string,
    verificationMethod: VerificationMethod[],
    service: Service[]
}

interface VerificationMethod {
    id: string,
    type: string,
    controller: string,
    publicKeyMultibase: string
}

interface Service {
    id: string,
    type: string,
    serviceEndpoint: string
}

const cachedDocs: Map<string, DIDDoc> = new Map()
const cacheTimeout = 1000 * 60 * 15;

export class ATPUser {
    private diddoc: DIDDoc
    private agent: Agent

    static async resolveDID(did: string, fetchFunc: typeof globalThis.fetch = fetch) {
        if (cachedDocs.has(did)) return cachedDocs.get(did)! // If cached immediately return
        const [type, method, structure] = did.split(":") // Break up DID into components
        if (type !== "did") error(500, "Invalid DID"); // Drop anything that isn't a DID
        if (!resolvers.has(method)) error(500, `Method ${method} is not blessed`); // Drop methods that aren't blessed
        const url = resolvers.get(method)!(structure) // Get resolver and throw DID structure at it
        const response = await fetchFunc(url) // Fetch from the URL given
        if (!response.ok) error(response.status, response.statusText) // Throw an error if the fetch fails
        // Parse the document, cache and return
        const doc = JSON.parse(await response.text()) as DIDDoc
        cachedDocs.set(did, doc)
        setTimeout(() => cachedDocs.delete(did), cacheTimeout)
        return doc
    }

    static async resolvePDS(doc: DIDDoc) {
        for (let service of doc.service) {
            if (service.id === "#atproto_pds") {
                return service.serviceEndpoint
            }
        }
        error(500, `did ${doc.id} has no ATProto PDS`)
    }

    public getAKA() {
        return this.diddoc.alsoKnownAs
    }

    public getHandle() {
        if (typeof this.diddoc.alsoKnownAs === "string") {
            return this.diddoc.alsoKnownAs.replace("at://", "")
        } else {
            const aka = this.diddoc.alsoKnownAs.at(0)
            return aka ? aka.replace("at://", "") : this.diddoc.id
        }
    }

    public getDID() {
        return this.diddoc.id
    }

    public getPDS() {
        for (let service of this.diddoc.service) {
            if (service.id === "#atproto_pds") {
                return service.serviceEndpoint
            }
        }
    }

    public async getRecord(collection: string, rkey: string) {
        const response = await this.agent.com.atproto.repo.getRecord({
            repo: this.diddoc.id,
            collection: collection,
            rkey: rkey
        })
        if (!response.success) error(404, `Record ${rkey} not found`)
        return response.data
    }

    public async getBlob(cid: string) {
        const response = await this.agent.com.atproto.sync.getBlob({ did: this.diddoc.id, cid })
        if (!response.success) error(404, `Blob ${cid} not found`)
        return response.data
    }

    public async listRecords(collection: string, cursor?: string) {
        const response = await this.agent.com.atproto.repo.listRecords({
            repo: this.diddoc.id,
            collection: collection,
            limit: 20,
            cursor,
        })
        if (!response.success) error(404, `Collection ${collection} on user ${this.diddoc.id} not found`)
        response.data.records = response.data.records.filter((record) => {
            const { success } = lexicons.validate(collection, record.value)
            return success
        })
        return response.data
    }

    private constructor(agent: Agent, diddoc: DIDDoc) {
        this.agent = agent
        this.diddoc = diddoc
    }

    static async fromHandle(handle: string, fetchFunc: typeof globalThis.fetch = fetch) {
        const apiResponse = await fetchFunc(`https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=${handle}`)
        if (!apiResponse.ok) error(404, `Could not resolve handle ${handle}`)
        return ATPUser.fromDID((await apiResponse.json())["did"], fetchFunc)
    }

    static async fromDID(did: string, fetchFunc: typeof globalThis.fetch = fetch) {
        const diddoc = await ATPUser.resolveDID(did, fetchFunc)
        return ATPUser.fromDIDDoc(diddoc)
    }

    static async fromDIDDoc(diddoc: DIDDoc) {
        const pds = await ATPUser.resolvePDS(diddoc)
        const agent = new Agent(new URL(pds))
        return new ATPUser(agent, diddoc)
    }
}