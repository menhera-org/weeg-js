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

import { Uint32 } from "../types";
import { UserContext } from "./UserContext";
import { UserContextSortOrder } from './UserContextSortOrder';

export class SortedUserContextList implements Iterable<UserContext> {
  private sortOrder: UserContextSortOrder;
  private userContextMap = new Map<Uint32.Uint32, UserContext>();

  public constructor(sortOrder: UserContextSortOrder, userContexts: Iterable<UserContext>) {
    this.sortOrder = sortOrder;
    for (const userContext of userContexts) {
      this.userContextMap.set(userContext.id, userContext);
    }
  }

  public get(userContextId: Uint32.Uint32): UserContext | undefined {
    return this.userContextMap.get(userContextId);
  }

  public has(userContextId: Uint32.Uint32): boolean {
    return this.userContextMap.has(userContextId);
  }

  public get size(): number {
    return this.userContextMap.size;
  }

  public *[Symbol.iterator]() {
    const values = [... this.userContextMap.values()];
    const sortedValues = this.sortOrder.sort(values);
    for (const userContext of sortedValues) {
      yield userContext;
    }
  }
}
