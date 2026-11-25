import { createElement } from 'react';
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { PageNavigation } from './PageNavigation';
import type { PageNavigationItem } from './PageNavigationItem';

const stub = createElement('div');

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('PageNavigation', () => {
  it('renders an item using its label when its id is empty', () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
    });

    const navigation: PageNavigationItem[] = [
      { id: '', label: 'Empty id item', path: '/empty-id', element: stub },
    ];

    render(
      <MemoryRouter initialEntries={['/empty-id']}>
        <PageNavigation navigation={navigation} />
      </MemoryRouter>
    );

    expect(screen.getByTestId('empty-id-item')).toBeInTheDocument();
  });
});
