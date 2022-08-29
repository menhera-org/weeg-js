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
import { StorageArea } from "./StorageArea.js";

export class ExtensionStorage {
  #storage: browser.Storage.StorageArea;
  #prefix: string;
  #areaName: 'local' | 'sync' | 'managed';

  constructor(storageArea: StorageArea, prefix: string) {
    this.#prefix = prefix;
    switch (storageArea) {
      case StorageArea.LOCAL: {
        this.#storage = browser.storage.local;
        this.#areaName = 'local';
        break;
      }

      case StorageArea.SYNC: {
        this.#storage = browser.storage.sync;
        this.#areaName = 'sync';
        break;
      }

      case StorageArea.MANAGED: {
        this.#storage = browser.storage.managed;
        this.#areaName = 'managed';
        break;
      }

      default: {
        throw new TypeError('Unsupported storage area');
      }
    }
  }

  #getKey(aKey: string) {
    return this.#prefix + aKey;
  }

  async get(aKey: string): Promise<any> {
    const key = this.#getKey(aKey);
    const values = await this.#storage.get(key);
    if (!values) {
      return undefined;
    }
    return values[key];
  }

  async set(aKey: string, aValue: any) {
    const key = this.#getKey(aKey);
    await this.#storage.set({
      [key]: aValue,
    });
  }

  async delete(aKey: string) {
    const key = this.#getKey(aKey);
    await this.#storage.remove(key);
  }

  async has(aKey: string) {
    const value = this.get(aKey);
    return value !== undefined;
  }

  observe(aKey: string, aObserver: (value: any) => void, aReportCurrentValue = true) {
    const key = this.#getKey(aKey);
    if (aReportCurrentValue) {
      this.get(aKey).then((value) => {
        aObserver(value);
      });
    }
    browser.storage.onChanged.addListener((changes, areaName) => {
      if (areaName != this.#areaName) return;
      if (!(key in changes)) return;
      const change = changes[key];
      if (change === undefined || change === null) return;
      const newValue = change.newValue;
      aObserver(newValue);
    });
  }
}
