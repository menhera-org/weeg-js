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

/**
 * Unsigned 32-bit integer.
 * NOTE: This class cannot have instance members.
 */
export class ExperimentalUint32 {
  /**
   * Converts a value to a Uint32.
   * @param value the value to convert to a Uint32.
   * @returns the converted value.
   */
  public static toInstance(value: number): ExperimentalUint32 {
    return value >>> 0;
  }

  /**
   * Returns true iff the value is a Uint32.
   * @param value the value to check.
   * @returns true if the value is a Uint32.
   */
  public static hasInstance(value: unknown): value is ExperimentalUint32 {
    return typeof value === 'number' && Object.is(value >>> 0, value);
  }

  /**
   * Converts a string to a Uint32.
   * @param value the string to convert to a Uint32.
   * @returns the converted value.
   */
  public static fromString(value: string): ExperimentalUint32 {
    const result = parseInt(value, 10);
    if (!this.hasInstance(result)) {
      throw new Error(`Invalid ${this.name}: ${value}`);
    }
    return result;
  }

  public static [Symbol.hasInstance](value: unknown): value is ExperimentalUint32 {
    return ExperimentalUint32.hasInstance(value);
  }

  private constructor() {
    throw new Error('This class cannot be instantiated.');
  }
}
