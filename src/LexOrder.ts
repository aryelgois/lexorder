import type { LexOrderOptions, SymbolConverter } from './types'

export default class LexOrder {
    private converter: SymbolConverter
    private spreadLength: number

    private zeroSymbol: string
    private firstSymbol: string
    private medianSymbol: string
    private lastSymbol: string

    private overflowPattern: RegExp
    private underflowPattern: RegExp
    private zeroRightPattern: RegExp

    constructor (options: LexOrderOptions) {
        this.converter = options.converter

        if (options.spreadLevel < 1) {
            throw new Error('The spreadLevel must be at least 1.')
        }

        this.spreadLength = options.converter.symbolSize * options.spreadLevel

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

        this.overflowPattern = RegExp(`^(${lastSymbol})+$`)
        this.underflowPattern = RegExp(`^(${zeroSymbol})*${firstSymbol}$`)
        this.zeroRightPattern = RegExp(`(${zeroSymbol})+$`)
    }

    clean (word: string) {
        return word.replace(this.zeroRightPattern, '')
    }

    format (word: string, length: number) {
        return this.clean(word.padStart(length, this.zeroSymbol))
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
        const wA = this.clean(wordA)
        const wB = this.clean(wordB)

        if (wA === wB) {
            throw new Error('Both arguments are equal.')
        }

        const maxLength = Math.max(wA.length, wB.length)

        const result = this.converter.average(
            wA.padEnd(maxLength, this.zeroSymbol),
            wB.padEnd(maxLength, this.zeroSymbol)
        )

        return this.format(result, maxLength + this.converter.symbolSize)
    }

    next (word: string) {
        const w = this.clean(word)

        if (this.overflowPattern.test(w)) {
            return w + this.firstSymbol
        }

        const result = this.converter.increment(
            w.padEnd(this.spreadLength, this.zeroSymbol)
        )

        return this.format(result, w.length)
    }

    previous (word: string) {
        const w = this.clean(word)

        if (this.underflowPattern.test(w)) {
            return ''.padStart(w.length, this.zeroSymbol) + this.lastSymbol
        }

        const result = this.converter.decrement(
            w.padEnd(this.spreadLength, this.zeroSymbol)
        )

        return this.format(result, w.length)
    }
}
