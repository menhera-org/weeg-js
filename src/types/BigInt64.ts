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

declare const BIGINT64: unique symbol;
export type BigInt64 = bigint & { [BIGINT64]: never };

const arr = new BigInt64Array(1);

export const isBigInt64 = (value: bigint): value is BigInt64 => value === toBigInt64(value);
export const toBigInt64 = (value: bigint): BigInt64 => {
  arr[0] = value;
  return arr[0] as BigInt64;
};
