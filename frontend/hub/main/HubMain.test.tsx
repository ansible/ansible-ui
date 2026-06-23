import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import HubMain from './HubMain';

vi.mock('@ansible/ansible-ui-framework', () => ({
  PageFramework: (props: Record<string, unknown>) => (
    <div data-testid="page-framework" data-refresh-interval={props.defaultRefreshInterval} />
  ),
}));
vi.mock('@ansible/common-ui/i18n', () => ({}));
vi.mock('./HubApp', () => ({
  HubApp: () => <div data-testid="hub-app" />,
}));

describe('HubMain', () => {
  it('should configure PageFramework with a 30 second refresh interval', () => {
    const { getByTestId } = render(<HubMain />);
    expect(getByTestId('page-framework').dataset.refreshInterval).toBe('30');
  });
});
