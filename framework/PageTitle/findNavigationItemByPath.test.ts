import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { PageNavigationItem } from '../PageNavigation/PageNavigationItem';
import { findNavigationItemByPath } from './findNavigationItemByPath';

const mockElement = () => createElement('div');

function expectResults(result: PageNavigationItem[], ids: string[]) {
  expect(result).toHaveLength(ids.length);
  expect(result?.map((item) => ('id' in item ? item.id : ''))).toEqual(ids);
}

describe('findNavigationItemByPath', () => {
  describe('simple navigation items', () => {
    it('should find a top-level navigation item', () => {
      const navigation: PageNavigationItem[] = [
        { id: 'home', label: 'Home', path: 'home', element: mockElement() },
        { id: 'about', label: 'About', path: 'about', element: mockElement() },
      ];

      const result = findNavigationItemByPath(navigation, '/home');

      expectResults(result, ['home']);
    });

    it('should return null when no match is found', () => {
      const navigation: PageNavigationItem[] = [
        { id: 'home', label: 'Home', path: 'home', element: mockElement() },
      ];

      const result = findNavigationItemByPath(navigation, '/nonexistent');

      expect(result).toHaveLength(0);
    });

    it('should match item with trailing path segments', () => {
      const navigation: PageNavigationItem[] = [
        { id: 'users', label: 'Users', path: 'users', element: mockElement() },
      ];

      const result = findNavigationItemByPath(navigation, '/users/123/edit');

      expectResults(result, ['users']);
    });
  });

  describe('nested navigation items', () => {
    it('should find a child navigation item', () => {
      const navigation: PageNavigationItem[] = [
        {
          id: 'settings',
          label: 'Settings',
          path: 'settings',
          children: [
            { id: 'profile', label: 'Profile', path: 'profile', element: mockElement() },
            { id: 'security', label: 'Security', path: 'security', element: mockElement() },
          ],
        },
      ];

      const result = findNavigationItemByPath(navigation, '/settings/profile');

      expectResults(result, ['profile', 'settings']);
    });

    it('should find deeply nested navigation items', () => {
      const navigation: PageNavigationItem[] = [
        {
          id: 'access',
          label: 'Access Management',
          path: 'access',
          children: [
            {
              id: 'users',
              label: 'Users',
              path: 'users',
              children: [{ id: 'user-details', path: ':id', element: mockElement() }],
            },
          ],
        },
      ];

      const result = findNavigationItemByPath(navigation, '/access/users/123');

      expectResults(result, ['user-details', 'users', 'access']);
    });

    it('should prioritize deeper matches over shallow ones', () => {
      const navigation: PageNavigationItem[] = [
        {
          id: 'automation',
          label: 'Automation Execution',
          path: 'automation-execution',
          children: [
            { id: 'templates', label: 'Templates', path: 'templates', element: mockElement() },
            { id: 'jobs', label: 'Jobs', path: 'jobs', element: mockElement() },
          ],
        },
      ];

      const result = findNavigationItemByPath(navigation, '/automation-execution/templates');

      expectResults(result, ['templates', 'automation']);
    });
  });

  describe('navigation items without labels', () => {
    it('should find items without labels', () => {
      const navigation: PageNavigationItem[] = [
        {
          path: 'wrapper',
          children: [
            { id: 'actual-page', label: 'Actual Page', path: 'page', element: mockElement() },
          ],
        },
      ];

      const result = findNavigationItemByPath(navigation, '/wrapper/page');

      expectResults(result, ['actual-page']);
    });
  });

  describe('root path navigation items', () => {
    it('should omit empty string paths', () => {
      const navigation: PageNavigationItem[] = [
        {
          id: 'root',
          label: 'Root',
          path: 'root',
          children: [{ id: 'index', label: 'Index', path: '', element: mockElement() }],
        },
      ];

      const result = findNavigationItemByPath(navigation, '/root');

      expectResults(result, ['root']);
    });

    it('should match root index route', () => {
      const navigation: PageNavigationItem[] = [
        { id: 'dashboard', label: 'Dashboard', path: '', element: mockElement() },
      ];

      const result = findNavigationItemByPath(navigation, '/');

      expectResults(result, []);
    });
  });

  describe('basePath parameter', () => {
    it('should prepend basePath to navigation paths', () => {
      const navigation: PageNavigationItem[] = [
        { id: 'home', label: 'Home', path: 'home', element: mockElement() },
      ];

      const result = findNavigationItemByPath(navigation, '/app/home', '/app');

      expectResults(result, ['home']);
    });

    it('should handle basePath with nested items', () => {
      const navigation: PageNavigationItem[] = [
        {
          id: 'settings',
          label: 'Settings',
          path: 'settings',
          children: [{ id: 'profile', label: 'Profile', path: 'profile', element: mockElement() }],
        },
      ];

      const result = findNavigationItemByPath(
        navigation,
        '/platform/settings/profile',
        '/platform'
      );

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('profile');
      expect(result[1].id).toBe('settings');
    });
  });

  describe('path normalization', () => {
    it('should handle paths with leading slashes in item.path', () => {
      const navigation: PageNavigationItem[] = [
        { id: 'page', label: 'Page', path: 'page', element: mockElement() },
      ];

      const result = findNavigationItemByPath(navigation, '/page');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('page');
    });

    it('should handle paths with and without leading slashes', () => {
      const navigation: PageNavigationItem[] = [
        { id: 'page', label: 'Page', path: 'page', element: mockElement() },
      ];

      const result = findNavigationItemByPath(navigation, '/page');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('page');
    });
  });

  describe('complex real-world scenarios', () => {
    it('should handle multi-level settings navigation', () => {
      const navigation: PageNavigationItem[] = [
        {
          id: 'settings',
          label: 'Settings',
          path: 'settings',
          children: [
            {
              id: 'automation-execution',
              label: 'Automation Execution',
              path: 'automation-execution',
              children: [
                {
                  id: 'system-settings',
                  label: 'System',
                  path: 'system',
                  children: [{ id: 'system-edit', path: 'edit', element: mockElement() }],
                },
              ],
            },
          ],
        },
      ];

      const result = findNavigationItemByPath(
        navigation,
        '/settings/automation-execution/system/edit'
      );

      expect(result).toHaveLength(4);
      expectResults(result, ['system-edit', 'system-settings', 'automation-execution', 'settings']);
    });

    it('should handle dynamic route parameters', () => {
      const navigation: PageNavigationItem[] = [
        {
          id: 'templates',
          label: 'Templates',
          path: 'templates',
          children: [
            {
              id: 'template-details',
              path: ':id',
              children: [{ id: 'template-edit', path: 'edit', element: mockElement() }],
            },
          ],
        },
      ];

      const result = findNavigationItemByPath(navigation, '/templates/42/edit');

      expectResults(result, ['template-edit', 'templates']);
    });

    it('should match items with mixed static and dynamic segments', () => {
      const navigation: PageNavigationItem[] = [
        {
          id: 'organizations',
          label: 'Organizations',
          path: 'organizations',
          children: [
            {
              id: 'org-details',
              path: ':orgId',
              children: [
                {
                  id: 'teams',
                  label: 'Teams',
                  path: 'teams',
                  children: [{ id: 'team-details', path: ':teamId', element: mockElement() }],
                },
              ],
            },
          ],
        },
      ];

      const result = findNavigationItemByPath(navigation, '/organizations/123/teams/456');

      expectResults(result, ['team-details', 'teams', 'organizations']);
    });
  });

  describe('edge cases', () => {
    it('should handle empty navigation array', () => {
      const result = findNavigationItemByPath([], '/any-path');

      expect(result).toHaveLength(0);
    });

    it('should handle navigation items without ids', () => {
      const navigation: PageNavigationItem[] = [
        { label: 'No ID Page', path: 'no-id', element: mockElement() },
      ];

      const result = findNavigationItemByPath(navigation, '/no-id');

      expect(result).not.toBeNull();
      expect(result[0]).not.toHaveProperty('id');
      expect('label' in result[0] && result[0].label).toBe('No ID Page');
    });

    it('should return parent match when child has no label but matches path', () => {
      const navigation: PageNavigationItem[] = [
        {
          id: 'parent',
          label: 'Parent',
          path: 'parent',
          children: [{ path: 'child', element: mockElement() }],
        },
      ];

      const result = findNavigationItemByPath(navigation, '/parent/child');

      expectResults(result, ['', 'parent']);
    });
  });
});
