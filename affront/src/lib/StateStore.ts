import type { Awaitable, GetOptions } from "@atproto-labs/simple-store";
import { type NodeSavedState, type NodeSavedStateStore } from "@atproto/oauth-client-node";

export class StateStore implements NodeSavedStateStore {
    private timeout: number
    private state: Map<string, NodeSavedState> = new Map()
    get(key: string, options?: GetOptions): Awaitable<NodeSavedState | undefined> {
        return this.state.get(key)
    }
    set(key: string, value: NodeSavedState): Awaitable < void> {
        this.state.set(key, value)
        setTimeout(() => {
            this.state.delete(key)
        }, this.timeout)
    }
    del(key: string): Awaitable<void> {
        this.state.delete(key)
    }

    constructor(timeout: number) {
        this.timeout = timeout
    }
}