import type { SymbolConverter } from './types'

const radix = 256

const symbolSize = 2

const symbols = Object.freeze(Array.from(
    { length: radix },
    (_, i) => i.toString(16).padStart(symbolSize, '0')
))

const validatePattern = RegExp(`^(${symbols.join('|')})+$`)

export function decode (word: string) {
    if (word === '') {
        throw new Error('Argument is empty.')
    }

    if (!validatePattern.test(word)) {
        throw new Error(`Argument "${word}" is invalid.`)
    }

    return BigInt(`0x${word}`)
}

export function encode (value: bigint) {
    const result = value.toString(16)
    const fullLength = Math.ceil(result.length / symbolSize) * symbolSize

    return result.padStart(fullLength, '0')
}

function decrement (word: string) {
    return encode(decode(word) - BigInt(1))
}

function increment (word: string) {
    return encode(decode(word) + BigInt(1))
}

function average (wordA: string, wordB: string) {
    const sum = decode(wordA) + decode(wordB)

    return encode(sum * BigInt(radix) / BigInt(2))
}

const converter: SymbolConverter = {
    symbolSize,
    symbols,
    decrement,
    increment,
    average
}

export default converter
