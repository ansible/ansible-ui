import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { EdaRoute } from '../../main/EdaRoutes';

vi.mock('../../../common/access/components/ResourceUserAccess', () => ({
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

import { DecisionEnvironmentUserAccess } from './DecisionEnvironmentUserAccess';

describe('DecisionEnvironmentUserAccess', () => {
  it('should pass decision environment user-access props to ResourceUserAccess', () => {
    render(
      <MemoryRouter initialEntries={['/decision-environments/8/user-access']}>
        <Routes>
          <Route
            path="/decision-environments/:id/user-access"
            element={<DecisionEnvironmentUserAccess />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('eda')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('eda.decisionenvironment')).toBeInTheDocument();
    expect(screen.getByText(EdaRoute.DecisionEnvironmentAddUsers)).toBeInTheDocument();
    expect(screen.getByText(EdaRoute.DecisionEnvironmentManageUsers)).toBeInTheDocument();
  });
});
