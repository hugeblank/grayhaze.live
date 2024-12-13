import { ATURI } from "$lib/ATURI";
import { WrappedRecord } from "$lib/WrappedRecord";
import { BlobRef, type JsonBlobRef } from "@atproto/lexicon";
import { CID } from 'multiformats'

export const transport = {
    ATURI: { 
        encode: (value: ATURI) => value instanceof ATURI && value.toString(),
        decode: (value: string) => new ATURI(value)
    },
    WrappedRecord: {
        encode: (record: WrappedRecord<any>) => record instanceof WrappedRecord && [record.cid, record.uri.toString(), record.value],
        decode: ([cid, uri, value]: [string, string, object]) => WrappedRecord.wrap({cid, uri, value})
    },
    BlobRef: {
        encode: (blobref: BlobRef) => {
            if (blobref instanceof BlobRef) {
                const out = blobref.ipld()
                const nref = out.ref.toString()
                const nout = { ...out, ref: nref }
                return [nout]
            }
            return false
        },
        decode: ([jsonref]: [any]) => {
            jsonref['ref'] = CID.parse(jsonref['ref'])
            return BlobRef.fromJsonRef(jsonref)
        } 
    }
}