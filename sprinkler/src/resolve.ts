import { SprinklerError } from "./types"

const resolvers: Map<string, (structure: string) => string> = new Map([
    ["plc", (structure) => {
        return `https://plc.directory/did:plc:${structure}`
    }],
    ["web", (structure) => {
        return `https://${structure}/.well-known/did.json`
    }],
    // Room for future DID methods
])

interface DIDDoc {
    ["@context"]: string[],
    id: string,
    alsoKnownAs: string[],
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

export async function resolveDID(did: string) {
    if (cachedDocs.has(did)) return cachedDocs.get(did)! // If cached immediately return

    const [type, method, structure] = did.split(":") // Break up DID into components
    if (type !== "did") throw new SprinklerError("Invalid DID", 500); // Drop anything that isn't a DID
    if (!resolvers.has(method)) throw new SprinklerError(`Method ${method} is not blessed`, 500); // Drop methods that aren't blessed
    const url = resolvers.get(method)!(structure) // Get resolver and throw DID structure at it
    const response = await fetch(url) // Fetch from the URL given
    if (!response.ok) throw new SprinklerError(response.statusText, response.status) // Throw an error if the fetch fails
    // Parse the document, cache and return
    const doc = JSON.parse(await response.text()) as DIDDoc
    cachedDocs.set(did, doc)
    setTimeout(() => cachedDocs.delete(did), cacheTimeout)
    return doc
}