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

// clean(), format()

const validWord = '42'

const wordWithLeadingZeroBefore = '42'
const wordWithLeadingZero = '042'

// clean(), format(), intermediate()

const wordWithTrailingZero = '40'
const wordWithTrailingZeroClean = '4'

// format()

const wordWithTrailingZeroPadded = '040'
const wordWithTrailingZeroPaddedAfter = '04'

// get(), median

const mockedSymbolsOddLength = mockedSymbols.slice(0, -1)
const medianSymbol = '4'

// intermediate()

interface IntermediateTestData {
    wordA: { initial: string; padded: string }
    wordB: { initial: string; padded: string }
    average: string
    result: string
    formatLength: number
}

const intermediateTestData: IntermediateTestData[] = [
    // close, same level
    {
        wordA: {
            initial: '45',
            padded: '45'
        },
        wordB: {
            initial: '46',
            padded: '46'
        },
        average: '454',
        result: '454',
        formatLength: 3
    },
    // close, different level
    {
        wordA: {
            initial: '37',
            padded: '37'
        },
        wordB: {
            initial: '4',
            padded: '40'
        },
        average: '374',
        result: '374',
        formatLength: 3
    },
    // far, same level
    {
        wordA: {
            initial: '25',
            padded: '25'
        },
        wordB: {
            initial: '31',
            padded: '31'
        },
        average: '270',
        result: '27',
        formatLength: 3
    },
    // far, different level
    {
        wordA: {
            initial: '2',
            padded: '20'
        },
        wordB: {
            initial: '43',
            padded: '43'
        },
        average: '314',
        result: '314',
        formatLength: 3
    },
    // far, leading zero
    {
        wordA: {
            initial: '005',
            padded: '005'
        },
        wordB: {
            initial: '03',
            padded: '030'
        },
        average: '164',
        result: '0164',
        formatLength: 4
    }
]

// next(), previous()

const shortWord = '5'
const shortWordPadded = '50'

// next()

const shortWordNext = '51'

const wordOverflowBefore = '77'
const wordOverflowAfter = '771'

const wordNextTrailingZero = '510'
const wordNext = '51'
const wordNextAfter = '52'

// previous()

const shortWordPrevious = '47'

const wordUnderflowBefore = '01'
const wordUnderflowAfter = '007'

const wordPreviousTrailingZero = '470'
const wordPrevious = '47'
const wordPreviousAfter = '46'

// mocks

const mockedAverage = jest.fn<string, [wordA: string, wordB: string]>()
const mockedDecrement = jest.fn<string, [word: string]>()
const mockedIncrement = jest.fn<string, [word: string]>()

function mockConverter (symbols: string | string[]): SymbolConverter {
    return {
        symbolSize: [...symbols].filter(i => i !== undefined)[0]!.length,
        symbols: Object.freeze(Array.isArray(symbols) ? symbols : [...symbols]),
        decrement: mockedDecrement,
        increment: mockedIncrement,
        average: mockedAverage
    }
}

const mockedClean = jest.fn<string, [word: string]>()
const mockedFormat = jest.fn<string, [word: string, length: number]>()
const mockedIntermediate = jest.fn<string, [wordA: string, wordB: string]>()
const mockedNext = jest.fn<string, [word: string]>()
const mockedPrevious = jest.fn<string, [word: string]>()

