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

const symbolsUndefinedMedian = [...'0123']
delete symbolsUndefinedMedian[2]

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

// get()

const mockedSymbolsOddLength = mockedSymbols.slice(0, -1)
const medianSymbol = '4'

// intermediate()

interface IntermediateTestData {
    wordA: { initial: string; padded: string; paddedValue: bigint }
    wordB: { initial: string; padded: string; paddedValue: bigint }
    maxLength: number
    average: bigint
    encoded: string
    result: string
}

const intermediateTestData: IntermediateTestData[] = [
    // close, same level
    {
        wordA: {
            initial: '45',
            padded: '45',
            paddedValue: BigInt(37)
        },
        wordB: {
            initial: '46',
            padded: '46',
            paddedValue: BigInt(38)
        },
        maxLength: 2,
        average: BigInt(37),
        encoded: '45',
        result: '454'
    },
    // close, different level
    {
        wordA: {
            initial: '37',
            padded: '37',
            paddedValue: BigInt(31)
        },
        wordB: {
            initial: '4',
            padded: '40',
            paddedValue: BigInt(32)
        },
        maxLength: 2,
        average: BigInt(31),
        encoded: '37',
        result: '374'
    },
    // far, same level
    {
        wordA: {
            initial: '25',
            padded: '25',
            paddedValue: BigInt(21)
        },
        wordB: {
            initial: '31',
            padded: '31',
            paddedValue: BigInt(25)
        },
        maxLength: 2,
        average: BigInt(23),
        encoded: '27',
        result: '27'
    },
    // far, different level
    {
        wordA: {
            initial: '2',
            padded: '20',
            paddedValue: BigInt(16)
        },
        wordB: {
            initial: '43',
            padded: '43',
            paddedValue: BigInt(35)
        },
        maxLength: 2,
        average: BigInt(25),
        encoded: '31',
        result: '314'
    },
    // far, leading zero
    {
        wordA: {
            initial: '005',
            padded: '005',
            paddedValue: BigInt(5)
        },
        wordB: {
            initial: '03',
            padded: '030',
            paddedValue: BigInt(24)
        },
        maxLength: 3,
        average: BigInt(14),
        encoded: '016',
        result: '0164'
    }
]

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
const mockedIntermediate = jest.fn<string, [wordA: string | null, wordB: string | null]>()
const mockedNext = jest.fn<string, [word: string]>()
const mockedPrevious = jest.fn<string, [word: string]>()

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
        expect.assertions(8)

        runThrow(
            () => lexOrder({ symbols: symbolsUndefinedZero }),
            'Got undefined when reading symbols[0].'
        )

        runThrow(
            () => lexOrder({ symbols: symbolsUndefinedFirst }),
            'Got undefined when reading symbols[1].'
        )

        runThrow(
            () => lexOrder({ symbols: symbolsUndefinedMedian }),
            'Got undefined when calculating median symbol.'
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

describe('get', () => {
    const setup = (instance = lexOrder()) => {
        instance.intermediate = mockedIntermediate
        instance.next = mockedNext
        instance.previous = mockedPrevious

        return instance
    }

    it('calls intermediate()', () => {
        expect.assertions(4)

        const instance = setup()

        const {
            wordA: { initial: wordA },
            wordB: { initial: wordB },
            result
        } = intermediateTestData[0]!

        mockedIntermediate.mockReturnValueOnce(result)

        expect(instance.get(wordA, wordB)).toBe(result)

        expect(mockedIntermediate.mock.calls).toEqual([[wordA, wordB]])
        expect(mockedNext).toHaveBeenCalledTimes(0)
        expect(mockedPrevious).toHaveBeenCalledTimes(0)
    })

    it('calls next()', () => {
        expect.assertions(4)

        const instance = setup()

        mockedNext.mockReturnValueOnce(wordNextAfter)

        expect(instance.get(wordNext, null)).toBe(wordNextAfter)

        expect(mockedIntermediate).toHaveBeenCalledTimes(0)
        expect(mockedNext.mock.calls).toEqual([[wordNext]])
        expect(mockedPrevious).toHaveBeenCalledTimes(0)
    })

    it('calls previous()', () => {
        expect.assertions(4)

        const instance = setup()

        mockedPrevious.mockReturnValueOnce(wordPreviousAfter)

        expect(instance.get(null, wordPrevious)).toBe(wordPreviousAfter)

        expect(mockedIntermediate).toHaveBeenCalledTimes(0)
        expect(mockedNext).toHaveBeenCalledTimes(0)
        expect(mockedPrevious.mock.calls).toEqual([[wordPrevious]])
    })

    it('returns the median symbol', () => {
        expect.assertions(5)

        const instance = setup()

        expect(instance.get(null, null)).toBe(medianSymbol)

        const instanceOdd = setup(lexOrder({
            symbols: mockedSymbolsOddLength
        }))

        expect(instanceOdd.get(null, null)).toBe(medianSymbol)

        expect(mockedIntermediate).toHaveBeenCalledTimes(0)
        expect(mockedNext).toHaveBeenCalledTimes(0)
        expect(mockedPrevious).toHaveBeenCalledTimes(0)
    })
})

describe('intermediate', () => {
    const setup = (instance = lexOrder()) => {
        instance.decode = mockedDecode
        instance.encode = mockedEncode

        return instance
    }

    it('calculates the average from the numeric value of two words', () => {
        expect.assertions(3 * intermediateTestData.length)

        const instance = setup()

        for (const { wordA, wordB, maxLength, average, encoded, result } of intermediateTestData) {
            mockedDecode
                .mockReturnValueOnce(wordA.paddedValue)
                .mockReturnValueOnce(wordB.paddedValue)

            mockedEncode.mockReturnValueOnce(encoded)

            expect(instance.intermediate(wordA.initial, wordB.initial)).toBe(result)

            expect(mockedDecode.mock.calls).toEqual([
                [wordA.padded],
                [wordB.padded]
            ])
            expect(stringifyBigInt(mockedEncode.mock.calls)).toEqual(stringifyBigInt([
                [average, maxLength]
            ]))

            mockedEncode.mockClear()
            mockedDecode.mockClear()
        }
    })

    it('throws when both arguments are equal', () => {
        expect.assertions(4)

        const instance = setup()

        try {
            instance.intermediate(validWord, validWord)
        } catch (error) {
            expect(error).toBeInstanceOf(Error)
            expect(error.message).toBe('Both arguments are equal.')
        }

        expect(mockedDecode).toHaveBeenCalledTimes(0)
        expect(mockedEncode).toHaveBeenCalledTimes(0)
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
