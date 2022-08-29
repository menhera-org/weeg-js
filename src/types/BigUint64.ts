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
export type BigUint64 = Opaque<bigint, 'BigUint64'>;

export const isBigUint64 = (value: bigint): value is BigUint64 => value === toBigUint64(value);
export const toBigUint64 = (value: bigint): BigUint64 => {
  const intValue = 0xffffffffffffffffn & value;
  return intValue as BigUint64;
};
