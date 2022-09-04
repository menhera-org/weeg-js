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

declare const INT32: unique symbol;
export type Int32 = number & { [INT32]: never };

export const MIN: Int32 = (1 << 31) as Int32;
export const MAX: Int32 = ~MIN as Int32;

/**
 * Test if a value is an Int32. This throws on bigints.
 * @param value The number to test.
 * @returns true if the value is an Int32.
 */
export const isInt32 = (value: number): value is Int32 => Object.is(value, 0|value);

/**
 * Converts a value to an Int32. This throws on bigints (use Number(bigint)).
 * @param value The number to convert to an Int32.
 * @returns the Int32 value.
 */
export const toInt32 = (value: number): Int32 => (0|value) as Int32;

/**
 * Converts a string to an Int32.
 * @param value the value to convert to a Int32.
 * @returns the converted value.
 */
export const fromString = (value: string): Int32 => {
  const result = parseInt(value, 10);
  if (!isInt32(result)) {
    throw new Error(`Invalid Int32: ${value}`);
  }
  return result;
};
