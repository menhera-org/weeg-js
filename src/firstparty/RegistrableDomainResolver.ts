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

const PUBLIC_SUFFIX_LIST_URL = 'https://publicsuffix.org/list/public_suffix_list.dat';

const fetchList = async (): Promise<string> => {
  const response = await fetch(PUBLIC_SUFFIX_LIST_URL);
  const text = await response.text();
  return text;
};

const encodeDomain = (domain: string): string => {
  return new URL(`http://${domain}`).hostname;
};

const encodeRule = (rule: string): string => {
  if (rule.startsWith('*.')) {
    const domain = rule.slice(2);
    return '*.' + encodeDomain(domain);
  }
  return encodeDomain(rule);
};

const parseList = (text: string) => {
  const lines = text.split('\n');
  const rules = [];
  const exceptionRules = [];
  for (const line of lines) {
    // Skip comments and empty lines.
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('//') || trimmedLine.length === 0) {
      continue;
    }
    if (trimmedLine.startsWith('!')) {
      const rawRule = trimmedLine.slice(1);
      const encodedRule = encodeRule(rawRule);
      exceptionRules.push(encodedRule);
    } else {
      const encodedRule = encodeRule(trimmedLine);
      rules.push(encodedRule);
    }
  }
  return {rules, exceptionRules};
};

/**
 * Rule updates are asynchronous, so if you try to access the rules too early,
 * you may get an empty list.
 */
export class RegistrableDomainResolver {
  private rules = new Set<string>;
  private exceptionRules = new Set<string>;
  private initialized = false;

  constructor() {
    //
  }

  importRules(rules: string[], exceptionRules: string[]) {
    this.rules = new Set(rules);
    this.exceptionRules = new Set(exceptionRules);
    this.initialized = true;
  }

  exportRules(): {rules: string[], exceptionRules: string[]} {
    return {rules: [... this.rules], exceptionRules: [... this.exceptionRules]};
  }

  /**
   * This (or importRules()) must be called once before using the service.
   * This can be called repeatedly (usually once a day) to update the rules.
   */
  async updateRules(): Promise<void> {
    // Fetches the list of rules from the public suffix list.
    const text = await fetchList();
    const {rules, exceptionRules} = parseList(text);
    this.importRules(rules, exceptionRules);
  }

  /**
   * Returns if the rules have been initialized.
   * @returns true if the rules have been initialized.
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Returns the registrable domain for the given domain.
   * @param domain The domain to check. This must be encoded with Punycode.
   */
  getRegistrableDomain(domain: string): string {
    const names = domain.split('.');
    for (let i = 2; i <= names.length; i++) {
      const domain = names.slice(-i).join('.');
      const parentDomain = names.slice(-i + 1).join('.');
      const wildcardDomain = '*.' + parentDomain;
      if (this.exceptionRules.has(domain)) {
        return domain;
      }
      if (this.exceptionRules.has(wildcardDomain)) {
        return domain;
      }
    }
    for (let i = 1; i < names.length; i++) {
      const domain = names.slice(i).join('.');
      const parentDomain = names.slice(i + 1).join('.');
      const childDomain = names.slice(i - 1).join('.');
      const wildcardDomain = '*.' + parentDomain;
      if (this.rules.has(domain)) {
        return childDomain;
      }
      if (this.rules.has(wildcardDomain)) {
        return childDomain;
      }
    }
    // The rule '*'.
    return names.slice(-2).join('.');
  }
}
