import type { SymbolConverter } from './types'

const radix = 256

const symbolSize = 2

const symbols = Object.freeze(Array.from(
    { length: radix },
    (_, i) => i.toString(16).padStart(symbolSize, '0')
))

function countSymbols (value: string) {
    return Math.ceil(value.length / symbolSize)
}

function fromBigInt (value: bigint) {
    const result = value.toString(16)

    return result.padStart(countSymbols(result) * symbolSize, '0')
}

function toBigInt (value: string) {
    if (value === '') {
        throw new Error('Value is empty.')
    }

    if (value.length % symbolSize !== 0) {
        throw new Error(`Invalid value "${value}" does not fit the symbol size ${symbolSize}.`)
    }

    return BigInt(`0x${value}`)
}

const converter: SymbolConverter = {
    radix,
    symbols,
    countSymbols,
    fromBigInt,
    toBigInt
}

export default converter
