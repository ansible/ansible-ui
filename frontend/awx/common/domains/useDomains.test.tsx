import { describe, expect, it, beforeEach } from 'vitest';
import { getTranslatedDomains, useDomainsStore } from './useDomains';

describe('useDomains store', () => {
  beforeEach(() => {
    useDomainsStore.setState({
      domains: getTranslatedDomains(),
      activeDomains: [],
    });
  });

  it('getTranslatedDomains returns three default domain groups', () => {
    const domains = getTranslatedDomains();
    expect(domains).toHaveLength(3);
    expect(domains[0].labels.map((label) => label.name)).toEqual([
      'network',
      'network.backup',
      'network.restore',
    ]);
  });

  it('addActiveDomain adds domain without duplicates', () => {
    const domain = getTranslatedDomains()[0];
    useDomainsStore.getState().addActiveDomain(domain);
    useDomainsStore.getState().addActiveDomain(domain);
    expect(useDomainsStore.getState().activeDomains).toHaveLength(1);
  });

  it('removeActiveDomain removes a domain', () => {
    const domain = getTranslatedDomains()[0];
    useDomainsStore.getState().addActiveDomain(domain);
    useDomainsStore.getState().removeActiveDomain(domain);
    expect(useDomainsStore.getState().activeDomains).toHaveLength(0);
  });

  it('toggleActiveDomain adds and removes domains', () => {
    const domain = getTranslatedDomains()[1];
    useDomainsStore.getState().toggleActiveDomain(domain);
    expect(useDomainsStore.getState().activeDomains).toContainEqual(domain);
    useDomainsStore.getState().toggleActiveDomain(domain);
    expect(useDomainsStore.getState().activeDomains).toHaveLength(0);
  });

  it('clearActiveDomains empties selection', () => {
    useDomainsStore.getState().setActiveDomains(getTranslatedDomains());
    useDomainsStore.getState().clearActiveDomains();
    expect(useDomainsStore.getState().activeDomains).toEqual([]);
  });

  it('setDomains replaces domain list', () => {
    const custom = [{ name: 'Custom', labels: [{ name: 'custom' }] }];
    useDomainsStore.getState().setDomains(custom);
    expect(useDomainsStore.getState().domains).toEqual(custom);
  });
});
