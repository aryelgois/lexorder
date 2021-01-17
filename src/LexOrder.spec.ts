import LexOrder from './LexOrder'
import type { SymbolConverter } from './types'

const mockedSymbols = '01234567'

// constructor

const symbolsLowerLimit = ['0', '1']
const symbolsTooFew = ['one']

const symbolsUndefinedZero = [...'0123']
delete symbolsUndefinedZero[0]

const symbolsUndefinedFirst = [...'0123']
delete symbolsUndefinedFirst[1]

const symbolsUndefinedLast = [...'0123']
delete symbolsUndefinedLast[3]

const mockedSpreadLevel = 2
const spreadLevelLowerLimit = 1
const spreadLevelTooLow = 0

// decode(), encode()

const validWord = '42'
const validWordValue = BigInt(34)

// decode()

const invalidWordWithUnknownSymbol = '4x2'
const invalidWordEndingWithZero = '420'

// encode()

const wordWithLeadingZeroValue = BigInt(34)
const wordWithLeadingZeroBefore = '42'
const wordWithLeadingZero = '042'

const wordWithTrailingZeroValue = BigInt(32)
const wordWithTrailingZero = '40'
const wordWithTrailingZeroClean = '4'

// next(), previous()

const shortWord = '5'
const shortWordValue = BigInt(5)

// next()

const shortWordNext = '51'

const wordOverflowBefore = '77'
const wordOverflowAfter = '771'

const wordNext = '51'
const wordNextValue = BigInt(41)
const wordNextAfter = '52'
const wordNextAfterValue = BigInt(42)

// previous()

const shortWordPrevious = '47'
const shortWordPreviousBeforeAppend = '4'
const shortWordPreviousBeforeAppendValue = BigInt(4)

const wordUnderflowBefore = '01'
const wordUnderflowAfter = '007'

const wordPrevious = '47'
const wordPreviousValue = BigInt(39)
const wordPreviousAfter = '46'
const wordPreviousAfterValue = BigInt(38)

// mocks

const mockedCountSymbols = jest.fn<number, [value: string]>(v => v.length)
const mockedFromBigInt = jest.fn<string, [value: bigint]>()
const mockedToBigInt = jest.fn<bigint, [value: string]>()

function mockConverter (symbols: string | string[]): SymbolConverter {
    return {
        radix: symbols.length,
        symbols: Object.freeze(Array.isArray(symbols) ? symbols : [...symbols]),
        countSymbols: mockedCountSymbols,
        fromBigInt: mockedFromBigInt,
        toBigInt: mockedToBigInt
    }
}

const mockedDecode = jest.fn<bigint, [word: string]>()
const mockedEncode = jest.fn<string, [value: bigint, length: number]>()

function lexOrder ({
    symbols = mockedSymbols,
    spreadLevel = mockedSpreadLevel
}: Partial<{
    symbols: string | string[]
    spreadLevel: number
}> = {}) {
    return new LexOrder({
        converter: mockConverter(symbols),
        spreadLevel
    })
}

// utils

function stringifyBigInt (data: any) {
    return JSON.stringify(
        data,
        (_, v) => typeof v === 'bigint' ? `[BigInt] ${v}` : v
    )
}

describe('constructor', () => {
    const run = (factory: () => LexOrder) => {
        expect(factory()).toBeInstanceOf(LexOrder)
    }

    const runThrow = (factory: () => LexOrder, message: string) => {
        try {
            factory()
        } catch (error) {
            expect(error).toBeInstanceOf(Error)
            expect(error.message).toBe(message)
        }
    }

    it('creates a new instance', () => {
        expect.assertions(1)

        run(lexOrder)
    })

    it('throws when the spreadLevel is too low', () => {
        expect.assertions(3)

        run(() => lexOrder({ spreadLevel: spreadLevelLowerLimit }))

        runThrow(
            () => lexOrder({ spreadLevel: spreadLevelTooLow }),
            'The spreadLevel must be at least 1.'
        )
    })

    it('throws when there are too few symbols', () => {
        expect.assertions(3)

        run(() => lexOrder({ symbols: symbolsLowerLimit }))

        runThrow(
            () => lexOrder({ symbols: symbolsTooFew }),
            'There must be at least 2 symbols.'
        )
    })

    it('throws when reads undefined from symbols', () => {
        expect.assertions(6)

        runThrow(
            () => lexOrder({ symbols: symbolsUndefinedZero }),
            'Got undefined when reading symbols[0].'
        )

        runThrow(
            () => lexOrder({ symbols: symbolsUndefinedFirst }),
            'Got undefined when reading symbols[1].'
        )

        runThrow(
            () => lexOrder({ symbols: symbolsUndefinedLast }),
            'Got undefined when reading last symbol.'
        )
    })
})

