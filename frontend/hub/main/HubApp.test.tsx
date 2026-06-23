import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { HubApp } from './HubApp';

vi.mock('@ansible/ansible-ui-framework', () => ({
  PageApp: (props: Record<string, unknown>) => (
    <div data-testid="page-app" data-refresh-interval={props.defaultRefreshInterval} />
  ),
}));
vi.mock('./useHubNavigation', () => ({
  useHubNavigation: () => [],
}));

describe('HubApp', () => {
  it('should configure PageApp with a 30 second refresh interval', () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <HubApp />
      </MemoryRouter>
    );
    expect(getByTestId('page-app').dataset.refreshInterval).toBe('30');
  });
});
