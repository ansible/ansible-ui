import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  getHelpButtonForOptionCheckbox,
  jobTemplateOptionCheckboxTestIds,
} from './jobTemplateOptionsTestHelpers';

describe('jobTemplateOptionsTestHelpers', () => {
  it('should export all job template option checkbox test ids', () => {
    expect(jobTemplateOptionCheckboxTestIds).toEqual([
      'become_enabled',
      'isProvisioningCallbackEnabled',
      'isWebhookEnabled',
      'allow_simultaneous',
      'use_fact_cache',
      'prevent_instance_group_fallback',
    ]);
  });

  it('should find help button within a PatternFly checkbox root', () => {
    render(
      <div className="pf-v6-c-check">
        <input data-testid="become_enabled" type="checkbox" readOnly />
        <button type="button">Help</button>
      </div>
    );

    expect(getHelpButtonForOptionCheckbox('become_enabled')).toHaveTextContent('Help');
  });

  it('should fall back to parent element when pf-v6-c-check is absent', () => {
    render(
      <div>
        <input data-testid="become_enabled" type="checkbox" readOnly />
        <button type="button">Help</button>
      </div>
    );

    expect(getHelpButtonForOptionCheckbox('become_enabled')).toHaveTextContent('Help');
  });

  it('should return null when no help button exists', () => {
    render(<input data-testid="become_enabled" type="checkbox" readOnly />);

    expect(getHelpButtonForOptionCheckbox('become_enabled')).toBeNull();
  });
});
