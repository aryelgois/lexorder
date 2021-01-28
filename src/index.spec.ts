import factory from './index'
import LexOrder from './LexOrder'

const medianSymbol = '80'

// spreadLevel: 3
const nextData: [input: string, result: string][] = [
    ['80',     '800001'],

    ['800001', '800002'],
    ['800009', '80000a'],
    ['80000a', '80000b'],
    ['80000e', '80000f'],
    ['80000f', '800010'],

    ['800010', '800011'],
    ['80009f', '8000a0'],
    ['8000a0', '8000a1'],
    ['8000fe', '8000ff'],
    ['8000ff', '8001'],

    ['8001',   '800101'],
    ['800101', '800102'],
    ['8001fe', '8001ff'],
    ['8001ff', '8002'],

    ['80feff', '80ff'],
    ['80ff',   '80ff01'],
    ['80ff01', '80ff02'],
    ['80fffe', '80ffff'],
    ['80ffff', '81'],

    ['81',     '810001'],

    ['aabbcc00', 'aabbcd'],
    ['aabbccdd', 'aabbccde'],
    ['aabbccff', 'aabbcd'],

    ['00aabb00', '00aabc'],
    ['00aabbcc', '00aabbcd'],
    ['00aabbff', '00aabc']
]

// spreadLevel: 3
const previousData: [input: string, result: string][] = [
    ['80',     '7fffff'],

    ['7fffff', '7ffffe'],
    ['7ffffa', '7ffff9'],
    ['7ffff9', '7ffff8'],
    ['7ffff1', '7ffff0'],
    ['7ffff0', '7fffef'],

    ['7fffef', '7fffee'],
    ['7fffa0', '7fff9f'],
    ['7fff9f', '7fff9e'],
    ['7fff02', '7fff01'],
    ['7fff01', '7fff'],

    ['7fff',   '7ffeff'],
    ['7ffeff', '7ffefe'],
    ['7ffe02', '7ffe01'],
    ['7ffe01', '7ffe'],

    ['7f0101', '7f01'],
    ['7f01',   '7f00ff'],
    ['7f00ff', '7f00fe'],
    ['7f0002', '7f0001'],
    ['7f0001', '7f'],

    ['7f',     '7effff'],

    ['aabbcc00', 'aabbcb'],
    ['aabbccdd', 'aabbccdc'],
    ['aabbcc01', 'aabbcc'],

    ['00aabb00', '00aaba'],
    ['00aabbcc', '00aabbcb'],
    ['00aabb01', '00aabb']
]

const overflowData: [input: string, result: string][] = [
    ['feff', 'ff'], // no overflow
    ['ff', 'ff01'],
    ['ff01', 'ff02'], // no overflow
    ['ffff', 'ffff01'],
    ['ffff01', 'ffff02'], // no overflow
    ['ffffff', 'ffffff01'],
    ['ffffff01', 'ffffff02'], // no overflow
    ['ffffffff', 'ffffffff01'],
    ['ffffffff01', 'ffffffff02'] // no overflow

]

const underflowData: [input: string, result: string][] = [
    ['0101', '01'], // no underflow
    ['01', '00ff'],
    ['00ff', '00fe'], // no underflow
    ['0001', '0000ff'],
    ['0000ff', '0000fe'], // no underflow
    ['000001', '000000ff'],
    ['000000ff', '000000fe'], // no underflow
    ['00000001', '00000000ff'],
    ['00000000ff', '00000000fe'], // no underflow

]

const intermediateData: [inputA: string, inputB: string, result: string][] = [
    ['dd4b',   'dd4c', 'dd4b80'],
    ['42',     '4201', '420080'],
    ['807fff', '8080', '807fff80'],
    ['7fff',   '8001', '80'],
    ['2b',     '4e32', '3c99'],
    ['0016',   '32',   '190b'],
]

describe('LexOrder', () => {
    it('creates a new instance', () => {
        expect.assertions(1)

        expect(factory()).toBeInstanceOf(LexOrder)
    })

    it('returns the median symbol', () => {
        expect.assertions(2)

        const instance = factory()

        expect(instance.median).toBe(medianSymbol)
        expect(instance.get(null, null)).toBe(medianSymbol)
    })

    it('increments considering the spreadLevel', () => {
        expect.assertions(nextData.length)

        const instance = factory({ spreadLevel: 3 })

        for (const [input, result] of nextData) {
            expect(instance.next(input)).toBe(result)
        }
    })

    it('decrements considering the spreadLevel', () => {
        expect.assertions(previousData.length)

        const instance = factory({ spreadLevel: 3 })

        for (const [input, result] of previousData) {
            expect(instance.previous(input)).toBe(result)
        }
    })

    it('increments with overflow', () => {
        expect.assertions(overflowData.length)

        const instance = factory()

        for (const [input, result] of overflowData) {
            expect(instance.next(input)).toBe(result)
        }
    })

    it('decrements with underflow', () => {
        expect.assertions(underflowData.length)

        const instance = factory()

        for (const [input, result] of underflowData) {
            expect(instance.previous(input)).toBe(result)
        }
    })

    it('calculates the average', () => {
        expect.assertions(intermediateData.length * 2)

        const instance = factory()

        for (const [inputA, inputB, result] of intermediateData) {
            expect(instance.intermediate(inputA, inputB)).toBe(result)
            expect(instance.intermediate(inputB, inputA)).toBe(result)
        }
    })
})
