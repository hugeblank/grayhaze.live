import { Response } from "express";

export class SprinklerError {
    private code: number;
    private message: string | undefined;

    public emitResponse(res: Response) {
        return res.status(this.code).json({ error: this.message })
    }

    public getCode() {
        return this.code
    }

    constructor(message?: string, code: number = 404) {
        this.message = message
        this.code = code
    }
}