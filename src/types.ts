export interface LexOrderOptions {
    converter: SymbolConverter
    spreadLevel: number
}

export interface SymbolConverter {
    symbolSize: number
    symbols: readonly string[]
    decrement: (word: string) => string
    increment: (word: string) => string
    average: (wordA: string, wordB: string) => string
}
