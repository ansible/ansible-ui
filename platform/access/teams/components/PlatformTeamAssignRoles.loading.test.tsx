import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { PlatformTeamAssignRoles } from './PlatformTeamAssignRoles';

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: () => ({ data: undefined, isLoading: true }),
}));

describe('PlatformTeamAssignRoles loading', () => {
  it('shows loading while team is fetched', () => {
    render(
      <MemoryRouter initialEntries={['/access/teams/1/roles/assign']}>
        <Routes>
          <Route path="/access/teams/:id/roles/assign" element={<PlatformTeamAssignRoles />} />
        </Routes>
      </MemoryRouter>
    );

    expect(document.querySelector('.pf-v6-c-spinner')).toBeTruthy();
  });
});
