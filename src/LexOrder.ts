import type { LexOrderOptions, SymbolConverter } from './types'

export default class LexOrder {
    private converter: SymbolConverter
    private spreadLevel: number

    constructor (options: LexOrderOptions) {
        this.converter = options.converter
        this.spreadLevel = options.spreadLevel

        if (this.spreadLevel < 1) {
            throw new Error('The spreadLevel must be at least 1.')
        }

        const symbols = this.converter.symbols

        if (symbols.length < 2) {
            throw new Error('There must be at least 2 symbols.')
        }
    }
}
