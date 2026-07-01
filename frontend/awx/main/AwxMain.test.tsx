import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AwxMain from './AwxMain';

vi.mock('@ansible/ansible-ui-framework', () => ({
  PageFramework: (props: Record<string, unknown>) => (
    <div data-testid="page-framework" data-refresh-interval={props.defaultRefreshInterval} />
  ),
}));
vi.mock('@ansible/common-ui/i18n', () => ({}));
vi.mock('./AwxApp', () => ({
  AwxApp: () => <div data-testid="awx-app" />,
}));

describe('AwxMain', () => {
  it('should configure PageFramework with a 30 second refresh interval', () => {
    const { getByTestId } = render(<AwxMain />);
    expect(getByTestId('page-framework').dataset.refreshInterval).toBe('30');
  });
});
