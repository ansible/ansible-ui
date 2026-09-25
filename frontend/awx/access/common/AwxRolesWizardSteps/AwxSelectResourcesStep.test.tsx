import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AwxSelectResourcesStep } from './AwxSelectResourcesStep';

const usePageWizard = vi.hoisted(() => vi.fn());
const useAwxMultiSelectListView = vi.hoisted(() => vi.fn(() => ({ pageItems: [] })));

vi.mock('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider', () => ({ usePageWizard }));
vi.mock('../../../common/useAwxMultiSelectListView', () => ({ useAwxMultiSelectListView }));
vi.mock('@ansible/ansible-ui-framework/PageTable/PageMultiSelectList', () => ({
  PageMultiSelectList: () => null,
}));

describe('AwxSelectResourcesStep', () => {
  it('uses the selected resource type endpoint', () => {
    usePageWizard.mockReturnValue({ wizardData: { resourceType: 'awx.inventory' } });

    render(<AwxSelectResourcesStep userOrTeamName="Alex" />);

    expect(screen.getByRole('heading', { name: 'Select inventories' })).toBeInTheDocument();
    expect(useAwxMultiSelectListView).toHaveBeenCalledWith(
      expect.objectContaining({ url: expect.stringContaining('/inventories/') }),
      'resources'
    );
  });
});
