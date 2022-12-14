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
import { Uint32 } from '../types';


/**
 * Represents a user context (contextual identity or container).
 */
export class UserContext {
  /**
   * User context ID for "No Container" container (0).
   */
  public static readonly ID_DEFAULT = 0 as Uint32.Uint32;

  /**
   * "No Container" container.
   */
  public static readonly DEFAULT: UserContext = UserContext.createIncompleteUserContext(UserContext.ID_DEFAULT);

  /**
   * Returns true if the given id is a valid user context id.
   */
  public static validateUserContextId(id: Uint32.Uint32): boolean {
    return 0 <= id;
  }

  public static createIncompleteUserContext(id: Uint32.Uint32): UserContext {
    const defined = id == UserContext.ID_DEFAULT;
    return new UserContext(id, '', '', '', '', '', defined);
  }

  public static isCookieStoreIdPrivateBrowsing(cookieStoreId: string): boolean {
    return cookieStoreId == 'firefox-private';
  }

  /**
   * Converts a cookie store ID to a user context ID.
   */
  public static fromCookieStoreId(cookieStoreId: string): Uint32.Uint32 {
    if (cookieStoreId == 'firefox-default') {
      return 0 as Uint32.Uint32;
    }
    const matches = String(cookieStoreId || '').match(/^firefox-container-([0-9]+)$/);
    if (!matches) {
      throw new TypeError('Invalid cookie store ID');
    } else {
      return Uint32.toUint32(Number(matches[1]));
    }
  }

  /**
   * Converts a user context ID to a cookie store ID.
   */
  public static toCookieStoreId(userContextId: Uint32.Uint32, privateBrowsingId = 0 as Uint32.Uint32): string {
    if (userContextId < 0) {
      throw new TypeError('Invalid user context ID');
    }
    if (privateBrowsingId > 0) {
      return 'firefox-private';
    }
    if (userContextId == 0) {
      return 'firefox-default';
    }
    return 'firefox-container-' + userContextId;
  }

  /**
   * The user context ID for the identity.
   */
  public readonly id: Uint32.Uint32;

  /**
   * 1 if private browsing is enabled, 0 otherwise.
   */
  public readonly privateBrowsingId = 0 as Uint32.Uint32;

  /**
   * Name of the identity.
   */
  public readonly name: string;

  /**
   * The color for the identity.
   */
  public readonly color: string;

  /**
   * A hex code representing the exact color used for the identity.
   */
  public readonly colorCode: string;

  /**
   * The name of an icon for the identity.
   */
  public readonly icon: string;

  /**
   * A full resource:// URL pointing to the identity's icon.
   */
  public readonly iconUrl: string;

  /**
   * Whether this identity is defined and stored in the browser or not.
   */
  public readonly defined: boolean;

  /**
   * Returns a UserContext for private browsing.
   * @returns a UserContext for private browsing.
   */
  public static createPrivateBrowsing(): UserContext {
    const userContext = new UserContext(0 as Uint32.Uint32, '', '', '', '', '', true, 1 as Uint32.Uint32);
    return userContext;
  }

  /**
   * This is not intended to be called directly.
   */
  public constructor(id: Uint32.Uint32, name: string, color: string, colorCode: string, icon: string, iconUrl: string, defined = true, privateBrowsingId = 0 as Uint32.Uint32) {
    if (!UserContext.validateUserContextId(id)) {
      throw new TypeError('Invalid user context id');
    }
    if (privateBrowsingId > 0 && id != 0) {
      throw new TypeError('UserContextId must be 0 for private browsing');
    }
    this.id = id;
    this.name = name;
    this.color = color;
    this.colorCode = colorCode;
    this.icon = icon;
    this.iconUrl = iconUrl;
    this.defined = defined;
    this.privateBrowsingId = privateBrowsingId;
  }

  /**
   * The cookie store ID for the identity.
   */
  public get cookieStoreId(): string {
    return UserContext.toCookieStoreId(this.id);
  }

  /**
   * Returns false for unremovable identities.
   */
  public isRemovable(): boolean {
    return 0 != this.id && 0 == this.privateBrowsingId;
  }

  /**
   * Returns true for incomplete containers.
   */
  public isIncomplete(): boolean {
    // name may be empty in legitimate containers.
    if (this.color == '' || this.colorCode == '') return true;
    if (this.icon == '' || this.iconUrl == '') return true;
    return false;
  }

  /**
   * Removes this identity forever.
   */
  public async remove(removeBrowsingData = true): Promise<void> {
    if (!this.isRemovable()) {
      throw new TypeError('This container cannot be deleted');
    }
    if (removeBrowsingData) await this.removeBrowsingData();
    await browser.contextualIdentities.remove(this.cookieStoreId);
  }

  public async removeBrowsingData(): Promise<void> {
    await browser.browsingData.remove({
      cookieStoreId: this.cookieStoreId,
    }, {
      cookies: true,
      localStorage: true, // not supported on old Firefox
      indexedDB: true,
    });
  }
}
