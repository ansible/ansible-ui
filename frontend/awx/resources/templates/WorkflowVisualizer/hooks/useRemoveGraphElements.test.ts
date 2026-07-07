import { renderHook } from '@testing-library/react';
import { type ReactElement } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { START_NODE_ID } from '../constants';
import { EdgeStatus } from '../types';

interface BulkActionOptions {
  keyFn: (item: { getId: () => string }) => string;
  title: string;
  items: unknown[];
  confirmText: string;
  actionButtonText: string;
  isDanger: boolean;
  confirmationColumns: { header: string; cell: (item: unknown) => ReactElement | null }[];
  actionColumns: { header: string; cell: (item: unknown) => ReactElement | null }[];
  actionFn: () => Promise<void>;
}

let capturedBulkOptions: BulkActionOptions | undefined;
const mockBulkAction = vi.fn((options: BulkActionOptions) => {
  capturedBulkOptions = options;
});

vi.mock('@ansible/ansible-ui-framework', () => ({
  useBulkConfirmation: vi.fn(() => mockBulkAction),
  TextCell: vi.fn(({ text }: { text: string }) => text),
}));

const mockRemoveNode = vi.fn();
vi.mock('./useRemoveNode', () => ({
  useRemoveNode: vi.fn(() => mockRemoveNode),
}));

const mockCreateEdge = vi.fn(() => ({
  id: 'reconnect-edge',
  type: 'edge',
  source: START_NODE_ID,
  target: 'target-1',
}));
vi.mock('./useCreateEdge', () => ({
  useCreateEdge: vi.fn(() => mockCreateEdge),
}));

const mockControllerSetState = vi.fn();
const mockLayout = vi.fn();

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
    setState: mockControllerSetState,
    getGraph: () => ({ layout: mockLayout }),
  })),
  action: vi.fn((fn: (...args: unknown[]) => unknown) => fn),
  observer: (component: unknown) => component,
  TopologySideBar: () => null,
  NodeShape: { circle: 'circle' },
  EdgeTerminalType: { directional: 'directional' },
}));

const { useRemoveGraphElements } = await import('./useRemoveGraphElements');

function makeNode(overrides: { name?: string; identifier?: string; id?: string } = {}) {
  const { name = 'Demo Template', identifier = 'node-1', id = 'node-1' } = overrides;
  return {
    getId: () => id,
    getData: () => ({
      resource: {
        identifier,
        summary_fields: {
          unified_job_template: { name },
        },
      },
    }),
    getLabel: () => name,
  } as never;
}

function makeDeletedNode(id = 'deleted-1') {
  return {
    getId: () => id,
    getData: () => ({}),
    getLabel: () => '',
  } as never;
}

function makeEdge(
  overrides: {
    visibleTargetEdges?: boolean;
    tag?: string;
    tagStatus?: string;
    sourceLabel?: string;
    targetLabel?: string;
    targetId?: string;
    noData?: boolean;
  } = {}
) {
  const {
    visibleTargetEdges = false,
    tag = 'Run on success',
    tagStatus = 'success',
    sourceLabel = 'Source Node',
    targetLabel = 'Target Node',
    targetId = 'target-1',
    noData = false,
  } = overrides;

  const setVisible = vi.fn();
  const sourceSetState = vi.fn();
  const targetSetState = vi.fn();
  const sourceSetNodeStatus = vi.fn();
  const targetSetNodeStatus = vi.fn();
  const edgeControllerSetState = vi.fn();
  const edgeLayout = vi.fn();
  const edgeFromModel = vi.fn();
  const modelEdges: unknown[] = [];

  const edge = {
    getId: () => 'edge-1',
    setVisible,
    getSource: () => ({
      getId: () => 'source-1',
      getLabel: () => sourceLabel,
      setState: sourceSetState,
      setNodeStatus: sourceSetNodeStatus,
    }),
    getTarget: () => ({
      getId: () => targetId,
      getLabel: () => targetLabel,
      setState: targetSetState,
      setNodeStatus: targetSetNodeStatus,
      getTargetEdges: () => (visibleTargetEdges ? [{ isVisible: () => true }] : []),
    }),
    getData: () => (noData ? undefined : { tag, tagStatus }),
    getController: () => ({
      getState: () => ({}),
      setState: edgeControllerSetState,
      toModel: () => ({ edges: modelEdges }),
      fromModel: edgeFromModel,
      getGraph: () => ({ layout: edgeLayout }),
    }),
  };

  return {
    edge: edge as never,
    mocks: {
      setVisible,
      sourceSetState,
      targetSetState,
      sourceSetNodeStatus,
      targetSetNodeStatus,
      edgeControllerSetState,
      edgeLayout,
      edgeFromModel,
      modelEdges,
    },
  };
}

