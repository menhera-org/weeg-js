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

import browser from 'webextension-polyfill';
import { UserContext } from './UserContext';
import { Int32 } from "../types";

export class UserContextProvider {
  private order: Int32.Int32[];
  public constructor() {
    this.order = [];
  }

  public setOrder(order: Int32.Int32[]): void {
    this.order = order;
  }

  public async getOrder(): Promise<Int32.Int32[]> {
    const userContexts = await this.getAllDefined();
    return userContexts.map((userContext) => userContext.id);
  }

  private sort(userContexts: UserContext[]): UserContext[] {
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

  public async getAllDefined(): Promise<UserContext[]> {
    const userContexts = (await browser.contextualIdentities.query({}))
    .map((contextualIdentity) => {
      const userContextId = UserContext.fromCookieStoreId(contextualIdentity.cookieStoreId);
      return new UserContext(userContextId, contextualIdentity.name, contextualIdentity.color, contextualIdentity.colorCode, contextualIdentity.icon, contextualIdentity.iconUrl);
    });
    return this.sort(userContexts);
  }
}
