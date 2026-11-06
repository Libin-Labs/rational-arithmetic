import test from 'node:test';
import assert from 'node:assert/strict';
import * as lib from '../dist/esm/index.js';
function random(seed = 123456789) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
test('normalization sign and canonical zero', () => {
  assert.equal(new lib.Rational(6n, -8n).toString(), '-3/4');
  assert.equal(new lib.Rational(0n, -3n).toString(), '0');
  assert.equal(new lib.Rational(0n).denominator, 1n);
});
test('four operations and ordering', () => {
  const a = lib.Rational.parse('2/3'),
    b = lib.Rational.parse('3/4');
  assert.equal(a.add(b).toString(), '17/12');
  assert.equal(a.subtract(b).toString(), '-1/12');
  assert.equal(a.multiply(b).toString(), '1/2');
  assert.equal(a.divide(b).toString(), '8/9');
  assert.equal(a.compare(b), -1);
  assert.equal(a.negate().toString(), '-2/3');
});
test('strict parsing', () => {
  for (const text of ['1\n', '1/2\r\n', '1\u2028'])
    assert.throws(() => lib.Rational.parse(text), TypeError);
  for (const text of [' 1', '1 ', '1.2', '1e3', '1/2/3', '', '1 /2', '0x10'])
    assert.throws(() => lib.Rational.parse(text), TypeError);
  assert.equal(lib.Rational.parse('+12/-4').toString(), '-3');
});
test('division and bit limits', () => {
  assert.throws(() => new lib.Rational(1n, 0n), RangeError);
  assert.throws(() => new lib.Rational(8n, 1n, { maxBits: 3 }), RangeError);
  assert.throws(
    () => new lib.Rational(7n, 1n, { maxBits: 3 }).add(new lib.Rational(1n)),
    RangeError,
  );
  assert.throws(() => new lib.Rational(1n).divide(new lib.Rational(0n)), RangeError);
});
test('cross cancellation and frozen values', () => {
  const a = new lib.Rational(15n, 14n, { maxBits: 4 }),
    b = new lib.Rational(14n, 15n, { maxBits: 4 });
  assert.equal(a.multiply(b).toString(), '1');
  assert.equal(a.divide(a).toString(), '1');
  assert.ok(Object.isFrozen(a));
  assert.throws(() => {
    a.numerator = 8n;
  }, TypeError);
});
test('seeded independent raw fraction identities', () => {
  const rng = random();
  for (let i = 0; i < 500; i++) {
    const a = BigInt(Math.floor(rng() * 201) - 100),
      b = BigInt(1 + Math.floor(rng() * 99)),
      c = BigInt(Math.floor(rng() * 201) - 100),
      d = BigInt(1 + Math.floor(rng() * 99)),
      x = new lib.Rational(a, b),
      y = new lib.Rational(c, d);
    for (const [r, n, m] of [
      [x.add(y), a * d + c * b, b * d],
      [x.subtract(y), a * d - c * b, b * d],
      [x.multiply(y), a * c, b * d],
      ...(c === 0n ? [] : [[x.divide(y), a * d, b * c]]),
    ])
      assert.equal(r.numerator * m, n * r.denominator);
    assert.equal(x.compare(y), a * d < c * b ? -1 : a * d > c * b ? 1 : 0);
    assert.equal(lib.Rational.parse(x.toString()).toString(), x.toString());
  }
});
