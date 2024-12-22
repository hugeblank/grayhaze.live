export class TempCache<K, V> {
    private duration: number
    private map: Map<K, { value: V, timeout: NodeJS.Timeout }> = new Map()
    
    del(key: K) {
        if (!this.map.has(key)) return false
        const { timeout, value } = this.map.get(key)!
        clearTimeout(timeout)
        return this.map.delete(key)
    }

    get(key: K): V | undefined {
        if (!this.map.has(key)) return undefined
        const { timeout, value } = this.map.get(key)!
        timeout.refresh()
        return value
    }

    has(key: K) {
        return this.map.has(key)
    }

    set(key: K, value: V): TempCache<K, V> {
        if (this.map.has(key)) {
            const pair = this.map.get(key)!
            pair.timeout.refresh()
            pair.value = value
        } else {
            const timeout = setTimeout(() => {
                this.map.delete(key)
            }, this.duration)
            timeout.unref()
            this.map.set(key, { value, timeout })
        }
        return this
    }

    constructor(duration: number) {
        this.duration = duration*1000
    }
}

export class PerItemTempCache<K, V> {
    private map: Map<K, { value: V, timeout: NodeJS.Timeout }> = new Map()
    
    del(key: K) {
        if (!this.map.has(key)) return false
        const { timeout } = this.map.get(key)!
        clearTimeout(timeout)
        return this.map.delete(key)
    }

    get(key: K): V | undefined {
        if (!this.map.has(key)) return undefined
        const { value } = this.map.get(key)!
        return value
    }

    has(key: K) {
        return this.map.has(key)
    }

    set(key: K, value: V, expires: number): PerItemTempCache<K, V> {
        if (this.map.has(key)) {
            const pair = this.map.get(key)!
            pair.timeout.refresh()
            pair.value = value
        } else {
            const timeout = setTimeout(() => {
                this.map.delete(key)
            }, expires * 1000)
            timeout.unref()
            this.map.set(key, { value, timeout })
        }
        return this
    }

}