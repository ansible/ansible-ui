// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  getStatusDecoratorIcon,
  TOPOLOGY_NODE_DECORATOR_STATUS_CLASS,
} from './workflowOutputStatusDecoratorIcon';

describe('getStatusDecoratorIcon', () => {
  const centerPoint = { x: 10, y: 10 };

  // PF6 topology sets decorator SVG fill from CSS variables keyed off these modifier classes.
  it.each([
    ['successful', 'successful-icon', 'pf-m-success'],
    ['success', 'successful-icon', 'pf-m-success'],
    ['failed', 'failed-icon', 'pf-m-danger'],
    ['fail', 'failed-icon', 'pf-m-danger'],
    ['error', 'failed-icon', 'pf-m-danger'],
    ['canceled', 'canceled-icon', 'pf-m-warning'],
    ['running', 'running-icon', 'pf-m-info'],
    ['pending', 'pending-icon', 'pf-m-info'],
    ['waiting', 'pending-icon', 'pf-m-info'],
  ] as const)(
    'should render %s status with topology wrapper and modifier',
    (status, testId, modifierClass) => {
      const { container } = render(getStatusDecoratorIcon(status, centerPoint));
      expect(container.querySelector(`.${TOPOLOGY_NODE_DECORATOR_STATUS_CLASS}`)).toBeTruthy();
      expect(container.querySelector(`.${modifierClass}`)).toBeTruthy();
      expect(screen.getByTestId(testId)).toBeInTheDocument();
    }
  );

  it('should return null for unknown status', () => {
    expect(getStatusDecoratorIcon('unknown', centerPoint)).toBeNull();
  });
});
