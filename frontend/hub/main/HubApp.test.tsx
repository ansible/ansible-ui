import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { HubApp } from './HubApp';

vi.mock('@ansible/ansible-ui-framework', () => ({
  PageApp: (props: Record<string, unknown>) => (
    <div data-testid="page-app">{props.children as React.ReactNode}</div>
  ),
}));
vi.mock('./useHubNavigation', () => ({
  useHubNavigation: () => [],
}));

describe('HubApp', () => {
  it('should render PageApp', () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <HubApp />
      </MemoryRouter>
    );
    expect(getByTestId('page-app')).toBeInTheDocument();
  });
});
