import Redis from "iovalkey";

const valkey = new Redis()

export class NamespacedStore {
    private static namespaces: Map<string, NamespacedStore> = new Map()
    private namespace

    async get(key: string): Promise<string | undefined> {
        const value = await valkey.get(`${this.namespace}:${key}`)
        if (!value) return undefined
        return value
    }
    async set(key: string, value: string): Promise<void> {
        await valkey.set(`${this.namespace}:${key}`, value)
    }
    async del(key: string): Promise<void> {
        await valkey.del(`${this.namespace}:${key}`)
    }

    private constructor(namespace: string) {
        if (NamespacedStore.namespaces.has(namespace)) throw new Error(`Namespace ${namespace} already exists`)
        this.namespace = namespace
        NamespacedStore.namespaces.set(namespace, this)
    }

    static of(namespace: string): NamespacedStore {
        return NamespacedStore.namespaces.has(namespace) ?
            NamespacedStore.namespaces.get(namespace)! :
            new NamespacedStore(namespace)
    }

}