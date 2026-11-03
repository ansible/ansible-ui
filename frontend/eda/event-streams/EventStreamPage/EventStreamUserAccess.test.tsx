/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { EdaRoute } from '../../main/EdaRoutes';

vi.mock('@ansible/common-ui/access/components/ResourceUserAccess', () => ({
  ResourceUserAccess: (props: Record<string, string>) => (
    <div>
      <span>{props.service}</span>
      <span>{props.id}</span>
      <span>{props.type}</span>
      <span>{props.addRolesRoute}</span>
      <span>{props.manageRoleRoute}</span>
    </div>
  ),
}));

import { EventStreamUserAccess } from './EventStreamUserAccess';

describe('EventStreamUserAccess', () => {
  it('should pass event stream user-access props to ResourceUserAccess', () => {
    render(
      <MemoryRouter initialEntries={['/event-streams/22/user-access']}>
        <Routes>
          <Route path="/event-streams/:id/user-access" element={<EventStreamUserAccess />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('eda')).toBeInTheDocument();
    expect(screen.getByText('22')).toBeInTheDocument();
    expect(screen.getByText('eda.eventstream')).toBeInTheDocument();
    expect(screen.getByText(EdaRoute.EventStreamAddUsers)).toBeInTheDocument();
    expect(screen.getByText(EdaRoute.EventStreamManageUsers)).toBeInTheDocument();
  });
});
