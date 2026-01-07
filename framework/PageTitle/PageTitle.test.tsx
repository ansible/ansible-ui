/* eslint-disable i18next/no-literal-string */
import { render, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { PageNavigationItem } from '../PageNavigation/PageNavigationItem';
import { PageTitleProvider, usePageTitle } from './PageTitle';

const mockElement = () => createElement('div');

describe('PageTitle', () => {
  describe('Title rendering', () => {
    it('should render title with navigation item label', () => {
      const navigation: PageNavigationItem[] = [
        { id: 'home', label: 'Home', path: 'home', element: mockElement() },
      ];

      render(
        <MemoryRouter initialEntries={['/home']}>
          <PageTitleProvider navigation={navigation}>
            <div>Content</div>
          </PageTitleProvider>
        </MemoryRouter>
      );

      const titleElement = document.querySelector('title');
      expect(titleElement?.textContent).toBe('Home | Ansible Automation Platform');
    });

    it('should render title with nested navigation items', () => {
      const navigation: PageNavigationItem[] = [
        {
          id: 'settings',
          label: 'Settings',
          path: 'settings',
          children: [
            {
              id: 'profile',
              label: 'Profile',
              path: 'profile',
              element: mockElement(),
            },
          ],
        },
      ];

      render(
        <MemoryRouter initialEntries={['/settings/profile']}>
          <PageTitleProvider navigation={navigation}>
            <div>Content</div>
          </PageTitleProvider>
        </MemoryRouter>
      );

      const titleElement = document.querySelector('title');
      expect(titleElement?.textContent).toBe('Profile - Settings | Ansible Automation Platform');
    });
  });

  describe('usePageTitle hook', () => {
    it('should override first navigation label with custom title', async () => {
      const navigation: PageNavigationItem[] = [
        {
          id: 'inventories',
          label: 'Inventories',
          path: 'inventories',
          children: [
            {
              id: 'inventory-details',
              path: ':id',
              element: mockElement(),
            },
          ],
        },
      ];

      function TestComponent() {
        usePageTitle('My Custom Inventory');
        return <div>Content</div>;
      }

      render(
        <MemoryRouter initialEntries={['/inventories/123']}>
          <PageTitleProvider navigation={navigation}>
            <TestComponent />
          </PageTitleProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        const titleElement = document.querySelector('title');
        expect(titleElement?.textContent).toBe(
          'My Custom Inventory - Inventories | Ansible Automation Platform'
        );
      });
    });

    it('should handle null title', () => {
      const navigation: PageNavigationItem[] = [
        { id: 'home', label: 'Home', path: 'home', element: mockElement() },
      ];

      function TestComponent() {
        usePageTitle(null);
        return <div>Content</div>;
      }

      render(
        <MemoryRouter initialEntries={['/home']}>
          <PageTitleProvider navigation={navigation}>
            <TestComponent />
          </PageTitleProvider>
        </MemoryRouter>
      );

      const titleElement = document.querySelector('title');
      expect(titleElement?.textContent).toBe('Home | Ansible Automation Platform');
    });

    it('should handle undefined title', () => {
      const navigation: PageNavigationItem[] = [
        { id: 'home', label: 'Home', path: 'home', element: mockElement() },
      ];

      function TestComponent() {
        usePageTitle(undefined);
        return <div>Content</div>;
      }

      render(
        <MemoryRouter initialEntries={['/home']}>
          <PageTitleProvider navigation={navigation}>
            <TestComponent />
          </PageTitleProvider>
        </MemoryRouter>
      );

      const titleElement = document.querySelector('title');
      expect(titleElement?.textContent).toBe('Home | Ansible Automation Platform');
    });

    it('should use custom title when first item has no label', async () => {
      const navigation: PageNavigationItem[] = [
        {
          id: 'inventories',
          label: 'Inventories',
          path: 'inventories',
          children: [
            {
              id: 'inventory-details',
              path: ':id',
              element: mockElement(),
            },
          ],
        },
      ];

      function TestComponent() {
        usePageTitle('Inventory #123');
        return <div>Content</div>;
      }

      render(
        <MemoryRouter initialEntries={['/inventories/123']}>
          <PageTitleProvider navigation={navigation}>
            <TestComponent />
          </PageTitleProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        const titleElement = document.querySelector('title');
        expect(titleElement?.textContent).toBe(
          'Inventory #123 - Inventories | Ansible Automation Platform'
        );
      });
    });
  });

  describe('no navigation match', () => {
    it('should render only platform name when path does not match', () => {
      const navigation: PageNavigationItem[] = [
        { id: 'home', label: 'Home', path: 'home', element: mockElement() },
      ];

      render(
        <MemoryRouter initialEntries={['/nonexistent']}>
          <PageTitleProvider navigation={navigation}>
            <div>Content</div>
          </PageTitleProvider>
        </MemoryRouter>
      );

      const titleElement = document.querySelector('title');
      expect(titleElement?.textContent).toBe(' | Ansible Automation Platform');
    });
  });
});
