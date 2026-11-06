# @lp-labs/rational-arithmetic

Normalized bounded BigInt rational arithmetic with cross-cancelled products. Zero runtime and peer dependencies. MIT. Node.js 18+; ES2022-compatible browser runtimes with BigInt where used. No browser globals accessed at import.

## Install

```sh
npm install @lp-labs/rational-arithmetic
```

## Quick start

```js
import { Rational } from '@lp-labs/rational-arithmetic';
const third = Rational.parse('1/3');
console.log(third.add(new Rational(1n, 6n)).toString()); // 1/2
```

ES modules use named imports above. CommonJS uses `const { Rational } = require('@lp-labs/rational-arithmetic');`. Both formats ship declarations.

## Public API and customization

- `RationalOptions`: `maxBits?` default 4096, allowed 1..65536.
- `Rational(numerator: bigint, denominator = 1n, options?)`: frozen normalized value, positive denominator; zero is 0/1.
- Read-only `numerator`, `denominator`, `maxBits`; static `Rational.parse(text,options?)` accepts strictly signed decimal integer or fraction (no whitespace/decimal/exponent).
- `add`, `subtract`, `multiply`, `divide` accept another Rational and return a new value with the receiver's limit. `compare(other): -1 | 0 | 1`, `negate(): Rational`, `toString(): string`.
- Cross-cancellation precedes multiplication/division; addition uses denominator GCD. No floating conversion or implicit number coercion API.

All runtime exports and public declaration types are listed above. Options are per call/instance; no global configuration.

## Errors, ownership and limits

TypeError for non-BigInt constructor values, malformed/overlong parse text or wrong operands. RangeError for invalid limits, zero denominator/divisor or excess bits. Constructor bounds raw operands before normalization; arithmetic bounds the other normalized operand against receiver maxBits and the normalized result. Intermediate arithmetic can reach roughly twice the configured bits (plus one for addition). Euclidean GCD and BigInt operation costs depend on bit length; storage O(B), no constant-time/cryptographic promise. Very long leading-zero strings may be rejected by the parse length budget.

Algorithms are synchronous and CPU/memory bounded by the stated limits, not cancellable or real-time. Validation does not sandbox hostile getters, proxies, callbacks or infinite iterables. TypeScript signatures are the supported input contract. No I/O, network, persistence or cryptographic guarantees.

## Development

```sh
npm ci --offline
npm run build
npm run typecheck
npm test
npm run format:check
```

Strict TypeScript, ESM/CommonJS, bare installed-package consumers with negative type assertions, and deterministic reference-oracle tests are included. Only TypeScript and Prettier are development dependencies.

## Support

If this library is useful to you, consider supporting its maintenance with a [donation via PayPal](https://www.paypal.me/LibinPrasanth).

## Author

Created by [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/). Connect on LinkedIn for updates and discussion.
