import { PageNavigationItem } from '@ansible/ansible-ui-framework';
import { describe, expect, test } from 'vitest';
import {
  collectPageNavigationRouteIds,
  collectPageNavigationRoutes,
} from './collectPageNavigationRoutes';

describe('collectPageNavigationRoutes', () => {
  test('should flatten nested navigation children', () => {
    const navigation: PageNavigationItem = {
      id: 'parent',
      path: 'parent',
      children: [
        { id: 'child-a', path: 'a', element: <></> },
        {
          id: 'child-b',
          path: 'b',
          children: [{ id: 'grandchild', path: 'c', element: <></> }],
        },
      ],
    };

    expect(collectPageNavigationRoutes(navigation)).toEqual([
      { id: 'parent', path: 'parent' },
      { id: 'child-a', path: 'a' },
      { id: 'child-b', path: 'b' },
      { id: 'grandchild', path: 'c' },
    ]);
  });

  test('should collect route ids from an array root', () => {
    const navigation: PageNavigationItem[] = [
      { id: 'one', path: 'one', element: <></> },
      { id: 'two', path: 'two', element: <></> },
    ];

    expect(collectPageNavigationRouteIds(navigation)).toEqual(['one', 'two']);
  });
});
