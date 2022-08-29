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
export type Int32 = Opaque<number, 'Int32'>;

export const isInt32 = (value: number): value is Int32 => Object.is(value, 0|value);
export const toInt32 = (value: number): Int32 => {
  const intValue = 0|value;
  return intValue as Int32;
};