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
import { Int32 } from "../types";


/**
 * Represents a user context (contextual identity or container).
 */
export class UserContext {
  /**
   * Invalid user context ID.
   */
  public static readonly ID_UNSPECIFIED = -1 as Int32.Int32;

  /**
   * User context ID for "No Container" container (0).
   */
  public static readonly ID_DEFAULT = 0 as Int32.Int32;

  /**
   * "No Container" container.
   */
  public static readonly DEFAULT: UserContext = UserContext.createIncompleteUserContext(UserContext.ID_DEFAULT);

  /**
   * Returns true if the given id is a valid user context id.
   */
  public static validateUserContextId(id: Int32.Int32): boolean {
    return 0 <= id;
  }

  public static createIncompleteUserContext(id: Int32.Int32): UserContext {
    const defined = id == UserContext.ID_DEFAULT;
    return new UserContext(id, '', '', '', '', '', defined);
  }

  /**
   * Converts a cookie store ID to a user context ID.
   */
  public static fromCookieStoreId(cookieStoreId: string): Int32.Int32 {
    if (cookieStoreId == 'firefox-default') {
      return 0 as Int32.Int32;
    }
    const matches = String(cookieStoreId || '').match(/^firefox-container-([0-9]+)$/);
    if (!matches) {
      throw new TypeError('Invalid cookie store ID');
    } else {
      return Int32.toInt32(Number(matches[1]));
    }
  }

  /**
   * Converts a user context ID to a cookie store ID.
   */
  public static toCookieStoreId(userContextId: Int32.Int32): string {
    if (userContextId < 0) {
      throw new TypeError('Invalid user context ID');
    }
    if (userContextId == 0) {
      return 'firefox-default';
    }
    return 'firefox-container-' + userContextId;
  }

  /**
   * The user context ID for the identity.
   */
  public readonly id: Int32.Int32;

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
   * This is not intended to be called directly.
   */
  public constructor(id: Int32.Int32, name: string, color: string, colorCode: string, icon: string, iconUrl: string, defined = true) {
    if (!UserContext.validateUserContextId(id)) {
      throw new TypeError('Invalid user context id');
    }
    this.id = id;
    this.name = name;
    this.color = color;
    this.colorCode = colorCode;
    this.icon = icon;
    this.iconUrl = iconUrl;
    this.defined = defined;
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
    return 0 != this.id;
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
  public async remove(): Promise<void> {
    if (!this.isRemovable()) {
      throw new TypeError('This container cannot be deleted');
    }
    await browser.contextualIdentities.remove(this.cookieStoreId);
  }
}
