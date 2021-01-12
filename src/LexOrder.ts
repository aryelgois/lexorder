import type { LexOrderOptions } from './types'

export default class LexOrder {
    private spreadLevel: number

    constructor (options: LexOrderOptions) {
        this.spreadLevel = options.spreadLevel

        if (this.spreadLevel < 1) {
            throw new Error('The spreadLevel must be at least 1.')
        }
    }
}
