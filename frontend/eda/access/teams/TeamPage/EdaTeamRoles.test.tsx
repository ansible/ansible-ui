/* eslint-disable i18next/no-literal-string */
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { EdaTeamRoles } from './EdaTeamRoles';

describe('EdaTeamRoles', () => {
  it('should render without error when provided an explicit id', () => {
    const { container } = render(
      <MemoryRouter>
        <EdaTeamRoles id="10" />
      </MemoryRouter>
    );

    expect(container).toBeDefined();
  });

  it('should render without error when id comes from route params', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/teams/10/roles']}>
        <Routes>
          <Route path="/teams/:id/roles" element={<EdaTeamRoles />} />
        </Routes>
      </MemoryRouter>
    );

    expect(container).toBeDefined();
  });

  it('should accept a custom addRolesRoute prop', () => {
    const { container } = render(
      <MemoryRouter>
        <EdaTeamRoles id="10" addRolesRoute="custom-route" />
      </MemoryRouter>
    );

    expect(container).toBeDefined();
  });
});
