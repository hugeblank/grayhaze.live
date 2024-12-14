import { parse } from '@atcute/tid'

export class ATURI {
    private _repo: string
    private _collection: string
    private _rkey: string
    private _timestamp: Date

    public get repo() : string {
        return this._repo
    }

    public get collection() : string {
        return this._collection
    }

    public get rkey() : string {
        return this._rkey
    }

    
    public get timestamp() : Date {
        return this._timestamp
    }

    public toString() {
        return `at://${this._repo}/${this._collection}/${this._rkey}`
    }

    constructor(uri: string) {
        const data = uri.replace("at://", "").split("/")
        if (data.length < 3) throw new Error("Malformed AT URI")
        this._rkey = data.pop()!
        this._collection = data.pop()!
        this._repo = data.pop()!
        this._timestamp = new Date(parse(this._rkey).timestamp/1000)
    }
}