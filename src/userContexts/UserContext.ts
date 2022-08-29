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

const toCookieStoreId = (userContextId: Int32.Int32) => {
  if (userContextId < 0) {
    throw new TypeError('Invalid user context ID');
  }
  if (userContextId == 0) {
    return 'firefox-default';
  }
  return 'firefox-container-' + userContextId;
};

const fromCookieStoreId = (cookieStoreId: string) => {
  if (cookieStoreId == 'firefox-default') {
    return 0 as Int32.Int32;
  }
  const matches = String(cookieStoreId || '').match(/^firefox-container-([0-9]+)$/);
  if (!matches) {
    throw new TypeError('Invalid cookie store ID');
  } else {
    return Int32.toInt32(Number(matches[1]));
  }
};

export class UserContext {
  static readonly ID_UNSPECIFIED = -1 as Int32.Int32;

  /**
   * Converts a cookie store ID to a user context ID.
   */
  static fromCookieStoreId(cookieStoreId: string): Int32.Int32 {
    return fromCookieStoreId(cookieStoreId);
  }

  /**
   * The user context ID for the identity.
   */
  readonly id: Int32.Int32;

  /**
   * Name of the identity.
   */
  readonly name: string;

  /**
   * The color for the identity.
   */
  readonly color: string;

  /**
   * A hex code representing the exact color used for the identity.
   */
  readonly colorCode: string;

  /**
   * The name of an icon for the identity.
   */
  readonly icon: string;

  /**
   * A full resource:// URL pointing to the identity's icon.
   */
  readonly iconUrl: string;

  /**
   * Whether this identity is defined and stored in the browser or not.
   */
  readonly defined: boolean;

  /**
   * This is not intended to be called directly.
   */
  constructor(id: Int32.Int32, name: string, color: string, colorCode: string, icon: string, iconUrl: string, defined = true) {
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
  get cookieStoreId(): string {
    return toCookieStoreId(this.id);
  }

  /**
   * Returns false for unremovable identities.
   */
  isRemovable(): boolean {
    return 0 != this.id;
  }

  /**
   * Removes this identity forever.
   */
  async remove(): Promise<void> {
    if (!this.isRemovable()) {
      throw new TypeError('This container cannot be deleted');
    }
    await browser.contextualIdentities.remove(this.cookieStoreId);
  }
}
