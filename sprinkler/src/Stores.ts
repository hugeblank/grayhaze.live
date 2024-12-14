import { Redis } from "iovalkey";
const valkey = new Redis()

class Namespaced {
    protected static namespaces: Map<string, Namespaced> = new Map()
    protected namespace

    protected constructor(namespace: string) {
        if (Namespaced.namespaces.has(namespace)) throw new Error(`Namespace ${namespace} already exists`)
        this.namespace = namespace
        Namespaced.namespaces.set(namespace, this)
    }

    public of<T extends Namespaced>(namespace: string): T {
        return (Namespaced.namespaces.has(namespace) ?
            Namespaced.namespaces.get(namespace) :
            new Namespaced(namespace)) as T
    }
}

const duration = 2592000 // 30 days
export class EphemeralStore extends Namespaced {

    async get(key: string): Promise<string | undefined> {
        const k = `${this.namespace}:${key}`
        const value = await valkey.get(k)
        // Reset cache countdown
        await valkey.expire(k, duration)
        if (value) return value
    }
    async set(key: string, value: string): Promise<void> {
        const k = `${this.namespace}:${key}`
        await valkey.set(k, value)
        await valkey.expire(k, duration)
    }
    async del(key: string): Promise<void> {
        await valkey.del(`${this.namespace}:${key}`)
    }


}

export class StaticStore extends Namespaced {

    async get(key: string): Promise<string | undefined> {
        const k = `${this.namespace}:${key}`
        const value = await valkey.get(k)
        // Reset cache countdown
        await valkey.expire(k, duration)
        if (value) return value
    }
    async set(key: string, value: string): Promise<void> {
        const k = `${this.namespace}:${key}`
        await valkey.set(k, value)
        await valkey.expire(k, duration)
    }
    async del(key: string): Promise<void> {
        await valkey.del(`${this.namespace}:${key}`)
    }
}