describe('decode', () => {
    const run = (word: string) => {
        const instance = lexOrder()

        return instance.decode(word)
    }

    const runThrow = (word: string) => {
        try {
            run(word)
        } catch (error) {
            expect(error).toBeInstanceOf(Error)
            expect(error.message).toBe(`Argument "${word}" is invalid.`)
            expect(mockedToBigInt).toHaveBeenCalledTimes(0)
        }
    }

    it('converts a word to decimal with BigInt', () => {
        expect.assertions(2)

        mockedToBigInt.mockReturnValueOnce(validWordValue)

        expect(run(validWord)).toEqual(validWordValue)
        expect(mockedToBigInt.mock.calls).toEqual([[validWord]])
    })

    it('throws when the argument is invalid', () => {
        expect.assertions(6)

        runThrow(invalidWordWithUnknownSymbol)
        runThrow(invalidWordEndingWithZero)
    })
})

describe('encode', () => {
    const run = (value: bigint, padded: string, result?: string) => {
        const instance = lexOrder()

        expect(instance.encode(value, padded.length)).toBe(result ?? padded)
    }

    it('converts a decimal BigInt to a word', () => {
        expect.assertions(3)

        mockedFromBigInt
            .mockReturnValueOnce(validWord)
            .mockReturnValueOnce(wordWithLeadingZeroBefore)
            .mockReturnValueOnce(wordWithTrailingZero)

        run(validWordValue, validWord)
        run(wordWithLeadingZeroValue, wordWithLeadingZero)
        run(wordWithTrailingZeroValue, wordWithTrailingZero, wordWithTrailingZeroClean)
    })
})

describe('next', () => {
    const setup = () => {
        const instance = lexOrder()

        instance.decode = mockedDecode
        instance.encode = mockedEncode

        return instance
    }

    it('increments the numeric value in the word', () => {
        expect.assertions(4)

        const instance = setup()

        mockedDecode.mockReturnValueOnce(wordNextValue)
        mockedEncode.mockReturnValueOnce(wordNextAfter)

        expect(instance.next(wordNext)).toBe(wordNextAfter)

        expect(mockedCountSymbols.mock.calls).toEqual([[wordNext]])
        expect(mockedDecode.mock.calls).toEqual([[wordNext]])
        expect(stringifyBigInt(mockedEncode.mock.calls)).toEqual(stringifyBigInt([
            [wordNextAfterValue, wordNext.length]
        ]))
    })

    describe('appends the first symbol', () => {
        test('when the word level is lower than the spreadLevel', () => {
            expect.assertions(4)

            const instance = setup()

            expect(instance.next(shortWord)).toBe(shortWordNext)

            expect(mockedCountSymbols.mock.calls).toEqual([[shortWord]])
            expect(mockedDecode).toHaveBeenCalledTimes(0)
            expect(mockedEncode).toHaveBeenCalledTimes(0)
        })

        test('when an increment would overflow', () => {
            expect.assertions(4)

            const instance = setup()

            expect(instance.next(wordOverflowBefore)).toBe(wordOverflowAfter)

            expect(mockedCountSymbols.mock.calls).toEqual([[wordOverflowBefore]])
            expect(mockedDecode).toHaveBeenCalledTimes(0)
            expect(mockedEncode).toHaveBeenCalledTimes(0)
        })
    })
})

describe('previous', () => {
    const setup = () => {
        const instance = lexOrder()

        instance.decode = mockedDecode
        instance.encode = mockedEncode

        return instance
    }

    it('decrements the numeric value in the word', () => {
        expect.assertions(4)

        const instance = setup()

        mockedDecode.mockReturnValueOnce(wordPreviousValue)
        mockedEncode.mockReturnValueOnce(wordPreviousAfter)

        expect(instance.previous(wordPrevious)).toBe(wordPreviousAfter)

        expect(mockedDecode.mock.calls).toEqual([[wordPrevious]])
        expect(stringifyBigInt(mockedEncode.mock.calls)).toEqual(stringifyBigInt([
            [wordPreviousAfterValue, wordPrevious.length]
        ]))
        expect(mockedCountSymbols.mock.calls).toEqual([[wordPrevious]])
    })

    describe('appends the last symbol', () => {
        test('when the word level is lower than the spreadLevel', () => {
            expect.assertions(4)

            const instance = setup()

            mockedDecode.mockReturnValueOnce(shortWordValue)
            mockedEncode.mockReturnValueOnce(shortWordPreviousBeforeAppend)

            expect(instance.previous(shortWord)).toBe(shortWordPrevious)

            expect(mockedDecode.mock.calls).toEqual([[shortWord]])
            expect(stringifyBigInt(mockedEncode.mock.calls)).toEqual(stringifyBigInt([
                [shortWordPreviousBeforeAppendValue, shortWord.length]
            ]))
            expect(mockedCountSymbols.mock.calls).toEqual([[shortWord]])
        })

        test('when a decrement would underflow', () => {
            expect.assertions(4)

            const instance = setup()

            expect(instance.previous(wordUnderflowBefore)).toBe(wordUnderflowAfter)

            expect(mockedCountSymbols).toHaveBeenCalledTimes(0)
            expect(mockedDecode).toHaveBeenCalledTimes(0)
            expect(mockedEncode).toHaveBeenCalledTimes(0)
        })
    })
})
