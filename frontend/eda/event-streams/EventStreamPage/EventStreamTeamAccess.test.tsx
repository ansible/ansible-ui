import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { EdaRoute } from '../../main/EdaRoutes';

vi.mock('@ansible/common-ui/access/components/PlatformTeamAccess', () => ({
  PlatformTeamAccess: (props: Record<string, string>) => (
    <div>
      <span>{props.id}</span>
      <span>{props.type}</span>
      <span>{props.addRolesRoute}</span>
    </div>
  ),
}));

import { EventStreamTeamAccess } from './EventStreamTeamAccess';

describe('EventStreamTeamAccess', () => {
  it('should pass event stream team-access props to PlatformTeamAccess', () => {
    render(
      <MemoryRouter initialEntries={['/event-streams/22/team-access']}>
        <Routes>
          <Route path="/event-streams/:id/team-access" element={<EventStreamTeamAccess />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('22')).toBeInTheDocument();
    expect(screen.getByText('eda.eventstream')).toBeInTheDocument();
    expect(screen.getByText(EdaRoute.EventStreamAssignTeams)).toBeInTheDocument();
  });
});
