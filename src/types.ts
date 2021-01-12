export interface LexOrderOptions {
    converter: SymbolConverter
    spreadLevel: number
}

export interface SymbolConverter {
    radix: number
    symbols: readonly string[]
    countSymbols: (value: string) => number
    fromBigInt: (value: bigint) => string
    toBigInt: (value: string) => bigint
}
