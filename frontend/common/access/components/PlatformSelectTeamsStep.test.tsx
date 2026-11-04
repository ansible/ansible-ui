import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { PlatformSelectTeamsStep } from './PlatformSelectTeamsStep';

const mockView = {
  pageItems: [{ id: 1, name: 'Team A' }],
  itemCount: 1,
  selectItem: vi.fn(),
  unselectAll: vi.fn(),
};

vi.mock('@ansible/platform-ui/common/usePlatformMultiSelectListView', () => ({
  usePlatformMultiSelectListView: () => mockView,
}));

vi.mock('../hooks/usePlatformTeamFilters', () => ({
  usePlatformTeamFilters: () => [],
}));

vi.mock('@ansible/ansible-ui-framework/PageTable/PageMultiSelectList', () => ({
  PageMultiSelectList: () => <div data-testid="team-multiselect" />,
}));

describe('PlatformSelectTeamsStep', () => {
  it('should render default team selection description', () => {
    render(
      <MemoryRouter>
        <PlatformSelectTeamsStep />
      </MemoryRouter>
    );

    expect(screen.getByText('Select team(s)')).toBeInTheDocument();
    expect(
      screen.getByText('Select the team(s) that you want to apply new roles to.')
    ).toBeInTheDocument();
    expect(screen.getByTestId('team-multiselect')).toBeInTheDocument();
  });

  it('should render custom description when provided', () => {
    render(
      <MemoryRouter>
        <PlatformSelectTeamsStep descriptionForTeamsSelection="Pick teams for this workflow." />
      </MemoryRouter>
    );

    expect(screen.getByText('Pick teams for this workflow.')).toBeInTheDocument();
  });
});
