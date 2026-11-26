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

const { getLabelCenter, getPoints, Position, useGetPath } = await import('./useGetPath');

function makeMockEdge(sourceX: number, sourceY: number, targetX: number, targetY: number) {
  return {
    getSource: () => ({ getPosition: () => ({ x: sourceX, y: sourceY }) }),
    getTarget: () => ({ getPosition: () => ({ x: targetX, y: targetY }) }),
  } as Parameters<typeof useGetPath>[0];
}

describe('useGetPath', () => {
  it('calculates a path and label for mixed handle positions', () => {
    const [points, centerX, centerY] = getPoints({
      source: { x: 0, y: 0 },
      sourcePosition: Position.Right,
      target: { x: 100, y: 100 },
      targetPosition: Position.Bottom,
      offset: 25,
    });

    expect(points).toEqual([
      { x: 0, y: 0 },
      { x: 25, y: 0 },
      { x: 25, y: 125 },
      { x: 100, y: 125 },
      { x: 100, y: 100 },
    ]);
    expect(centerX).toBe(25);
    expect(centerY).toBe(62.5);
  });

  it('centers the label on the longest horizontal segment', () => {
    const [, centerX, centerY] = getPoints({
      source: { x: 0, y: 0 },
      sourcePosition: Position.Right,
      target: { x: 100, y: 20 },
      targetPosition: Position.Bottom,
      offset: 25,
    });

    expect(centerX).toBe(62.5);
    expect(centerY).toBe(45);
  });

  it('uses the source gap point when there are no intermediate points', () => {
    expect(getLabelCenter([], { x: 25, y: 0 }, { x: 25, y: 125 })).toEqual([25, 62.5]);
  });

  it('splits opposite horizontal handles through the edge center', () => {
    const [points, centerX, centerY] = getPoints({
      source: { x: 0, y: 0 },
      sourcePosition: Position.Right,
      target: { x: 100, y: 100 },
      targetPosition: Position.Left,
      offset: 25,
    });

    expect(points).toEqual([
      { x: 0, y: 0 },
      { x: 25, y: 0 },
      { x: 50, y: 0 },
      { x: 50, y: 100 },
      { x: 75, y: 100 },
      { x: 100, y: 100 },
    ]);
    expect([centerX, centerY]).toEqual([50, 50]);
  });

  it('offsets the source when same-direction handles are close', () => {
    const [points, centerX, centerY] = getPoints({
      source: { x: 0, y: 0 },
      sourcePosition: Position.Right,
      target: { x: 10, y: 0 },
      targetPosition: Position.Right,
      offset: 25,
    });

    expect(points).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 35, y: 0 },
      { x: 35, y: 0 },
      { x: 10, y: 0 },
    ]);
    expect([centerX, centerY]).toEqual([22.5, 0]);
  });

  it('offsets the target when same-direction handles run in reverse', () => {
    const [points, centerX, centerY] = getPoints({
      source: { x: 100, y: 0 },
      sourcePosition: Position.Right,
      target: { x: 90, y: 0 },
      targetPosition: Position.Right,
      offset: 25,
    });

    expect(points).toEqual([
      { x: 100, y: 0 },
      { x: 125, y: 0 },
      { x: 125, y: 0 },
      { x: 100, y: 0 },
      { x: 90, y: 0 },
    ]);
    expect([centerX, centerY]).toEqual([112.5, 0]);
  });

  it('keeps the source-first route when mixed handles point apart', () => {
    const [points, centerX, centerY] = getPoints({
      source: { x: 0, y: 200 },
      sourcePosition: Position.Right,
      target: { x: 100, y: 100 },
      targetPosition: Position.Bottom,
      offset: 25,
    });

    expect(points).toEqual([
      { x: 0, y: 200 },
      { x: 25, y: 200 },
      { x: 100, y: 200 },
      { x: 100, y: 125 },
      { x: 100, y: 100 },
    ]);
    expect([centerX, centerY]).toEqual([62.5, 200]);
  });

  it('builds a vertical path for same-direction bottom handles', () => {
    const [points, centerX, centerY] = getPoints({
      source: { x: 0, y: 0 },
      sourcePosition: Position.Bottom,
      target: { x: 100, y: 100 },
      targetPosition: Position.Bottom,
      offset: 25,
    });

    expect(points).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 25 },
      { x: 0, y: 125 },
      { x: 100, y: 125 },
      { x: 100, y: 100 },
    ]);
    expect([centerX, centerY]).toEqual([50, 125]);
  });

  it('flips the intermediate point for top-to-right handles', () => {
    const [points, centerX, centerY] = getPoints({
      source: { x: 0, y: 100 },
      sourcePosition: Position.Top,
      target: { x: 100, y: 0 },
      targetPosition: Position.Right,
      offset: 25,
    });

    expect(points).toEqual([
      { x: 0, y: 100 },
      { x: 0, y: 75 },
      { x: 125, y: 75 },
      { x: 125, y: 0 },
      { x: 100, y: 0 },
    ]);
    expect([centerX, centerY]).toEqual([62.5, 75]);
  });

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
