# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [Unreleased]


## [0.1.0] - 2021-01-27

### Added

- Dependency: TypeScript
- `LexOrder` class
- `LexOrderOptions` interface
- `SymbolConverter` interface
- `nativeBigInt256` module
  - `String.padStart()` requires TS target ES2017 or higher
  - `BigInt` requires TS target ES2020 or higher
- `index.ts` with `LexOrder` factory
- Dependency: Jest
- Unit tests for `nativeBigInt256`
- Unit tests for `LexOrder`
- Integration tests from `index.ts`
- Documentation about installation, usage and the `SymbolConverter`


[unreleased]: https://github.com/aryelgois/lexorder/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/aryelgois/lexorder/compare/initial-commit...v0.1.0
