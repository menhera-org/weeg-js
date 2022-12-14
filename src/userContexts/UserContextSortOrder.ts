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
import { UserContextProvider } from './UserContextProvider';

export class UserContextSortOrder {
  private order: Uint32.Uint32[];
  public constructor() {
    this.order = [];
  }

  /**
   * Set the order of user contexts.
   */
  public setOrder(order: Uint32.Uint32[]): void {
    this.order = order;
  }

  /**
   * Returns the current order of user contexts.
   */
  public async getOrder(): Promise<Uint32.Uint32[]> {
    const provider = new UserContextProvider(this);
    const userContexts = [... await provider.getAllDefined()];
    return userContexts.map((userContext) => userContext.id);
  }

  public sort(userContexts: UserContext[]): UserContext[] {
    const copiedUserContexts = [... userContexts];
    copiedUserContexts.sort((a, b) => {
      const aIndex = this.order.indexOf(a.id);
      const bIndex = this.order.indexOf(b.id);
      if (aIndex < 0 && bIndex < 0) {
        return a.id - b.id;
      }
      if (aIndex < 0) {
        return 1;
      }
      if (bIndex < 0) {
        return -1;
      }
      return aIndex - bIndex;
    });
    return copiedUserContexts;
  }
}
