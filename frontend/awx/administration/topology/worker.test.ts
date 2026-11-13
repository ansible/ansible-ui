import { describe, expect, it, vi } from 'vitest';
import { MeshNode } from './types';
import { runTopologyLayout, SELECTOR } from './worker';

describe('topology layout worker', () => {
  it('should expose the topology selector constant', () => {
    expect(SELECTOR).toBe('#topology');
  });

  it('should run force layout and post tick and end messages', () => {
    const nodes: MeshNode[] = [
      { id: 'a', hostname: 'node-a', node_type: 'execution', node_state: 'ready', x: 0, y: 0 },
      { id: 'b', hostname: 'node-b', node_type: 'control', node_state: 'ready', x: 1, y: 1 },
    ];
    const links = [{ source: 'node-a', target: 'node-b' } as { source: string; target: string }];
    const posted: unknown[] = [];
    const postMessage = vi.fn((payload: unknown) => posted.push(payload));

    runTopologyLayout(
      {
        data: {
          nodes,
          links,
          height: 400,
          width: 600,
        },
      },
      postMessage
    );

    expect(postMessage).toHaveBeenCalled();
    expect(posted.some((msg) => (msg as { type: string }).type === 'tick')).toBe(true);
    const endMessage = posted.find((msg) => (msg as { type: string }).type === 'end') as {
      type: string;
      nodes: MeshNode[];
    };
    expect(endMessage).toBeDefined();
    expect(endMessage.nodes).toHaveLength(2);
  });

  it('should post layout results when the worker onmessage handler runs', () => {
    const nodes: MeshNode[] = [
      { id: 'a', hostname: 'node-a', node_type: 'execution', node_state: 'ready', x: 0, y: 0 },
    ];
    const postMessage = vi.fn();
    self.postMessage = postMessage as typeof self.postMessage;

    expect(self.onmessage).toBeTypeOf('function');
    self.onmessage?.({
      data: {
        nodes,
        links: [],
        height: 200,
        width: 300,
      },
    } as MessageEvent);

    expect(postMessage).toHaveBeenCalled();
    expect(
      postMessage.mock.calls.some((call) => (call[0] as { type: string }).type === 'end')
    ).toBe(true);
  });
});
