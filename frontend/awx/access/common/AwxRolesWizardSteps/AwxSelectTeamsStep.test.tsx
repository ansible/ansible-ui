import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AwxSelectTeamsStep } from './AwxSelectTeamsStep';

const mockView = { selectedItems: [], pageItems: [] };

vi.mock('../../../common/useAwxMultiSelectListView', () => ({
  useAwxMultiSelectListView: () => mockView,
}));

vi.mock('@ansible/ansible-ui-framework/PageTable/PageMultiSelectList', () => ({
  PageMultiSelectList: () => <div data-testid="teams-list" />,
}));

describe('AwxSelectTeamsStep', () => {
  it('renders team selection title and list', () => {
    render(<AwxSelectTeamsStep descriptionForTeamsSelection="Choose teams for the org." />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Select team(s)');
    expect(screen.getByText('Choose teams for the org.')).toBeInTheDocument();
    expect(screen.getByTestId('teams-list')).toBeInTheDocument();
  });
});
