// @vitest-environment happy-dom
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  getStatusDecoratorIcon,
  TOPOLOGY_NODE_DECORATOR_STATUS_CLASS,
} from './workflowOutputStatusDecoratorIcon';

describe('getStatusDecoratorIcon', () => {
  const centerPoint = { x: 10, y: 10 };

  it('should apply PF topology status modifier classes for successful jobs', () => {
    const { container } = render(getStatusDecoratorIcon('successful', centerPoint));
    expect(container.querySelector(`.${TOPOLOGY_NODE_DECORATOR_STATUS_CLASS}`)).toBeTruthy();
    expect(container.querySelector('.pf-m-success')).toBeTruthy();
  });

  it('should apply danger modifier for failed jobs', () => {
    const { container } = render(getStatusDecoratorIcon('failed', centerPoint));
    expect(container.querySelector('.pf-m-danger')).toBeTruthy();
  });

  it('should apply warning modifier for canceled jobs', () => {
    const { container } = render(getStatusDecoratorIcon('canceled', centerPoint));
    expect(container.querySelector('.pf-m-warning')).toBeTruthy();
  });

  it('should apply info modifier for running jobs', () => {
    const { container } = render(getStatusDecoratorIcon('running', centerPoint));
    expect(container.querySelector('.pf-m-info')).toBeTruthy();
  });

  it('should return null for unknown status', () => {
    expect(getStatusDecoratorIcon('unknown', centerPoint)).toBeNull();
  });
});
