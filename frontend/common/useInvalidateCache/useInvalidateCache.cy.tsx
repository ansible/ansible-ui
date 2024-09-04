/* eslint-disable i18next/no-literal-string */
import { SWRConfig } from 'swr';
import { useClearCache } from './useInvalidateCache';

function ClearAllComponent() {
  const { clearAllCache } = useClearCache();
  return (
    <div>
      <button onClick={clearAllCache}>Clear Cache</button>
    </div>
  );
}

function ClearByKeyComponent({ cacheKey }: { cacheKey: string }) {
  const { clearCacheByKey } = useClearCache();
  return (
    <div>
      <button onClick={() => clearCacheByKey(cacheKey)}>Clear Cache By Key</button>
    </div>
  );
}

describe('useClearCache', () => {
  it('should clear all cache when button is clicked', () => {
    const mockCache = new Map();
    mockCache.set('key1', 'value1');
    mockCache.set('key2', 'value2');
    cy.wrap(mockCache).should('have.property', 'size', 2);

    cy.mount(
      <SWRConfig value={{ provider: () => mockCache }}>
        <ClearAllComponent />
      </SWRConfig>
    );

    cy.get('button').click();
    cy.wrap(mockCache).should('have.property', 'size', 0);
  });

  it('should clear cache by key when button is clicked', () => {
    const mockCache = new Map();
    mockCache.set('key1', 'value1');
    mockCache.set('key2', 'value2');
    mockCache.set('key3?query=string', 'value3');

    cy.mount(
      <SWRConfig value={{ provider: () => mockCache }}>
        <ClearByKeyComponent cacheKey={'key3'} />
      </SWRConfig>
    );
    cy.get('button').click();
    cy.wrap(mockCache).should('have.property', 'size', 2);
    cy.wrap(mockCache).invoke('has', 'key1').should('be.true');
    cy.wrap(mockCache).invoke('has', 'key2').should('be.true');
    cy.wrap(mockCache).invoke('has', 'key3?query=string').should('be.false');
  });
});
