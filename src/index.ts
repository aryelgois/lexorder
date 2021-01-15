import LexOrder from './LexOrder'
import converter256 from './nativeBigInt256'
import type { LexOrderOptions } from './types'

export default function factory ({
    converter = converter256,
    spreadLevel = 2
}: Partial<LexOrderOptions> = {}) {
    return new LexOrder({
        converter,
        spreadLevel
    })
}
