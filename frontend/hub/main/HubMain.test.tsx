import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import HubMain from './HubMain';

vi.mock('@ansible/ansible-ui-framework', () => ({
  PageFramework: (props: Record<string, unknown>) => (
    <div data-testid="page-framework">{props.children as React.ReactNode}</div>
  ),
}));
vi.mock('@ansible/common-ui/i18n', () => ({}));
vi.mock('./HubApp', () => ({
  HubApp: () => <div data-testid="hub-app" />,
}));

describe('HubMain', () => {
  it('should render PageFramework with HubApp', () => {
    const { getByTestId } = render(<HubMain />);
    expect(getByTestId('page-framework')).toBeInTheDocument();
  });
});
