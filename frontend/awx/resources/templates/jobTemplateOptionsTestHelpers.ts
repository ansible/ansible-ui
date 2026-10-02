import { screen } from '@testing-library/react';

export const jobTemplateOptionCheckboxTestIds = [
  'become_enabled',
  'isProvisioningCallbackEnabled',
  'isWebhookEnabled',
  'allow_simultaneous',
  'use_fact_cache',
  'prevent_instance_group_fallback',
];

export function getHelpButtonForOptionCheckbox(testId: string) {
  const checkbox = screen.getByTestId(testId);
  const checkboxRoot = checkbox.closest('.pf-v6-c-check') ?? checkbox.parentElement;
  return checkboxRoot?.querySelector('button[type="button"]');
}
