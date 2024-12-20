import { Agent, lexicons } from "@atproto/api";

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

export class User {
    private _diddoc: DIDDoc

    static async resolveDID(did: string, fetchFunc: typeof globalThis.fetch = fetch) {
        if (cachedDocs.has(did)) return cachedDocs.get(did)! // If cached immediately return
        const [type, method, structure] = did.split(":") // Break up DID into components
        if (type !== "did") throw new Error("Invalid DID"); // Drop anything that isn't a DID
        if (!resolvers.has(method)) throw new Error(`Method ${method} is not blessed`); // Drop methods that aren't blessed
        const url = resolvers.get(method)!(structure) // Get resolver and throw DID structure at it
        const response = await fetchFunc(url) // Fetch from the URL given
        if (!response.ok) throw new Error(response.statusText) // Throw an error if the fetch fails
        // Parse the document, cache and return
        const doc = JSON.parse(await response.text()) as DIDDoc
        cachedDocs.set(did, doc)
        setTimeout(() => cachedDocs.delete(did), cacheTimeout).unref()
        return doc
    }

    static resolvePDS(doc: DIDDoc) {
        for (let service of doc.service) {
            if (service.id === "#atproto_pds") {
                return service.serviceEndpoint
            }
        }
        throw new Error(`did ${doc.id} has no ATProto PDS`)
    }

    public get aka(): string | string[] {
        return this._diddoc.alsoKnownAs
    }

    
    public get handle() : string {
        if (typeof this._diddoc.alsoKnownAs === "string") {
            return this._diddoc.alsoKnownAs.replace("at://", "")
        } else {
            const aka = this._diddoc.alsoKnownAs.at(0)
            return aka ? aka.replace("at://", "") : this._diddoc.id
        }
    }

    
    public get did() : string {
        return this._diddoc.id
    }

    
    public get diddoc() : DIDDoc {
        return this._diddoc
    }

    
    public get pds(): string | undefined {
        for (let service of this._diddoc.service) {
            if (service.id === "#atproto_pds") {
                return service.serviceEndpoint
            }
        }
    }

    private constructor(diddoc: DIDDoc) {
        this._diddoc = diddoc
    }

    static async fromHandle(handle: string, fetchFunc: typeof globalThis.fetch = fetch) {
        const apiResponse = await fetchFunc(`https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=${handle}`)
        if (!apiResponse.ok) throw new Error(`Could not resolve handle ${handle}`)
        return User.fromDID((await apiResponse.json())["did"], fetchFunc)
    }

    static async fromDID(did: string, fetchFunc: typeof globalThis.fetch = fetch) {
        const diddoc = await User.resolveDID(did, fetchFunc)
        return User.fromDIDDoc(diddoc)
    }

    static fromDIDDoc(diddoc: DIDDoc) {
        return new User(diddoc)
    }
}