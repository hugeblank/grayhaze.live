import type { GetOptions } from "@atproto-labs/simple-store";
import type { NodeSavedSession, NodeSavedSessionStore } from "@atproto/oauth-client-node";
import Redis from "iovalkey";
import { NamespacedStore } from "./NamespacedStore";

const valkey = new Redis()

export class SessionStore implements NodeSavedSessionStore {
    private store = NamespacedStore.of("session")

    public async get(key: string, options?: GetOptions): Promise<NodeSavedSession | undefined> {
        const value = await this.store.get(key)
        if (!value) return undefined
        return JSON.parse(value) as NodeSavedSession
    }
    public async set(key: string, value: NodeSavedSession): Promise<void> {
        await this.store.set(key, JSON.stringify(value))
    }
    public async del(key: string): Promise<void> {
        await this.store.del(key)
    }
}