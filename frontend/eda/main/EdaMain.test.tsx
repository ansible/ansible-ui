import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import EdaMain from './EdaMain';

vi.mock('@ansible/ansible-ui-framework', () => ({
  PageFramework: (props: Record<string, unknown>) => (
    <div data-testid="page-framework" data-refresh-interval={props.defaultRefreshInterval} />
  ),
}));
vi.mock('@ansible/common-ui/i18n', () => ({}));
vi.mock('./EdaApp', () => ({
  EdaApp: () => <div data-testid="eda-app" />,
}));

describe('EdaMain', () => {
  it('should configure PageFramework with a 30 second refresh interval', () => {
    const { getByTestId } = render(<EdaMain />);
    expect(getByTestId('page-framework').dataset.refreshInterval).toBe('30');
  });
});
