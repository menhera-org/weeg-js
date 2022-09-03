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

export class OriginAttributes {
  public static readonly DEFAULT = new OriginAttributes();

  public readonly firstpartyDomain: string;
  public readonly userContextId: Uint32.Uint32;
  public readonly privateBrowsingId: Uint32.Uint32;

  public static fromString(str: string): OriginAttributes {
    if (str === '') {
      return OriginAttributes.DEFAULT;
    }
    if (!str.startsWith('^')) {
      throw new Error(`OriginAttributes.fromString: invalid string: ${str}`);
    }
    const parts = str.slice(1).split('&');
    const attrs = {... new OriginAttributes()};
    for (const part of parts) {
      const [key, value] = part.split('=');
      if (!value) {
        throw new Error(`OriginAttributes.fromString: invalid string: ${str}`);
      }
      switch (key) {
        case 'firstPartyDomain':
          attrs.firstpartyDomain = value;
          break;
        case 'userContextId':
          attrs.userContextId = Uint32.fromString(value);
          break;
        case 'privateBrowsingId':
          attrs.privateBrowsingId = Uint32.fromString(value);
          break;
        default:
          throw new Error(`OriginAttributes.fromString: invalid string: ${str}`);
      }
    }

    return new OriginAttributes(attrs.firstpartyDomain, attrs.userContextId, attrs.privateBrowsingId);
  }

  public constructor(firstpartyDomain = '', userContextId = 0 as Uint32.Uint32, privateBrowsingId = 0 as Uint32.Uint32) {
    if (userContextId != 0 && privateBrowsingId != 0) {
      throw new Error('UserContextId must be 0 for private browsing');
    }
    this.firstpartyDomain = firstpartyDomain;
    this.userContextId = userContextId;
    this.privateBrowsingId = privateBrowsingId;
  }

  public hasFirstpartyDomain(): boolean {
    return this.firstpartyDomain !== '';
  }

  public isPrivateBrowsing(): boolean {
    return this.privateBrowsingId !== 0;
  }

  public get cookieStoreId(): string {
    if (this.isPrivateBrowsing()) {
      return 'firefox-private';
    }
    if (this.userContextId === 0) {
      return 'firefox-default';
    }
    return `firefox-container-${this.userContextId}`;
  }

  public equals(other: OriginAttributes): boolean {
    return this.firstpartyDomain === other.firstpartyDomain
      && this.userContextId === other.userContextId
      && this.privateBrowsingId === other.privateBrowsingId;
  }

  public isDefault(): boolean {
    return this.equals(OriginAttributes.DEFAULT);
  }

  public toString(): string {
    if (this.isDefault()) {
      return '';
    }
    const parts = [];
    if (this.hasFirstpartyDomain()) {
      parts.push(`firstPartyDomain=${this.firstpartyDomain}`);
    }
    if (this.userContextId !== 0) {
      parts.push(`userContextId=${this.userContextId}`);
    }
    if (this.privateBrowsingId !== 0) {
      parts.push(`privateBrowsingId=${this.privateBrowsingId}`);
    }
    return '^' + parts.join('&');
  }
}
