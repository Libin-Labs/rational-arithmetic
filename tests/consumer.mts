import { Rational, type RationalOptions } from '@lp-labs/rational-arithmetic';
export type PublicTypes = [RationalOptions];
void Rational;
const value: Rational = Rational.parse('1/2', { maxBits: 256 });
const n: bigint = value.numerator;
void n;
// @ts-expect-error bigint only, no lossy numbers
new Rational(1);
