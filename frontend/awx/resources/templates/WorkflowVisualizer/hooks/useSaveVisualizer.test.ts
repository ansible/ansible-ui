import { describe, expect, test, vi } from 'vitest';

vi.mock('@patternfly/react-topology', () => ({
  Edge: {},
  EdgeModel: {},
  ElementModel: {},
  GraphElement: {},
  Node: {},
  NodeModel: {},
  NodeStatus: { danger: 'danger', success: 'success', info: 'info', default: 'default' },
  WithSelectionProps: {},
  useVisualizationController: vi.fn(() => ({
    getState: () => ({}),
    setState: () => {},
    getGraph: () => ({ getNodes: () => [], layout: () => {} }),
    getElements: () => [],
  })),
  action: vi.fn((fn: () => void) => fn),
  observer: (component: unknown) => component,
  TopologySideBar: () => null,
  NodeShape: { circle: 'circle' },
  EdgeTerminalType: { directional: 'directional' },
}));

const { toKeyedObject } = await import('./useSaveVisualizer');

describe('toKeyedObject', () => {
  test('should return keyed object for non-empty string value', () => {
    expect(toKeyedObject('identifier', 'my-node')).toEqual({ identifier: 'my-node' });
  });

  test('should return keyed object for numeric value', () => {
    expect(toKeyedObject('timeout', 30)).toEqual({ timeout: 30 });
  });

  test('should return keyed object for number 0', () => {
    expect(toKeyedObject('forks', 0)).toEqual({ forks: 0 });
  });

  test('should return empty object for empty string value', () => {
    expect(toKeyedObject('identifier', '')).toEqual({});
  });

  test('should return empty object for undefined value', () => {
    expect(toKeyedObject('identifier', undefined)).toEqual({});
  });

  test('should return empty object for null value', () => {
    expect(toKeyedObject('identifier', null)).toEqual({});
  });

  test('should use the provided key in the returned object', () => {
    const result = toKeyedObject('my_custom_key', 'value');
    expect(result).toHaveProperty('my_custom_key', 'value');
  });
});
