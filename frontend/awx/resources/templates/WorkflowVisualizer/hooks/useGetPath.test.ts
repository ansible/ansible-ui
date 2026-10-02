import { describe, expect, it, vi } from 'vitest';

vi.mock('@patternfly/react-topology', () => ({
  Edge: {},
  Point: class {
    constructor(
      public x: number,
      public y: number
    ) {}
  },
}));

const { useGetPath } = await import('./useGetPath');

function makeMockEdge(sourceX: number, sourceY: number, targetX: number, targetY: number) {
  return {
    getSource: () => ({ getPosition: () => ({ x: sourceX, y: sourceY }) }),
    getTarget: () => ({ getPosition: () => ({ x: targetX, y: targetY }) }),
  } as Parameters<typeof useGetPath>[0];
}

describe('useGetPath', () => {
  it('should return a path string starting with M for a simple left-to-right edge', () => {
    const edge = makeMockEdge(0, 0, 200, 0);
    const { path, centerPoint } = useGetPath(edge);

    expect(path).toBeTruthy();
    expect(path.startsWith('M')).toBe(true);
    expect(centerPoint).toBeDefined();
    expect(typeof centerPoint.x).toBe('number');
    expect(typeof centerPoint.y).toBe('number');
  });

  it('should compute center point between source and target for horizontal edge', () => {
    const edge = makeMockEdge(0, 100, 400, 100);
    const { centerPoint } = useGetPath(edge);

    expect(centerPoint.x).toBe(200);
  });

  it('should handle source right of target (reverse direction)', () => {
    const edge = makeMockEdge(400, 100, 0, 100);
    const { path, centerPoint } = useGetPath(edge);

    expect(path).toBeTruthy();
    expect(path.startsWith('M')).toBe(true);
    expect(centerPoint.x).toBe(200);
  });

  it('should handle source below target (vertical offset)', () => {
    const edge = makeMockEdge(100, 300, 300, 0);
    const { path, centerPoint } = useGetPath(edge);

    expect(path).toBeTruthy();
    expect(typeof centerPoint.x).toBe('number');
    expect(typeof centerPoint.y).toBe('number');
  });

  it('should handle same position for source and target', () => {
    const edge = makeMockEdge(100, 100, 100, 100);
    const { path, centerPoint } = useGetPath(edge);

    expect(path).toBeTruthy();
    expect(path.startsWith('M')).toBe(true);
    expect(typeof centerPoint.x).toBe('number');
  });

  it('should handle source and target close together (within offset)', () => {
    const edge = makeMockEdge(100, 100, 110, 100);
    const { path, centerPoint } = useGetPath(edge);

    expect(path).toBeTruthy();
    expect(typeof centerPoint.x).toBe('number');
    expect(typeof centerPoint.y).toBe('number');
  });

  it('should produce path with bend segments (Q) for multi-segment edges', () => {
    const edge = makeMockEdge(0, 0, 200, 200);
    const { path } = useGetPath(edge);

    expect(path).toContain('Q');
  });

  it('should include L segments for straight portions', () => {
    const edge = makeMockEdge(0, 0, 200, 0);
    const { path } = useGetPath(edge);

    expect(path).toContain('L');
  });

  it('should handle large coordinate values', () => {
    const edge = makeMockEdge(0, 0, 5000, 3000);
    const { path, centerPoint } = useGetPath(edge);

    expect(path).toBeTruthy();
    expect(centerPoint.x).toBe(2500);
  });

  it('should handle negative coordinates', () => {
    const edge = makeMockEdge(-100, -50, 100, 50);
    const { path, centerPoint } = useGetPath(edge);

    expect(path).toBeTruthy();
    expect(centerPoint.x).toBe(0);
  });

  it('should produce different paths for different target positions', () => {
    const edgeRight = makeMockEdge(0, 0, 300, 0);
    const edgeDiagonal = makeMockEdge(0, 0, 300, 300);

    const resultRight = useGetPath(edgeRight);
    const resultDiagonal = useGetPath(edgeDiagonal);

    expect(resultRight.path).not.toBe(resultDiagonal.path);
  });

  it('should apply HALF_NODE_HEIGHT offset to Y coordinates', () => {
    const edge = makeMockEdge(0, 0, 200, 0);
    const { path } = useGetPath(edge);

    expect(path).toContain('25');
  });

  it('should handle target directly above source', () => {
    const edge = makeMockEdge(100, 500, 100, 0);
    const { path, centerPoint } = useGetPath(edge);

    expect(path).toBeTruthy();
    expect(typeof centerPoint.y).toBe('number');
  });
});
