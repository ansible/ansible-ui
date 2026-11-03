/* eslint-disable i18next/no-literal-string */
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

import { DecisionEnvironmentTeamAccess } from './DecisionEnvironmentTeamAccess';

describe('DecisionEnvironmentTeamAccess', () => {
  it('should pass decision environment team-access props to PlatformTeamAccess', () => {
    render(
      <MemoryRouter initialEntries={['/decision-environments/8/team-access']}>
        <Routes>
          <Route
            path="/decision-environments/:id/team-access"
            element={<DecisionEnvironmentTeamAccess />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('eda.decisionenvironment')).toBeInTheDocument();
    expect(screen.getByText(EdaRoute.DecisionEnvironmentAssignTeams)).toBeInTheDocument();
  });
});