describe('useRemoveGraphElements', () => {
  beforeEach(() => {
    capturedBulkOptions = undefined;
    mockBulkAction.mockClear();
    mockRemoveNode.mockClear();
    mockCreateEdge.mockClear();
    mockControllerSetState.mockClear();
    mockLayout.mockClear();
  });

  describe('removeNodes', () => {
    test('should use singular labels for a single node', () => {
      const { result } = renderHook(() => useRemoveGraphElements());

      result.current.removeNodes([makeNode()]);

      expect(capturedBulkOptions).toBeDefined();
      expect(capturedBulkOptions!.title).toBe('Remove step');
      expect(capturedBulkOptions!.confirmText).toBe(
        'Yes, I confirm that I want to remove this node.'
      );
      expect(capturedBulkOptions!.actionButtonText).toBe('Remove step');
      expect(capturedBulkOptions!.isDanger).toBe(true);
    });

    test('should use plural labels for multiple nodes', () => {
      const { result } = renderHook(() => useRemoveGraphElements());
      const nodes = [
        makeNode({ id: 'n1', name: 'Node 1' }),
        makeNode({ id: 'n2', name: 'Node 2' }),
        makeNode({ id: 'n3', name: 'Node 3' }),
      ];

      result.current.removeNodes(nodes);

      expect(capturedBulkOptions!.title).toBe('Remove all steps');
      expect(capturedBulkOptions!.confirmText).toBe(
        'Yes, I confirm that I want to remove these 3 nodes.'
      );
      expect(capturedBulkOptions!.actionButtonText).toBe('Remove all steps');
    });

    test('should use node getId as keyFn', () => {
      const { result } = renderHook(() => useRemoveGraphElements());
      const node = makeNode({ id: 'unique-id-42' });

      result.current.removeNodes([node]);

      const key = capturedBulkOptions!.keyFn({ getId: () => 'unique-id-42' });
      expect(key).toBe('unique-id-42');
    });

    test('should pass nodes as items', () => {
      const { result } = renderHook(() => useRemoveGraphElements());
      const node = makeNode();

      result.current.removeNodes([node]);

      expect(capturedBulkOptions!.items).toEqual([node]);
    });
  });

  describe('handleRemoveNodes', () => {
    test('should call removeNode for each node', async () => {
      const { result } = renderHook(() => useRemoveGraphElements());
      const nodes = [
        makeNode({ id: 'n1', name: 'Node 1' }),
        makeNode({ id: 'n2', name: 'Node 2' }),
      ];

      result.current.removeNodes(nodes);
      await capturedBulkOptions!.actionFn();

      expect(mockRemoveNode).toHaveBeenCalledTimes(2);
      expect(mockRemoveNode).toHaveBeenCalledWith(nodes[0]);
      expect(mockRemoveNode).toHaveBeenCalledWith(nodes[1]);
    });

    test('should set controller state to modified', async () => {
      const { result } = renderHook(() => useRemoveGraphElements());

      result.current.removeNodes([makeNode()]);
      await capturedBulkOptions!.actionFn();

      expect(mockControllerSetState).toHaveBeenCalledWith(
        expect.objectContaining({ modified: true })
      );
    });

    test('should trigger graph layout', async () => {
      const { result } = renderHook(() => useRemoveGraphElements());

      result.current.removeNodes([makeNode()]);
      await capturedBulkOptions!.actionFn();

      expect(mockLayout).toHaveBeenCalled();
    });
  });

  describe('removeLink', () => {
    test('should show link removal confirmation dialog', () => {
      const { result } = renderHook(() => useRemoveGraphElements());
      const { edge } = makeEdge();

      result.current.removeLink(edge);

      expect(capturedBulkOptions).toBeDefined();
      expect(capturedBulkOptions!.title).toBe('Remove link');
      expect(capturedBulkOptions!.confirmText).toBe(
        'Yes, I confirm that I want to remove this link.'
      );
      expect(capturedBulkOptions!.actionButtonText).toBe('Remove link');
      expect(capturedBulkOptions!.isDanger).toBe(true);
    });

    test('should pass single edge as items array', () => {
      const { result } = renderHook(() => useRemoveGraphElements());
      const { edge } = makeEdge();

      result.current.removeLink(edge);

      expect(capturedBulkOptions!.items).toHaveLength(1);
      expect(capturedBulkOptions!.items[0]).toBe(edge);
    });
  });

  describe('handleRemoveLink', () => {
    test('should set edge invisible and mark source/target as modified', async () => {
      const { result } = renderHook(() => useRemoveGraphElements());
      const { edge, mocks } = makeEdge();

      result.current.removeLink(edge);
      await capturedBulkOptions!.actionFn();

      expect(mocks.setVisible).toHaveBeenCalledWith(false);
      expect(mocks.sourceSetState).toHaveBeenCalledWith({ modified: true });
      expect(mocks.targetSetState).toHaveBeenCalledWith({ modified: true });
    });

    test('should reset source and target node statuses to default', async () => {
      const { result } = renderHook(() => useRemoveGraphElements());
      const { edge, mocks } = makeEdge();

      result.current.removeLink(edge);
      await capturedBulkOptions!.actionFn();

      expect(mocks.sourceSetNodeStatus).toHaveBeenCalledWith('default');
      expect(mocks.targetSetNodeStatus).toHaveBeenCalledWith('default');
    });

    test('should set controller modified state and trigger layout', async () => {
      const { result } = renderHook(() => useRemoveGraphElements());
      const { edge, mocks } = makeEdge();

      result.current.removeLink(edge);
      await capturedBulkOptions!.actionFn();

      expect(mocks.edgeControllerSetState).toHaveBeenCalledWith(
        expect.objectContaining({ modified: true })
      );
      expect(mocks.edgeFromModel).toHaveBeenCalled();
      expect(mocks.edgeLayout).toHaveBeenCalled();
    });

    test('should reconnect orphaned child to START_NODE when no visible target edges remain', async () => {
      const { result } = renderHook(() => useRemoveGraphElements());
      const { edge, mocks } = makeEdge({ visibleTargetEdges: false, targetId: 'orphan-1' });

      result.current.removeLink(edge);
      await capturedBulkOptions!.actionFn();

      expect(mockCreateEdge).toHaveBeenCalledWith(START_NODE_ID, 'orphan-1', EdgeStatus.info);
      expect(mocks.modelEdges).toHaveLength(1);
    });

    test('should not reconnect child when other visible target edges exist', async () => {
      const { result } = renderHook(() => useRemoveGraphElements());
      const { edge, mocks } = makeEdge({ visibleTargetEdges: true });

      result.current.removeLink(edge);
      await capturedBulkOptions!.actionFn();

      expect(mockCreateEdge).not.toHaveBeenCalled();
      expect(mocks.modelEdges).toHaveLength(0);
    });
  });

  describe('node column renderers', () => {
    test('should provide Name and Identifier as confirmation columns', () => {
      const { result } = renderHook(() => useRemoveGraphElements());

      result.current.removeNodes([makeNode()]);

      expect(capturedBulkOptions!.confirmationColumns).toHaveLength(2);
      expect(capturedBulkOptions!.confirmationColumns[0].header).toBe('Name');
      expect(capturedBulkOptions!.confirmationColumns[1].header).toBe('Identifier');
    });

    test('should provide Name as the only action column', () => {
      const { result } = renderHook(() => useRemoveGraphElements());

      result.current.removeNodes([makeNode()]);

      expect(capturedBulkOptions!.actionColumns).toHaveLength(1);
      expect(capturedBulkOptions!.actionColumns[0].header).toBe('Name');
    });

    test('should render node name from resource data', () => {
      const { result } = renderHook(() => useRemoveGraphElements());
      const node = makeNode({ name: 'My Template' });

      result.current.removeNodes([node]);

      const nameColumn = capturedBulkOptions!.confirmationColumns[0];
      const element = nameColumn.cell(node) as ReactElement<{ text: string }>;
      expect(element.props.text).toBe('My Template');
    });

    test('should render DELETED for node with missing resource name', () => {
      const { result } = renderHook(() => useRemoveGraphElements());
      const node = makeDeletedNode();

      result.current.removeNodes([node]);

      const nameColumn = capturedBulkOptions!.confirmationColumns[0];
      const element = nameColumn.cell(node) as ReactElement<{ text: string }>;
      expect(element.props.text).toBe('DELETED');
    });

    test('should render node identifier', () => {
      const { result } = renderHook(() => useRemoveGraphElements());
      const node = makeNode({ identifier: 'my-alias' });

      result.current.removeNodes([node]);

      const idColumn = capturedBulkOptions!.confirmationColumns[1];
      const element = idColumn.cell(node) as ReactElement<{ text: string }>;
      expect(element.props.text).toBe('my-alias');
    });
  });

  describe('link column renderers', () => {
    test('should provide Source Node, Target Node, and Status as confirmation columns', () => {
      const { result } = renderHook(() => useRemoveGraphElements());
      const { edge } = makeEdge();

      result.current.removeLink(edge);

      expect(capturedBulkOptions!.confirmationColumns).toHaveLength(3);
      expect(capturedBulkOptions!.confirmationColumns[0].header).toBe('Source Node');
      expect(capturedBulkOptions!.confirmationColumns[1].header).toBe('Target Node');
      expect(capturedBulkOptions!.confirmationColumns[2].header).toBe('Status');
    });

    test('should provide Source Node and Target Node as action columns', () => {
      const { result } = renderHook(() => useRemoveGraphElements());
      const { edge } = makeEdge();

      result.current.removeLink(edge);

      expect(capturedBulkOptions!.actionColumns).toHaveLength(2);
      expect(capturedBulkOptions!.actionColumns[0].header).toBe('Source Node');
      expect(capturedBulkOptions!.actionColumns[1].header).toBe('Target Node');
    });

    test('should render source node label', () => {
      const { result } = renderHook(() => useRemoveGraphElements());
      const { edge } = makeEdge({ sourceLabel: 'My Source' });

      result.current.removeLink(edge);

      const srcColumn = capturedBulkOptions!.confirmationColumns[0];
      const element = srcColumn.cell(edge) as ReactElement<{ text: string }>;
      expect(element.props.text).toBe('My Source');
    });

    test('should render DELETED for source node with empty label', () => {
      const { result } = renderHook(() => useRemoveGraphElements());
      const { edge } = makeEdge({ sourceLabel: '' });

      result.current.removeLink(edge);

      const srcColumn = capturedBulkOptions!.confirmationColumns[0];
      const element = srcColumn.cell(edge) as ReactElement<{ text: string }>;
      expect(element.props.text).toBe('DELETED');
    });

    test('should render target node label', () => {
      const { result } = renderHook(() => useRemoveGraphElements());
      const { edge } = makeEdge({ targetLabel: 'My Target' });

      result.current.removeLink(edge);

      const tgtColumn = capturedBulkOptions!.confirmationColumns[1];
      const element = tgtColumn.cell(edge) as ReactElement<{ text: string }>;
      expect(element.props.text).toBe('My Target');
    });

    test('should render status column with green for success', () => {
      const { result } = renderHook(() => useRemoveGraphElements());
      const { edge } = makeEdge({ tag: 'Run on success', tagStatus: 'success' });

      result.current.removeLink(edge);

      const statusColumn = capturedBulkOptions!.confirmationColumns[2];
      const element = statusColumn.cell(edge) as ReactElement<{
        color: string;
        children: string;
      }>;
      expect(element).not.toBeNull();
      expect(element.props.color).toBe('green');
      expect(element.props.children).toBe('Run on success');
    });

    test('should render status column with red for danger', () => {
      const { result } = renderHook(() => useRemoveGraphElements());
      const { edge } = makeEdge({ tag: 'Run on fail', tagStatus: 'danger' });

      result.current.removeLink(edge);

      const statusColumn = capturedBulkOptions!.confirmationColumns[2];
      const element = statusColumn.cell(edge) as ReactElement<{
        color: string;
        children: string;
      }>;
      expect(element.props.color).toBe('red');
      expect(element.props.children).toBe('Run on fail');
    });

    test('should render status column with blue for info', () => {
      const { result } = renderHook(() => useRemoveGraphElements());
      const { edge } = makeEdge({ tag: 'Run always', tagStatus: 'info' });

      result.current.removeLink(edge);

      const statusColumn = capturedBulkOptions!.confirmationColumns[2];
      const element = statusColumn.cell(edge) as ReactElement<{
        color: string;
        children: string;
      }>;
      expect(element.props.color).toBe('blue');
      expect(element.props.children).toBe('Run always');
    });

    test('should return null for status column when edge has no data', () => {
      const { result } = renderHook(() => useRemoveGraphElements());
      const { edge } = makeEdge({ noData: true });

      result.current.removeLink(edge);

      const statusColumn = capturedBulkOptions!.confirmationColumns[2];
      expect(statusColumn.cell(edge)).toBeNull();
    });
  });
});
