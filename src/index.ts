export interface RationalOptions {
  maxBits?: number;
}
function gcd(a: bigint, b: bigint): bigint {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}
function bitLimit(value: bigint, limit: number): void {
  if ((value < 0n ? -value : value).toString(2).length > limit)
    throw new RangeError('BigInt bit limit exceeded');
}
export class Rational {
  readonly numerator: bigint;
  readonly denominator: bigint;
  readonly maxBits: number;
  constructor(numerator: bigint, denominator = 1n, options: RationalOptions = {}) {
    this.maxBits = options.maxBits ?? 4096;
    if (!Number.isSafeInteger(this.maxBits) || this.maxBits < 1 || this.maxBits > 65536)
      throw new RangeError('Invalid maxBits');
    if (typeof numerator !== 'bigint' || typeof denominator !== 'bigint')
      throw new TypeError('Expected bigint');
    if (denominator === 0n) throw new RangeError('Zero denominator');
    bitLimit(numerator, this.maxBits);
    bitLimit(denominator, this.maxBits);
    const divisor = gcd(numerator, denominator);
    numerator /= divisor;
    denominator /= divisor;
    if (denominator < 0n) {
      numerator = -numerator;
      denominator = -denominator;
    }
    this.numerator = numerator;
    this.denominator = denominator;
    Object.freeze(this);
  }
  static parse(text: string, options: RationalOptions = {}): Rational {
    const limit = options.maxBits ?? 4096;
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 65536)
      throw new RangeError('Invalid maxBits');
    if (
      typeof text !== 'string' ||
      text.length > 2 * Math.ceil(limit * Math.LOG10E * Math.LN2) + 5 ||
      text.trim() !== text ||
      !/^[+-]?\d+(?:\/[+-]?\d+)?$/.test(text)
    )
      throw new TypeError('Expected strict integer or numerator/denominator');
    const [n, d] = text.split('/');
    return new Rational(BigInt(n!), d === undefined ? 1n : BigInt(d), options);
  }
  private check(other: Rational): void {
    if (!(other instanceof Rational)) throw new TypeError('Expected Rational');
    bitLimit(other.numerator, this.maxBits);
    bitLimit(other.denominator, this.maxBits);
  }
  private result(n: bigint, d: bigint): Rational {
    const divisor = gcd(n, d);
    return new Rational(n / divisor, d / divisor, { maxBits: this.maxBits });
  }
  add(other: Rational): Rational {
    this.check(other);
    const g = gcd(this.denominator, other.denominator);
    return this.result(
      this.numerator * (other.denominator / g) + other.numerator * (this.denominator / g),
      this.denominator * (other.denominator / g),
    );
  }
  subtract(other: Rational): Rational {
    this.check(other);
    return this.add(other.negate());
  }
  multiply(other: Rational): Rational {
    this.check(other);
    const a = gcd(this.numerator, other.denominator),
      b = gcd(other.numerator, this.denominator);
    return this.result(
      (this.numerator / a) * (other.numerator / b),
      (this.denominator / b) * (other.denominator / a),
    );
  }
  divide(other: Rational): Rational {
    this.check(other);
    if (other.numerator === 0n) throw new RangeError('Division by zero');
    const a = gcd(this.numerator, other.numerator),
      b = gcd(this.denominator, other.denominator);
    return this.result(
      (this.numerator / a) * (other.denominator / b),
      (this.denominator / b) * (other.numerator / a),
    );
  }
  compare(other: Rational): -1 | 0 | 1 {
    this.check(other);
    const g = gcd(this.denominator, other.denominator);
    const difference =
      this.numerator * (other.denominator / g) - other.numerator * (this.denominator / g);
    return difference < 0n ? -1 : difference > 0n ? 1 : 0;
  }
  negate(): Rational {
    return new Rational(-this.numerator, this.denominator, { maxBits: this.maxBits });
  }
  toString(): string {
    return this.denominator === 1n
      ? String(this.numerator)
      : this.numerator + '/' + this.denominator;
  }
}
