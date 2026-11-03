import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { PageNavigationItem } from '@ansible/ansible-ui-framework/PageNavigation/PageNavigationItem';
import { EdaRoute } from '../EdaRoutes';
import { useEdaOrganizationRoutes } from './useEdaOrganizationsRoutes';

function hasChildren(
  item: PageNavigationItem
): item is PageNavigationItem & { children: PageNavigationItem[] } {
  return 'children' in item && Array.isArray(item.children);
}

describe('useEdaOrganizationRoutes', () => {
  it('should return the Organizations navigation group with create, edit, details, and list routes', () => {
    const { result } = renderHook(() => useEdaOrganizationRoutes(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    expect(result.current.id).toBe(EdaRoute.Organizations);
    expect(result.current.path).toBe('organizations');
    expect(result.current.label).toBe('Organizations');
    expect(hasChildren(result.current)).toBe(true);

    if (hasChildren(result.current)) {
      const childIds = result.current.children.map((child) => child.id);
      expect(childIds).toContain(EdaRoute.CreateOrganization);
      expect(childIds).toContain(EdaRoute.EditOrganization);
      expect(childIds).toContain(EdaRoute.OrganizationPage);

      const create = result.current.children.find(
        (child) => child.id === EdaRoute.CreateOrganization
      );
      const edit = result.current.children.find((child) => child.id === EdaRoute.EditOrganization);
      const page = result.current.children.find((child) => child.id === EdaRoute.OrganizationPage);
      expect(create?.path).toBe('create');
      expect(edit?.path).toBe(':id/edit');
      expect(page?.path).toBe(':id');
      expect(page && hasChildren(page)).toBe(true);
      if (page && hasChildren(page)) {
        expect(page.children.map((child) => child.id)).toContain(EdaRoute.OrganizationDetails);
      }
    }
  });
});
