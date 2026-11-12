import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { PlatformAwxOrganizationExecutionEnvironments } from './PlatformAwxOrganizationExecutionEnvironments';

vi.mock('@ansible/awx-ui/administration/execution-environments/ExecutionEnvironmentsList', () => ({
  ExecutionEnvironmentsList: (props: { url: string; hideOrgColumn: boolean }) => (
    <div
      data-testid="ee-list"
      data-url={props.url}
      data-hide-org={props.hideOrgColumn ? 'true' : 'false'}
    />
  ),
}));

describe('PlatformAwxOrganizationExecutionEnvironments', () => {
  it('passes organization execution environments URL and hides org column', () => {
    render(<PlatformAwxOrganizationExecutionEnvironments id="7" />);
    const list = screen.getByTestId('ee-list');
    expect(list).toHaveAttribute('data-url', awxAPI`/organizations/7/execution_environments/`);
    expect(list).toHaveAttribute('data-hide-org', 'true');
  });

  it('uses empty id segment when id is missing', () => {
    render(<PlatformAwxOrganizationExecutionEnvironments />);
    expect(screen.getByTestId('ee-list')).toHaveAttribute(
      'data-url',
      awxAPI`/organizations//execution_environments/`
    );
  });
});
