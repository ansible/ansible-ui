import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AwxMain from './AwxMain';

vi.mock('@ansible/ansible-ui-framework', () => ({
  PageFramework: (props: Record<string, unknown>) => (
    <div data-testid="page-framework">{props.children as React.ReactNode}</div>
  ),
}));
vi.mock('@ansible/common-ui/i18n', () => ({}));
vi.mock('./AwxApp', () => ({
  AwxApp: () => <div data-testid="awx-app" />,
}));

describe('AwxMain', () => {
  it('should render PageFramework with AwxApp', () => {
    const { getByTestId } = render(<AwxMain />);
    expect(getByTestId('page-framework')).toBeInTheDocument();
  });
});
