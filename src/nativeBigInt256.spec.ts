import converter, { decode, encode } from './nativeBigInt256'

const { average, decrement, increment } = converter

describe('decode', () => {
    const run = (word: string, result: number | string) => {
        expect(decode(word)).toEqual(BigInt(result))
    }

    const runThrow = (word: string, message: string) => {
        try {
            decode(word)
        } catch (error) {
            expect(error).toBeInstanceOf(Error)
            expect(error.message).toBe(message)
        }
    }

    it('converts "symbols" to their numeric value', () => {
        expect.assertions(15)

        run('00', 0)
        run('01', 1)
        run('0f', 15)
        run('10', 16)
        run('2a', 42)
        run('ff', 255)
        run('0100', 256)
        run('ba55', 47701)
        run('bada55', 12245589)
        run('ffffff', 16777215)
        run('1fffffffffffff', 9007199254740991)

        run('efffffffffffff', '67553994410557439')
        run('0fffffffffffffff', '1152921504606846975')
        run('ffffffffffffffff', '18446744073709551615')
        run('12345678901234567890', '85968058271978839505040')
    })

    it('throws when the word is empty', () => {
        expect.assertions(2)

        runThrow('', 'Argument is empty.')
    })

    it('throws when the word has wrong size', () => {
        expect.assertions(8)

        runThrow('0', 'Argument "0" is invalid.')
        runThrow('001', 'Argument "001" is invalid.')
        runThrow('00112', 'Argument "00112" is invalid.')
        runThrow('0011223', 'Argument "0011223" is invalid.')
    })

    it('throws when the word has invalid characters', () => {
        expect.assertions(8)

        runThrow('0_', 'Argument "0_" is invalid.')
        runThrow('00-1', 'Argument "00-1" is invalid.')
        runThrow('001.12', 'Argument "001.12" is invalid.')
        runThrow('0011 223', 'Argument "0011 223" is invalid.')
    })
})

describe('encode', () => {
    const run = (value: number | string, result: string) => {
        expect(encode(BigInt(value))).toBe(result)
    }

    it('converts "safe" values', () => {
        expect.assertions(12)

        run(0, '00')
        run(1, '01')
        run(15, '0f')
        run(16, '10')
        run(42, '2a')
        run(255, 'ff')
        run(256, '0100')
        run(47701, 'ba55')
        run(12245589, 'bada55')
        run(16777215, 'ffffff')
        run(9007199254740991, '1fffffffffffff')

        expect(encode(BigInt(67553994410557439))).not.toBe('efffffffffffff')
    })

    it('converts "unsafe" values without loss of precision', () => {
        expect.assertions(4)

        run('67553994410557439', 'efffffffffffff')
        run('1152921504606846975', '0fffffffffffffff')
        run('18446744073709551615', 'ffffffffffffffff')
        run('85968058271978839505040', '12345678901234567890')
    })
})

describe('decrement', () => {
    const run = (word: string, result: string) => {
        expect(decrement(word)).toBe(result)
    }

    it('decrements the numeric value of a word', () => {
        expect.assertions(11)

        run('ff', 'fe')
        run('fe', 'fd')
        run('02', '01')
        run('01', '00') // it would be avoided by LexOrder
        run('00', '-1') // underflow

        run('ff01', 'ff00')
        run('0101', '0100')

        run('ffff00', 'fffeff')
        run('00ffff', 'fffe')
        run('00ffaa', 'ffa9')
        run('00ff00', 'feff')
    })
})

describe('increment', () => {
    const run = (word: string, result: string) => {
        expect(increment(word)).toBe(result)
    }

    it('increments the numeric value of a word', () => {
        expect.assertions(8)

        run('00', '01')
        run('01', '02')
        run('fe', 'ff')
        run('ff', '0100') // overflow

        run('00ff00', 'ff01')
        run('00ffa9', 'ffaa')
        run('00ffff', '010000')
        run('ffff00', 'ffff01')
    })
})

describe('average', () => {
    const run = (wordA: string, wordB: string, result: string) => {
        expect(average(wordA, wordB)).toBe(result)
    }

    it('calculates the numeric values\' average of two words', () => {
        expect.assertions(5)

        run('dd4b', 'dd4c', 'dd4b80')
        run('4200', '4201', '420080')
        run('7fff', '8001', '800000')
        run('2b00', '4e32', '3c9900')
        run('0016', '3200', '190b00')
    })
})
