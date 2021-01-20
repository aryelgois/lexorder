import type { LexOrderOptions, SymbolConverter } from './types'

export default class LexOrder {
    private converter: SymbolConverter
    private spreadLevel: number

    private zeroSymbol: string
    private firstSymbol: string
    private medianSymbol: string
    private lastSymbol: string

    private validatePattern: RegExp
    private overflowPattern: RegExp
    private underflowPattern: RegExp
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

        const firstSymbol = symbols[1]

        if (firstSymbol === undefined) {
            throw new Error('Got undefined when reading symbols[1].')
        }

        const medianSymbol = symbols[Math.round(symbols.length / 2)]

        if (medianSymbol === undefined) {
            throw new Error('Got undefined when calculating median symbol.')
        }

        const lastSymbol = symbols[symbols.length - 1]

        if (lastSymbol === undefined) {
            throw new Error('Got undefined when reading last symbol.')
        }

        this.zeroSymbol = zeroSymbol
        this.firstSymbol = firstSymbol
        this.medianSymbol = medianSymbol
        this.lastSymbol = lastSymbol

        this.validatePattern = RegExp(`^(${symbols.join('|')})+$`)
        this.overflowPattern = RegExp(`^(${lastSymbol})+$`)
        this.underflowPattern = RegExp(`^(${zeroSymbol})*${firstSymbol}$`)
        this.zeroRightPattern = RegExp(`(${zeroSymbol})+$`)
    }

    validate (word: string) {
        const result = word.replace(this.zeroRightPattern, '')

        if (!this.validatePattern.test(result)) {
            throw new Error(`Argument "${word}" is invalid.`)
        }

        return result
    }

    encode (value: bigint, length: number) {
        return this.converter.fromBigInt(value)
            .padStart(length, this.zeroSymbol)
            .replace(this.zeroRightPattern, '')
    }

    get (wordA: string | null, wordB: string | null) {
        if (wordA !== null && wordB !== null) {
            return this.intermediate(wordA, wordB)
        } else if (wordA !== null) {
            return this.next(wordA)
        } else if (wordB !== null) {
            return this.previous(wordB)
        } else {
            return this.medianSymbol
        }
    }

    intermediate (wordA: string, wordB: string) {
        const wA = this.validate(wordA)
        const wB = this.validate(wordB)

        if (wA === wB) {
            throw new Error('Both arguments are equal.')
        }

        const maxLength = Math.max(wA.length, wB.length)

        const numA = this.converter.toBigInt(wA.padEnd(maxLength, this.zeroSymbol))

        const numB = this.converter.toBigInt(wB.padEnd(maxLength, this.zeroSymbol))

        const sum = numA + numB

        return this.encode(sum / BigInt(2), maxLength) +
            (sum % BigInt(2) === BigInt(1) ? this.medianSymbol : '')
    }

    next (word: string) {
        const w = this.validate(word)

        if (
            this.converter.countSymbols(w) < this.spreadLevel ||
            this.overflowPattern.test(w)
        ) {
            return w + this.firstSymbol
        }

        return this.encode(this.converter.toBigInt(w) + BigInt(1), w.length)
    }

    previous (word: string) {
        const w = this.validate(word)

        if (this.underflowPattern.test(w)) {
            return ''.padStart(w.length, this.zeroSymbol) + this.lastSymbol
        }

        return this.encode(this.converter.toBigInt(w) - BigInt(1), w.length) +
            (this.converter.countSymbols(w) < this.spreadLevel ? this.lastSymbol : '')
    }
}
