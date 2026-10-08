// @vitest-environment happy-dom
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TOPOLOGY_NODE_DECORATOR_STATUS_CLASS } from '../../../common/topologyDecoratorStatus';
import { getMeshNodeStatusDecoratorIcon } from './meshNodeStatusDecoratorIcon';

describe('getMeshNodeStatusDecoratorIcon', () => {
  it.each([
    ['ready', 'pf-m-success'],
    ['installed', 'pf-m-info'],
    ['unavailable', 'pf-m-danger'],
    ['deprovision-fail', 'pf-m-danger'],
    ['provision-fail', 'pf-m-danger'],
  ] as const)('should apply %s status modifier %s', (status, modifierClass) => {
    const { container } = render(getMeshNodeStatusDecoratorIcon(status));
    expect(container.querySelector(`.${TOPOLOGY_NODE_DECORATOR_STATUS_CLASS}`)).toBeTruthy();
    expect(container.querySelector(`.${modifierClass}`)).toBeTruthy();
  });

  it.each(['provisioning', 'deprovisioning', 'unknown-status'] as const)(
    'should wrap %s status with topology decorator status group',
    (status) => {
      const { container } = render(getMeshNodeStatusDecoratorIcon(status));
      expect(container.querySelector(`.${TOPOLOGY_NODE_DECORATOR_STATUS_CLASS}`)).toBeTruthy();
    }
  );
});
