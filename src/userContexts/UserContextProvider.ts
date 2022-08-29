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
import { SortedUserContextList } from './SortedUserContextList';
import { UserContextSortOrder } from './UserContextSortOrder';
import { Int32 } from '../types';

/**
 * Provides sorted access to UserContext instances.
 */
export class UserContextProvider {
  private sortOrder: UserContextSortOrder;
  public constructor(sortOrder: UserContextSortOrder) {
    this.sortOrder = sortOrder;
  }

  private contextualIdentityToUserContext(contextualIdentity: browser.ContextualIdentities.ContextualIdentity): UserContext {
    const userContextId = UserContext.fromCookieStoreId(contextualIdentity.cookieStoreId);
    return new UserContext(userContextId, contextualIdentity.name, contextualIdentity.color, contextualIdentity.colorCode, contextualIdentity.icon, contextualIdentity.iconUrl);
  }

  /**
   * Returns the user context specified by an id.
   */
  public async get(userContextId: Int32.Int32): Promise<UserContext> {
    if (userContextId == UserContext.ID_DEFAULT) {
      return UserContext.DEFAULT;
    }
    const cookieStoreId = UserContext.toCookieStoreId(userContextId);
    try {
      const contextualIdentity = await browser.contextualIdentities.get(cookieStoreId);
      if (!contextualIdentity) {
        throw new Error('This should not happen, however...');
      }
      return this.contextualIdentityToUserContext(contextualIdentity);
    } catch (_e) {
      return UserContext.createIncompleteUserContext(userContextId);
    }
  }

  /**
   * Returns the list of currently defined user contexts.
   */
   public async getAllDefined(): Promise<SortedUserContextList> {
    const userContexts = (await browser.contextualIdentities.query({}))
    .map((contextualIdentity) => this.contextualIdentityToUserContext(contextualIdentity));
    userContexts.push(UserContext.DEFAULT);
    const list = new SortedUserContextList(this.sortOrder, userContexts);
    return list;
  }
}
