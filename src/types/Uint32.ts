// -*- indent-tabs-mode: nil; tab-width: 2; -*-
// vim: set ts=&2 sw=2 et ai :

/*
  weeg-js
  Copyright (C) 2022 WebExtensions Experts Group

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  https://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

type Opaque<T, K> = T & { __opaque__: K };
export type Uint32 = Opaque<number, 'Uint32'>;

/**
 * Test if a value is a Uint32. This throws on bigints.
 * @param value The number to test.
 * @returns true if the value is a Uint32.
 */
export const isUint32 = (value: number): value is Uint32 => Object.is(value, toUint32(value));

/**
 * Converts a value to a Uint32. This throws on bigints (use Number(bigint)).
 * @param value The number to convert to a Uint32.
 * @returns the Uint32 value.
 */
export const toUint32 = (value: number): Uint32 => (value >>> 0) as Uint32;

/**
 * Converts a string to an Uint32.
 * @param value the value to convert to a Uint32.
 * @returns the converted value.
 */
 export const fromString = (value: string): Uint32 => {
  const result = parseInt(value, 10);
  if (!isUint32(result)) {
    throw new Error(`Invalid Uint32: ${value}`);
  }
  return result;
};

/**
 * Equivalent to `toUint32(~value)`.
 */
export const not = (value: Uint32): Uint32 => toUint32(~value);

/**
 * Equivalent to `toUint32(value1 ^ value2)`.
 */
export const xor = (value1: Uint32, value2: Uint32): Uint32 => toUint32(value1 ^ value2);

/**
 * Equivalent to `toUint32(value1 & value2)`.
 */
export const and = (value1: Uint32, value2: Uint32): Uint32 => toUint32(value1 & value2);

/**
 * Equivalent to `toUint32(value1 | value2)`.
 */
export const or = (value1: Uint32, value2: Uint32): Uint32 => toUint32(value1 | value2);
