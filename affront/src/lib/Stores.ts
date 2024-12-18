import { PRIVATE_VALKEY_URL } from "$env/static/private";
import type { Awaitable, GetOptions } from "@atproto-labs/simple-store";
import type { NodeSavedSessionStore, NodeSavedSession, NodeSavedState, NodeSavedStateStore } from "@atproto/oauth-client-node";
import Redis from "iovalkey";

const valkey = new Redis(PRIVATE_VALKEY_URL)

const DURATION = 2592000 // 30 days
export class EphemeralStore {
    private static namespaces: Map<string, EphemeralStore> = new Map()
    private namespace: string
    private duration: number

    async get(key: string): Promise<string | undefined> {
        const k = `${this.namespace}:${key}`
        const value = await valkey.get(k)
        // Reset cache countdown
        await valkey.expire(k, this.duration)
        if (value) return value
    }
    async set(key: string, value: string): Promise<void> {
        const k = `${this.namespace}:${key}`
        await valkey.set(k, value)
        await valkey.expire(k, this.duration)
    }
    async del(key: string): Promise<void> {
        await valkey.del(`${this.namespace}:${key}`)
    }

    private constructor(namespace: string, duration?: number) {
        if (EphemeralStore.namespaces.has(namespace)) throw new Error(`Namespace ${namespace} already exists`)
        this.namespace = namespace
        this.duration = duration ?? DURATION
        EphemeralStore.namespaces.set(namespace, this)
    }

    static of(namespace: string, duration?: number): EphemeralStore {
        return EphemeralStore.namespaces.has(namespace) ?
            EphemeralStore.namespaces.get(namespace)! :
            new EphemeralStore(namespace, duration)
    }

}

export class SessionStore implements NodeSavedSessionStore {
    private store = EphemeralStore.of("session");

    public async get(key: string, options?: GetOptions): Promise<NodeSavedSession | undefined> {
        const value = await this.store.get(key);
        if (!value) return undefined;
        return JSON.parse(value) as NodeSavedSession;
    }
    public async set(key: string, value: NodeSavedSession): Promise<void> {
        await this.store.set(key, JSON.stringify(value));
    }
    public async del(key: string): Promise<void> {
        await this.store.del(key);
    }
}
export class StateStore implements NodeSavedStateStore {
    private timeout: number;
    private state: Map<string, NodeSavedState> = new Map();
    get(key: string, options?: GetOptions): Awaitable<NodeSavedState | undefined> {
        return this.state.get(key);
    }
    set(key: string, value: NodeSavedState): Awaitable<void> {
        this.state.set(key, value);
        setTimeout(() => {
            this.state.delete(key);
        }, this.timeout);
    }
    del(key: string): Awaitable<void> {
        this.state.delete(key);
    }

    constructor(timeout: number) {
        this.timeout = timeout;
    }
}

