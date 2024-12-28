import type { BlobRef } from "@atproto/lexicon"

export type Image = ArrayBuffer | string | BlobRef
type State = "local" | "default" | "none"

export class BiStateHandler<T> {
    private _value?: T = $state()
    private _default?: T = $state()
    private _initial: State
    private _skipDefault: true | undefined
    private _state: State = $state("none")

    get changed() {
        if (this._value === this._default) return false
        return this._state !== this._initial
    }

    public clear() {
        switch (this._state) {
            case "local": {
                this._state = this._skipDefault ? "none" : this._default ? "default" : "none"
                break
            }
            case "default": {
                this._state = "none"
                break
            }
            case "none": {
                this._skipDefault = true
                break
            }
        }
    }

    get value(): T | undefined {
        switch (this._state) {
            case "local": return this._value
            case "default": return this._default
            case "none": return undefined
        }
    }

    set value(value: T | undefined) {
        if (!value && this._state === "default") {
            this.clear()
        } else {
            this._value = value
            this._state = value ? "local" : "default"
        }
    }

    constructor(def?:T) {
        this._default = def
        this._state = this._default ? "default" : "none"
        this._initial = this._state
    }
}