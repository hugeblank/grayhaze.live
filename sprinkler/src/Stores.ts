import { Redis } from "iovalkey";
import { ATURI } from "./ATURI.js";
import { CID } from "multiformats";
import { Record as ChannelRecord } from "./lexicons/types/live/grayhaze/actor/channel.js";
import { Record as StreamRecord } from "./lexicons/types/live/grayhaze/content/stream.js";
import { Record as EmoteRecord } from "./lexicons/types/live/grayhaze/content/emote.js";
import { Record as BanRecord } from "./lexicons/types/live/grayhaze/interaction/ban.js";
import { Record as ChatRecord } from "./lexicons/types/live/grayhaze/interaction/chat.js";
import { Record as FollowRecord } from "./lexicons/types/live/grayhaze/interaction/follow.js";
import { Record as PromotionRecord } from "./lexicons/types/live/grayhaze/interaction/promotion.js";
import { Create, Delete, Update } from "@atproto/sync";
import { config } from "dotenv";
config()

const valkey = new Redis(process.env.PRIVATE_VALKEY_URL as string)

class Namespaced {
    protected static namespaces: Map<string, Namespaced> = new Map()
    protected namespace

    protected constructor(namespace: string) {
        if (Namespaced.namespaces.has(namespace)) throw new Error(`Namespace ${namespace} already exists`)
        this.namespace = namespace
        Namespaced.namespaces.set(namespace, this)
    }

    public static of<T extends Namespaced>(namespace: string): T {
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
        if (value) return value
    }
    async set(key: string, value: string): Promise<void> {
        const k = `${this.namespace}:${key}`
        await valkey.set(k, value)
    }
    async del(key: string): Promise<void> {
        await valkey.del(`${this.namespace}:${key}`)
    }
}

export interface RecordResponse<T> {
    uri: string | ATURI,
    cid: CID | string,
    value: T
}

export const keys = [
    "live.grayhaze.actor.channel",
    // "live.grayhaze.format.hls",
    "live.grayhaze.content.stream",
    "live.grayhaze.content.emote",
    "live.grayhaze.interaction.chat",
    "live.grayhaze.interaction.ban",
    "live.grayhaze.interaction.follow",
    "live.grayhaze.interaction.promotion",
] as const

export type keys = typeof keys[0] | typeof keys[1] | typeof keys[2] | typeof keys[3] | typeof keys[4] | typeof keys[5] | typeof keys[6];

class ATCacheMap<T> {
    private collection: keys

    async get(key: ATURI): Promise<T | undefined> {
        console.log("get", this.collection)
        if (key.collection !== this.collection) throw new Error(`URI key ${key.collection} does not match ${this.collection}`)
        const str = await valkey.hget(key.repo + "/" + key.collection, key.rkey)
        if (!str) return undefined
        return JSON.parse(str) as T
    }

    async set(key: ATURI, obj: T | undefined) {
        console.log("set", this.collection)
        if (key.collection !== this.collection) throw new Error(`URI key ${key.collection} does not match ${this.collection}`)
        if (obj === undefined) {
            await valkey.hdel(key.repo + "/" + key.collection, key.rkey)
        } else {
            await valkey.hset(key.repo + "/" + key.collection, key.rkey, JSON.stringify(obj))
        }
    }

    async setRecord(response: RecordResponse<T>) {
        let key: ATURI
        if (response.uri instanceof ATURI) {
            key = response.uri
        } else {
            key = new ATURI(response.uri)
        }

        if (key.collection !== this.collection) throw new Error(`URI key ${key.collection} does not match ${this.collection}`)

        await valkey.hset(key.repo + "/" + key.collection, key.rkey, JSON.stringify(response.value))
    }

    async len(did: string) {
        return await valkey.hlen(did + "/" + this.collection)
    }

    constructor(collection: keys) {
        this.collection = collection
    }

}

const collections = {
    [keys[0]]: new ATCacheMap<ChannelRecord>(keys[0]),
    // [keys[...]]: new ATCacheMap<HlsRecord>(keys[...]), // We really don't need to cache this... probably.
    [keys[1]]: new ATCacheMap<StreamRecord>(keys[1]),
    [keys[2]]: new ATCacheMap<EmoteRecord>(keys[2]),
    [keys[3]]: new ATCacheMap<ChatRecord>(keys[3]),
    [keys[4]]: new ATCacheMap<BanRecord>(keys[4]),
    [keys[5]]: new ATCacheMap<FollowRecord>(keys[5]),
    [keys[6]]: new ATCacheMap<PromotionRecord>(keys[6]),
} as const

export async function updateCache(evt: Create | Update | Delete) {
    switch (evt.collection) {
        case keys[0]: return await collections[keys[0]].set(new ATURI({ repo: evt.did, collection: evt.collection, rkey: evt.rkey }), ('record' in evt ? evt.record : undefined) as ChannelRecord | undefined)
        case keys[1]: return await collections[keys[1]].set(new ATURI({ repo: evt.did, collection: evt.collection, rkey: evt.rkey }), ('record' in evt ? evt.record : undefined) as StreamRecord | undefined)
        case keys[2]: return await collections[keys[2]].set(new ATURI({ repo: evt.did, collection: evt.collection, rkey: evt.rkey }), ('record' in evt ? evt.record : undefined) as EmoteRecord | undefined)
        case keys[3]: return await collections[keys[3]].set(new ATURI({ repo: evt.did, collection: evt.collection, rkey: evt.rkey }), ('record' in evt ? evt.record : undefined) as ChatRecord | undefined)
        case keys[4]: return await collections[keys[4]].set(new ATURI({ repo: evt.did, collection: evt.collection, rkey: evt.rkey }), ('record' in evt ? evt.record : undefined) as BanRecord | undefined)
        case keys[5]: return await collections[keys[5]].set(new ATURI({ repo: evt.did, collection: evt.collection, rkey: evt.rkey }), ('record' in evt ? evt.record : undefined) as FollowRecord | undefined)
        case keys[6]: return await collections[keys[6]].set(new ATURI({ repo: evt.did, collection: evt.collection, rkey: evt.rkey }), ('record' in evt ? evt.record : undefined) as PromotionRecord | undefined)
    }
}

export async function shutdown() {
    try {
        await valkey.quit()
        setTimeout(() => {
            valkey.disconnect()
        }, 2000).unref()
    } catch {
        // cry me a river
    }
}