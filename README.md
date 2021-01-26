# LexOrder

Arbitrary precision lexicographical ordering.


## Installation


    $ npm install --save lexorder


## Usage

The `LexOrder` class can generate
words that are lexicographically ordered,
using a set of symbols.

Given a word using such symbols,
it can calculate the `next()` or `previous()`
word in sequence,
trying to spread the results
to some amount of symbols per word
(the `spreadLevel`).
With two different words,
it can calculate the `intermediate()`
with a simple average.

To simplify the usage,
there is also a `get()` method
that calls the others
and can give a starting point
when you still don't have any
words:

```js
lexOrder.get(null, null)   => medianSymbol
lexOrder.get(word, null)   => lexOrder.next(word)
lexOrder.get(null, word)   => lexOrder.previous(word)
lexOrder.get(wordA, wordB) => lexOrder.intermediate(wordA, wordB)
```


## SymbolConverter

To be able to work with
long words and any set of symbols,
two things are required:

1. An arbitrary precision math library
   &mdash; they usually work in base-10 (decimal)

2. Converting the symbols to/from numbers to do calculations

This is why the `LexOrder` takes a `SymbolConverter`:
an object with methods to help with these tasks
and the symbols it works with.

The default converter
shipped with the `lexorder` package
uses the built-in [BigInt] object
and has a "base-256" symbol set.
Actually, it is base-16 (hexadecimal)
with pairs of digits,
so each word could be stored as binary
in a database.

It would be possible to implement a base-36 set
or any other variation,
that could even use an alternative to BigInt,
the only requirement is that
the symbols are sorted properly.

For example,
using a base-4 set with the symbols `['0', 'a', 'b', 'c']`
the words could be organized in a tree-like structure:

    Level 1                                                                                                                                                                                   a                                                          b                                                                                                                      c
    .                                                                                ________________________________________________________________________________________________________/ \________________________________________________________/ \____________________________________________________________________________________________________________________/ \____________________________________________
    Level 2                                                                          0a                                                                         0b             0c                           aa             ab             ac                           ba             bb                                                                         bc                           ca             cb             cc
    .                       ________________________________________________________/  \_______________________________________________________________________/  \___________/  \___________   ___________/  \___________/  \___________/  \___________   ___________/  \___________/  \_______________________________________________________________________/  \___________   ___________/  \___________/  \___________/  \___________
    Level 3                 00a                00b                00c                                  0aa                0ab                0ac                   0ba 0bb 0bc    0ca 0cb 0cc   a0a a0b a0c    aaa aab aac    aba abb abc    aca acb acc   b0a b0b b0c    baa bab bac                   bba                bbb                bbc                   bca bcb bcc   c0a c0b c0c    caa cab cac    cba cbb cbc    cca ccb ccc
    .        ______________/   \______________/   \______________/   \______________    ______________/   \______________/   \______________/   \______________                                                                                                                          ______________/   \______________/   \______________/   \______________                                                                          \______________
    Level 4  000a 000b 000c     00aa 00ab 00ac     00ba 00bb 00bc     00ca 00cb 00cc    0a0a 0a0b 0a0c     0aaa 0aab 0aac     0aba 0abb 0abc     0aca 0acb 0acc                                                                                                                          bb0a bb0b bb0c     bbaa bbab bbac     bbba bbbb bbbc     bbca bbcb bbcc                                                                           ccca cccb cccc

Here, the median symbol is `b`.
Using a `spreadLevel` of 3,
we would have:

```js
lexOrder.get(null, null)  => 'b'

lexOrder.get('b',   null) => 'b0a'  // same as lexOrder.next('b')
lexOrder.get('b0a', null) => 'b0b'
lexOrder.get('b0b', null) => 'b0c'
lexOrder.get('b0c', null) => 'ba'
lexOrder.get('ba',  null) => 'baa'
// ...
lexOrder.get('bb',  null) => 'bba'  // keeps the spreadLevel of 3
// ...
lexOrder.get('bcc', null) => 'c'

lexOrder.get(null, 'b')   => 'acc'  // same as lexOrder.previous('b')
lexOrder.get(null, 'acc') => 'acb'
lexOrder.get(null, 'acb') => 'aca'
lexOrder.get(null, 'aca') => 'ac'
lexOrder.get(null, 'ac')  => 'abc'
// ...
lexOrder.get(null, 'a0a') => 'a'
// ...
lexOrder.get(null, '0b')  => '0ac'  // keeps the spreadLevel of 3

lexOrder.get('ac',  'ba') => 'b'    // could be ('ba', 'ac')
lexOrder.get('bba', 'bb') => 'bb0b'
lexOrder.get('0abc', '0ac') => '0abcb' // Level 5
```

Firstly,
it can be noted in the tree
that the zero symbol
&mdash; `symbols[0]`, the `'0'` character in this case &mdash;
is significant at the start of the words.
It makes possible to go indefinitely
to the left of the tree,
but never reaching an all-zeros word.
On the other hand,
zeros at the end of the word
are discarded internally before returning.
If you pass a word ending with the zero symbol,
it will be ignored.

The `spreadLevel` is not a hard limit,
so advancing at the ends
simply yields a longer word:

```js
lexOrder.get('ccc', null)  => 'ccca'
lexOrder.get(null, '000a') => '0000c'
```

And if there is no space between two words,
an `intermediate()` would still be possible:

```js
lexOrder.get('bac', 'bb') => 'bacb'
```


## [License]

See [License].


## [Changelog]

See [CHANGELOG.md][Changelog].


[changelog]: CHANGELOG.md
[license]: LICENSE

[bigint]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
