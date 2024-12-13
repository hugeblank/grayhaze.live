import { ATURI } from "$lib/ATURI";
import { WrappedRecord } from "$lib/WrappedRecord";
import { BlobRef, type JsonBlobRef } from "@atproto/lexicon";

export const transport = {
    ATURI: { 
        encode: (value: ATURI) => value instanceof ATURI && value.toString(),
        decode: (value: string) => new ATURI(value)
    },
    WrappedRecord: {
        encode: (record: WrappedRecord<any>) => record instanceof WrappedRecord && [record.cid, record.uri, record.value],
        decode: ([cid, uri, value]: [string, string, object]) => WrappedRecord.wrap({cid, uri, value})
    },
    BlobRef: {
        encode: (blobref: BlobRef) => blobref instanceof BlobRef && blobref.toJSON() ,
        decode: (jsonref: any) => BlobRef.fromJsonRef(jsonref)
    }
}