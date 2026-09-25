import { assertType, test } from 'vitest';
import type { SetOptional, SetRequired } from './utilityTypes';

test('SetRequired makes selected keys required', () => {
  type Foo = {
    a?: number;
    b: string;
    c?: boolean;
  };

  assertType<SetRequired<Foo, 'c'>>({ b: 'x', c: true });
  assertType<{ a?: number; b: string; c: boolean }>({ b: 'x', c: true });
});

test('SetRequired leaves already-required keys required', () => {
  type Foo = {
    a?: number;
    b: string;
    c?: boolean;
  };

  assertType<SetRequired<Foo, 'b' | 'c'>>({ b: 'x', c: true });
});

test('SetOptional makes selected keys optional', () => {
  type Foo = {
    a: number;
    b: string;
    c: boolean;
  };

  assertType<SetOptional<Foo, 'a' | 'c'>>({ b: 'only-b' });
  assertType<SetOptional<Foo, 'a' | 'c'>>({ a: 1, b: 'x', c: false });
});

test('SetOptional leaves unselected keys unchanged', () => {
  type Foo = {
    a: number;
    b: string;
  };

  assertType<SetOptional<Foo, 'a'>>({ b: 'x' });
});
