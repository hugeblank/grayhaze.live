type Message<T> = { done: false, value: T } | { done: true };

export class Pipe<T> {
    private buffer: T[] = []
    private resolvers: ((value: Message<T>) => void)[] = []

    public push(value: T) {
        if (this.resolvers.length === 0) {
            this.buffer.push(value)
        } else {
            this.resolvers.shift()!({ done: false, value })
        }
    }

    public [Symbol.asyncIterator]() {
        return {
            next: () => {
                if (this.buffer.length === 0) {
                    return new Promise<Message<T>>((resolve) => {
                        this.resolvers.push(resolve)
                    })
                } else {
                    return { done: false, value: this.buffer.shift()! }
                }
            }
        }
    }
}