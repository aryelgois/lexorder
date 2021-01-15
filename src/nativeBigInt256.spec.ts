import converter from './nativeBigInt256'

const {
    countSymbols,
    fromBigInt,
    toBigInt
} = converter

describe('countSymbols', () => {
    const run = (value: string, result: number) => {
        expect(countSymbols(value)).toBe(result)
    }

    it('counts how many "symbols" are in a string', () => {
        expect.assertions(6)

        run('', 0)
        run('00', 1)
        run('0011', 2)
        run('001122', 3)
        run('0011223300112233', 8)
        run('001122330011223300112233', 12)
    })

    it('rounds up when a "symbol" has wrong size', () => {
        expect.assertions(4)

        run('0', 1)
        run('001', 2)
        run('00112', 3)
        run('0011223', 4)
    })
})

describe('fromBigInt', () => {
    const run = (value: number | string, result: string) => {
        expect(fromBigInt(BigInt(value))).toBe(result)
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

        expect(fromBigInt(BigInt(67553994410557439))).not.toBe('efffffffffffff')
    })

    it('converts "unsafe" values without loss of precision', () => {
        expect.assertions(4)

        run('67553994410557439', 'efffffffffffff')
        run('1152921504606846975', '0fffffffffffffff')
        run('18446744073709551615', 'ffffffffffffffff')
        run('85968058271978839505040', '12345678901234567890')
    })
})

describe('toBigInt', () => {
    const run = (value: string, result: number | string) => {
        expect(toBigInt(value)).toEqual(BigInt(result))
    }

    const runThrow = (value: string, message: string) => {
        try {
            toBigInt(value)
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

    it('throws when the value is empty', () => {
        expect.assertions(2)

        runThrow('', 'Value is empty.')
    })

    it('throws when the value has wrong size', () => {
        expect.assertions(8)

        runThrow('0', 'Invalid value "0" does not fit the symbol size 2.')
        runThrow('001', 'Invalid value "001" does not fit the symbol size 2.')
        runThrow('00112', 'Invalid value "00112" does not fit the symbol size 2.')
        runThrow('0011223', 'Invalid value "0011223" does not fit the symbol size 2.')
    })
})
