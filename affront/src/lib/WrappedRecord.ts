import { lexicons } from "@atproto/api";
import { ATURI } from "./ATURI";

export interface RecordLike<T>{
    uri: string,
    cid?: string,
    value: T

    
}

function recordLike<T>(obj: any): obj is RecordLike<T> {
    return 'uri' in obj && 'value' in obj;
}

export class WrappedRecord<T> {
    private _uri: ATURI
    private _cid?: string
    private _value: T

    
    public get uri() : ATURI {
        return this._uri
    }

    public get cid() : string | undefined {
        return this._cid
    }
    
    
    public get value() : T {
        return this._value
    }

    public get valid(): boolean {
        return lexicons.validate(this._uri.collection, this._value).success
    }

    public constructor(record: RecordLike<T>) {
        this._uri = new ATURI(record.uri)
        this._cid = record.cid
        this._value = record.value
    }
    
    public static wrap<T>(record: RecordLike<T>): WrappedRecord<T>
    public static wrap<T>(records: RecordLike<T>[]): WrappedRecord<T>[]
    public static wrap<T>(recordz: RecordLike<T> | RecordLike<T>[]): WrappedRecord<T> | WrappedRecord<T>[] {
        if ("length" in recordz) {
            return recordz.map((recordLike) => new WrappedRecord(recordLike))
        } else {
            return new WrappedRecord<T>(recordz)
        }
    }
}