// @vitest-environment happy-dom
import { render } from '@testing-library/react';
import { CheckCircleIcon } from '@patternfly/react-icons';
import { describe, expect, it } from 'vitest';
import {
  TOPOLOGY_NODE_DECORATOR_STATUS_CLASS,
  topologyDecoratorStatusColorStyle,
  wrapTopologyDecoratorStatusIcon,
} from './topologyDecoratorStatus';

describe('topologyDecoratorStatus', () => {
  it('should wrap icons in the topology decorator status group', () => {
    const { container } = render(
      wrapTopologyDecoratorStatusIcon(<CheckCircleIcon className="pf-m-success" />)
    );
    expect(container.querySelector(`.${TOPOLOGY_NODE_DECORATOR_STATUS_CLASS}`)).toBeTruthy();
    expect(container.querySelector('.pf-m-success')).toBeTruthy();
  });

  it('should expose the decorator color CSS variable helper', () => {
    expect(topologyDecoratorStatusColorStyle('var(--pf-t--global--icon--color--disabled)')).toEqual(
      {
        '--pf-topology__node_decorator--Color': 'var(--pf-t--global--icon--color--disabled)',
      }
    );
  });
});
