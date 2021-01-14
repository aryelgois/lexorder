import type { LexOrderOptions, SymbolConverter } from './types'

export default class LexOrder {
    private converter: SymbolConverter
    private spreadLevel: number

    private zeroSymbol: string

    private validatePattern: RegExp
    private zeroRightPattern: RegExp

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

        const zeroSymbol = symbols[0]

        if (zeroSymbol === undefined) {
            throw new Error('Got undefined when reading symbols[0].')
        }

        this.zeroSymbol = zeroSymbol

        this.validatePattern = RegExp(`^(${symbols.join('|')})*(${symbols.slice(1).join('|')})$`)
        this.zeroRightPattern = RegExp(`(${zeroSymbol})+$`)
    }

    decode (word: string) {
        if (!this.validatePattern.test(word)) {
            throw new Error(`Argument "${word}" is invalid.`)
        }

        return this.converter.toBigInt(word)
    }

    encode (value: bigint, length: number) {
        return this.converter.fromBigInt(value)
            .padStart(length, this.zeroSymbol)
            .replace(this.zeroRightPattern, '')
    }
}
