export class Pipe<T> {
    private buffer: T[] = []
    private resolvers: ((value: T | PromiseLike<T>) => void)[] = []

    public push(item: T) {
        if (this.resolvers.length === 0) {
            this.buffer.push(item)
        } else {
            this.resolvers.shift()!(item)
        }
    }

    public async shift(): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            if (this.buffer.length === 0) {
                this.resolvers.push(resolve)
            } else {
                resolve(this.buffer.shift()!)
            }
        })
    }
}