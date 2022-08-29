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

import { ExtensionStorage } from "./ExtensionStorage";
import { StorageArea } from "./StorageArea";

const PREFIX = 'config.';
const managed = new ExtensionStorage(StorageArea.MANAGED, PREFIX);
const local = new ExtensionStorage(StorageArea.LOCAL, PREFIX);
const sync = new ExtensionStorage(StorageArea.SYNC, PREFIX);

export class ConfigurationOption<T> {
  #key: string;
  #defaultValue: T;

  constructor(aKey: string, defaultValue: T) {
    this.#key = aKey;
    this.#defaultValue = defaultValue;
  }

  async get(): Promise<T> {
    const managedValue = await managed.get(this.#key);
    if (undefined !== managedValue) return managedValue;
    const localValue = await local.get(this.#key);
    if (undefined !== localValue) return localValue;
    const syncValue = await sync.get(this.#key);
    if (undefined !== syncValue) return syncValue;
    return this.#defaultValue;
  }

  async set(aValue: T, storageArea: StorageArea = StorageArea.SYNC) {
    let storage: ExtensionStorage;
    switch (storageArea) {
      case StorageArea.LOCAL: {
        storage = local;
        break;
      }

      case StorageArea.SYNC: {
        storage = sync;
        break;
      }

      default: {
        throw new TypeError('Unsupported storage area');
      }
    }
    await storage.set(this.#key, aValue);
  }

  #observeManaged(aObserver: (value: T) => void) {
    managed.observe(this.#key, async (managedValue) => {
      if (managedValue !== undefined) {
        aObserver(managedValue);
        return;
      }

      const localValue = await local.get(this.#key);
      if (localValue !== undefined) {
        aObserver(localValue);
        return;
      }

      const syncValue = await sync.get(this.#key);
      if (syncValue !== undefined) {
        aObserver(syncValue);
        return;
      }

      aObserver(this.#defaultValue);
    }, false);
  }

  #observeLocal(aObserver: (value: T) => void) {
    local.observe(this.#key, async (localValue) => {
      const managedValue = await managed.get(this.#key);
      if (managedValue !== undefined) {
        aObserver(managedValue);
        return;
      }

      if (localValue !== undefined) {
        aObserver(localValue);
        return;
      }

      const syncValue = await sync.get(this.#key);
      if (syncValue !== undefined) {
        aObserver(syncValue);
        return;
      }

      aObserver(this.#defaultValue);
    }, false);
  }

  #observeSync(aObserver: (value: T) => void) {
    sync.observe(this.#key, async (syncValue) => {
      const managedValue = await managed.get(this.#key);
      if (managedValue !== undefined) {
        aObserver(managedValue);
        return;
      }

      const localValue = await local.get(this.#key);
      if (localValue !== undefined) {
        aObserver(localValue);
        return;
      }

      if (syncValue !== undefined) {
        aObserver(syncValue);
        return;
      }

      aObserver(this.#defaultValue);
    }, false);
  }

  observe(aObserver: (value: T) => void) {
    (async () => {
      const currentValue = await this.get();
      aObserver(currentValue);
    })();
    
    this.#observeManaged(aObserver);
    this.#observeLocal(aObserver);
    this.#observeSync(aObserver);
  }
}
