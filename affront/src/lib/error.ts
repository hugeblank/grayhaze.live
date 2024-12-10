import { error } from "@sveltejs/kit";

export class SprinklerError {
    private code: number;
    private message: string | undefined;

    public emitResponse() {
        error(this.code, this.message)
    }

    public getCode() {
        return this.code
    }

    constructor(message?: string, code: number = 404) {
        this.message = message
        this.code = code
    }
}

export function onCatch(e: any) {
    if (e instanceof SprinklerError) {
        e.emitResponse()
    } else {
        let msg = "Unknown Error Occured"
        if (e instanceof Error) msg = e.message
        error(500, msg)
    }
}