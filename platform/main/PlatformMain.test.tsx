import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import PlatformMain from './PlatformMain';

vi.mock('@ansible/ansible-ui-framework', () => ({
  PageFramework: (props: Record<string, unknown>) => (
    <div data-testid="page-framework" data-refresh-interval={props.defaultRefreshInterval} />
  ),
}));
vi.mock('@ansible/common-ui/i18n', () => ({}));
vi.mock('./PlatformApp', () => ({
  PlatformApp: () => <div data-testid="platform-app" />,
}));

describe('PlatformMain', () => {
  it('should configure PageFramework with a 30 second refresh interval', () => {
    const { getByTestId } = render(<PlatformMain />);
    expect(getByTestId('page-framework').dataset.refreshInterval).toBe('30');
  });
});
