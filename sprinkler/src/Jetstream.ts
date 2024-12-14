export type JetMessage = Commit<Put> | Commit<Delete> | Account | Identity

export interface Commit<T> {
    did: string,
    time_us: number,
    kind: "commit",
    commit: T
}

export interface Put {
    ref: string,
    operation: "create" | "update",
    collection: string,
    rkey: string,
    record: any,
    cid: string
}
export interface Delete {
    ref: string,
    operation: "delete",
    collection: string,
    rkey: string,
    cid: string
}

export interface Account {
    did: string,
    time_us: number,
    kind: "account",
    account: {
        active: boolean,
        did: string,
        seq: number,
        time: string
    }
}

export interface Identity {
    did: string,
    time_us: number,
    kind: "identity",
    identity: {
        did: string,
        handle: string,
        seq: number,
        time: string
    }
}

