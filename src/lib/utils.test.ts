import {test} from 'node:test';
import assert from 'node:assert/strict';
import {cn} from './utils';

test('cn merges class names and resolves Tailwind conflicts (last wins)', () => {
  assert.equal(cn('px-2', 'px-4'), 'px-4');
});

test('cn drops falsy values', () => {
  assert.equal(cn('a', false, undefined, null, 'b'), 'a b');
});