function lexOrder ({
    symbols = mockedSymbols,
    spreadLevel = mockedSpreadLevel
}: Partial<{
    symbols: string | string[]
    spreadLevel: number
}> = {}) {
    const instance = new LexOrder({
        converter: mockConverter(symbols),
        spreadLevel
    })

    mockedClean.mockReset().mockImplementation(instance.clean)
    mockedFormat.mockReset().mockImplementation(instance.format)
    mockedIntermediate.mockReset().mockImplementation(instance.intermediate)
    mockedNext.mockReset().mockImplementation(instance.next)
    mockedPrevious.mockReset().mockImplementation(instance.previous)

    instance.clean = mockedClean
    instance.format = mockedFormat
    instance.intermediate = mockedIntermediate
    instance.next = mockedNext
    instance.previous = mockedPrevious

    return instance
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

describe('median', () => {
    it('returns the median symbol', () => {
        expect.assertions(2)

        const instance = lexOrder()

        expect(instance.median).toBe(medianSymbol)

        const instanceOdd = lexOrder({
            symbols: mockedSymbolsOddLength
        })

        expect(instanceOdd.median).toBe(medianSymbol)
    })
})

describe('clean', () => {
    const run = (word: string, result: string) => {
        const instance = lexOrder()

        expect(instance.clean(word)).toBe(result)
    }

    it('removes trailing zero symbols', () => {
        expect.assertions(3)

        run(validWord, validWord)
        run(wordWithLeadingZero, wordWithLeadingZero)
        run(wordWithTrailingZero, wordWithTrailingZeroClean)
    })
})

describe('format', () => {
    const run = (word: string, padded: string, result?: string) => {
        const instance = lexOrder()

        expect(instance.format(word, padded.length)).toBe(result ?? padded)

        expect(mockedClean.mock.calls).toEqual([[padded]])
    }

    it('applies padding at the start and removes at the end of a word', () => {
        expect.assertions(8)

        run(validWord, validWord)
        run(wordWithLeadingZeroBefore, wordWithLeadingZero)
        run(wordWithTrailingZero, wordWithTrailingZero, wordWithTrailingZeroClean)
        run(wordWithTrailingZero, wordWithTrailingZeroPadded, wordWithTrailingZeroPaddedAfter)
    })
})

describe('get', () => {
    it('calls intermediate()', () => {
        expect.assertions(4)

        const instance = lexOrder()

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

        const instance = lexOrder()

        mockedNext.mockReturnValueOnce(wordNextAfter)

        expect(instance.get(wordNext, null)).toBe(wordNextAfter)

        expect(mockedIntermediate).toHaveBeenCalledTimes(0)
        expect(mockedNext.mock.calls).toEqual([[wordNext]])
        expect(mockedPrevious).toHaveBeenCalledTimes(0)
    })

    it('calls previous()', () => {
        expect.assertions(4)

        const instance = lexOrder()

        mockedPrevious.mockReturnValueOnce(wordPreviousAfter)

        expect(instance.get(null, wordPrevious)).toBe(wordPreviousAfter)

        expect(mockedIntermediate).toHaveBeenCalledTimes(0)
        expect(mockedNext).toHaveBeenCalledTimes(0)
        expect(mockedPrevious.mock.calls).toEqual([[wordPrevious]])
    })

    it('returns the median symbol', () => {
        expect.assertions(5)

        const instance = lexOrder()

        expect(instance.get(null, null)).toBe(medianSymbol)

        const instanceOdd = lexOrder({
            symbols: mockedSymbolsOddLength
        })

        expect(instanceOdd.get(null, null)).toBe(medianSymbol)

        expect(mockedIntermediate).toHaveBeenCalledTimes(0)
        expect(mockedNext).toHaveBeenCalledTimes(0)
        expect(mockedPrevious).toHaveBeenCalledTimes(0)
    })
})

describe('intermediate', () => {
    it('calculates the average from the numeric value of two words', () => {
        expect.assertions(5 * intermediateTestData.length)

        const instance = lexOrder()

        for (const { wordA, wordB, average, result, formatLength } of intermediateTestData) {
            mockedAverage.mockReturnValueOnce(average)

            expect(instance.intermediate(wordA.initial, wordB.initial)).toBe(result)

            expect(mockedClean).toHaveBeenCalledTimes(3)
            expect(mockedClean.mock.calls.slice(0, 2)).toEqual([
                [wordA.initial],
                [wordB.initial]
            ])
            expect(mockedAverage.mock.calls).toEqual([
                [wordA.padded, wordB.padded]
            ])
            expect(mockedFormat.mock.calls).toEqual([
                [average, formatLength]
            ])

            mockedClean.mockClear()
            mockedAverage.mockClear()
            mockedFormat.mockClear()
        }
    })

    it('throws when both arguments are equal', () => {
        expect.assertions(5)

        const instance = lexOrder()

        try {
            instance.intermediate(wordWithTrailingZero, wordWithTrailingZeroClean)
        } catch (error) {
            expect(error).toBeInstanceOf(Error)
            expect(error.message).toBe('Both arguments are equal.')
        }

        expect(mockedClean.mock.calls).toEqual([
            [wordWithTrailingZero],
            [wordWithTrailingZeroClean]
        ])
        expect(mockedAverage).toHaveBeenCalledTimes(0)
        expect(mockedFormat).toHaveBeenCalledTimes(0)
    })
})

describe('next', () => {
    it('increments the numeric value in the word', () => {
        expect.assertions(5)

        const instance = lexOrder()

        mockedIncrement.mockReturnValueOnce(wordNextAfter)

        expect(instance.next(wordNextTrailingZero)).toBe(wordNextAfter)

        expect(mockedClean).toHaveBeenCalledTimes(2)
        expect(mockedClean.mock.calls.slice(0, 1)).toEqual([[wordNextTrailingZero]])
        expect(mockedIncrement.mock.calls).toEqual([[wordNext]])
        expect(mockedFormat.mock.calls).toEqual([[wordNextAfter, wordNext.length]])
    })

    describe('appends the first symbol', () => {
        test('when the word level is lower than the spreadLevel', () => {
            expect.assertions(5)

            const instance = lexOrder()

            mockedIncrement.mockReturnValueOnce(shortWordNext)

            expect(instance.next(shortWord)).toBe(shortWordNext)

            expect(mockedClean).toHaveBeenCalledTimes(2)
            expect(mockedClean.mock.calls.slice(0, 1)).toEqual([[shortWord]])
            expect(mockedIncrement.mock.calls).toEqual([[shortWordPadded]])
            expect(mockedFormat.mock.calls).toEqual([[shortWordNext, shortWord.length]])
        })

        test('when an increment would overflow', () => {
            expect.assertions(4)

            const instance = lexOrder()

            expect(instance.next(wordOverflowBefore)).toBe(wordOverflowAfter)

            expect(mockedClean.mock.calls).toEqual([[wordOverflowBefore]])
            expect(mockedIncrement).toHaveBeenCalledTimes(0)
            expect(mockedFormat).toHaveBeenCalledTimes(0)
        })
    })
})

describe('previous', () => {
    it('decrements the numeric value in the word', () => {
        expect.assertions(5)

        const instance = lexOrder()

        mockedDecrement.mockReturnValueOnce(wordPreviousAfter)

        expect(instance.previous(wordPreviousTrailingZero)).toBe(wordPreviousAfter)

        expect(mockedClean).toHaveBeenCalledTimes(2)
        expect(mockedClean.mock.calls.slice(0, 1)).toEqual([[wordPreviousTrailingZero]])
        expect(mockedDecrement.mock.calls).toEqual([[wordPrevious]])
        expect(mockedFormat.mock.calls).toEqual([[wordPreviousAfter, wordPrevious.length]])
    })

    describe('appends the last symbol', () => {
        test('when the word level is lower than the spreadLevel', () => {
            expect.assertions(5)

            const instance = lexOrder()

            mockedDecrement.mockReturnValueOnce(shortWordPrevious)

            expect(instance.previous(shortWord)).toBe(shortWordPrevious)

            expect(mockedClean).toHaveBeenCalledTimes(2)
            expect(mockedClean.mock.calls.slice(0, 1)).toEqual([[shortWord]])
            expect(mockedDecrement.mock.calls).toEqual([[shortWordPadded]])
            expect(mockedFormat.mock.calls).toEqual([[shortWordPrevious, shortWord.length]])
        })

        test('when a decrement would underflow', () => {
            expect.assertions(4)

            const instance = lexOrder()

            expect(instance.previous(wordUnderflowBefore)).toBe(wordUnderflowAfter)

            expect(mockedClean.mock.calls).toEqual([[wordUnderflowBefore]])
            expect(mockedDecrement).toHaveBeenCalledTimes(0)
            expect(mockedFormat).toHaveBeenCalledTimes(0)
        })
    })
})
