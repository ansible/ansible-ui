import { Edge, Point } from '@patternfly/react-topology';

export enum Position {
  Left = 'left',
  Top = 'top',
  Right = 'right',
  Bottom = 'bottom',
}
const HALF_NODE_HEIGHT = 25;
interface GetSmoothStepPathParams {
  source: PathPoint;
  target: PathPoint;
  sourcePosition?: Position;
  targetPosition?: Position;
  borderRadius?: number;
  offset?: number;
}

const handleDirections = {
  [Position.Left]: { x: -1, y: 0 },
  [Position.Right]: { x: 1, y: 0 },
  [Position.Top]: { x: 0, y: -1 },
  [Position.Bottom]: { x: 0, y: 1 },
};
type PathPoint = Point | { x: number; y: number };
export function getLabelCenter(
  points: PathPoint[],
  sourceGapPoint: PathPoint,
  targetGapPoint: PathPoint
): [number, number] {
  const firstPoint = points[0] ?? sourceGapPoint;
  const maxXDistance = Math.max(
    Math.abs(sourceGapPoint.x - firstPoint.x),
    Math.abs(targetGapPoint.x - firstPoint.x)
  );
  const maxYDistance = Math.max(
    Math.abs(sourceGapPoint.y - firstPoint.y),
    Math.abs(targetGapPoint.y - firstPoint.y)
  );

  if (maxXDistance >= maxYDistance) {
    return [(sourceGapPoint.x + targetGapPoint.x) / 2, firstPoint.y];
  }
  return [firstPoint.x, (sourceGapPoint.y + targetGapPoint.y) / 2];
}

export function useGetPath(edge: Edge) {
  const sourcePosition = edge.getSource().getPosition();
  const targetPosition = edge.getTarget().getPosition();
  const { path, labelCoordinates } = getSmoothStepPath({
    source: sourcePosition,
    sourcePosition: Position.Right,
    target: targetPosition,
    targetPosition: Position.Right,
    borderRadius: 15,
    offset: 25,
  });

  return { path, centerPoint: labelCoordinates };
}
const getDirection = ({
  source,
  sourcePosition = Position.Bottom,
  target,
}: {
  source: PathPoint;
  sourcePosition: Position;
  target: PathPoint;
}): PathPoint => {
  if (sourcePosition === Position.Left || sourcePosition === Position.Right) {
    return source.x < target.x ? { x: 1, y: 0 } : { x: -1, y: 0 };
  }
  return source.y < target.y ? { x: 0, y: 1 } : { x: 0, y: -1 };
};

const distance = (a: PathPoint, b: PathPoint) =>
  Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));

type DirectionAccessor = 'x' | 'y';

interface GetPointsContext {
  source: PathPoint;
  target: PathPoint;
  sourcePosition: Position;
  targetPosition: Position;
  sourceDir: PathPoint;
  targetDir: PathPoint;
  sourceGapped: PathPoint;
  targetGapped: PathPoint;
  dirAccessor: DirectionAccessor;
  currDir: number;
  offset: number;
}

interface GapOffsets {
  source: { x: number; y: number };
  target: { x: number; y: number };
}

function hasOppositeHandles({ sourceDir, targetDir, dirAccessor }: GetPointsContext): boolean {
  return sourceDir[dirAccessor] * targetDir[dirAccessor] === -1;
}

function getOppositeHandlePoints({
  source,
  target,
  sourceDir,
  sourceGapped,
  targetGapped,
  dirAccessor,
  currDir,
}: GetPointsContext): PathPoint[] {
  const [centerX, centerY] = getEdgeCenter({ source, target });
  const verticalSplit: PathPoint[] = [
    { x: centerX, y: sourceGapped.y },
    { x: centerX, y: targetGapped.y },
  ];
  const horizontalSplit: PathPoint[] = [
    { x: sourceGapped.x, y: centerY },
    { x: targetGapped.x, y: centerY },
  ];

  if (sourceDir[dirAccessor] === currDir) {
    return dirAccessor === 'x' ? verticalSplit : horizontalSplit;
  }
  return dirAccessor === 'x' ? horizontalSplit : verticalSplit;
}

function getAlignedPoints({
  sourceDir,
  sourceGapped,
  targetGapped,
  dirAccessor,
  currDir,
}: GetPointsContext): PathPoint[] {
  const sourceTarget = { x: sourceGapped.x, y: targetGapped.y };
  const targetSource = { x: targetGapped.x, y: sourceGapped.y };

  if (dirAccessor === 'x') {
    return [sourceDir.x === currDir ? targetSource : sourceTarget];
  }
  return [sourceDir.y === currDir ? sourceTarget : targetSource];
}

function shouldFlipMixedPoints({
  sourceDir,
  targetDir,
  sourceGapped,
  targetGapped,
  dirAccessor,
}: GetPointsContext): boolean {
  const oppositeAccessor = dirAccessor === 'x' ? 'y' : 'x';
  const sameDirection = sourceDir[dirAccessor] === targetDir[oppositeAccessor];
  const sourceIsGreater = sourceGapped[oppositeAccessor] > targetGapped[oppositeAccessor];
  const sourceIsLess = sourceGapped[oppositeAccessor] < targetGapped[oppositeAccessor];

  if (sourceDir[dirAccessor] === 1) {
    return sameDirection ? sourceIsLess : sourceIsGreater;
  }
  return sameDirection ? sourceIsGreater : sourceIsLess;
}

function getMixedFlipPoint({
  sourceGapped,
  targetGapped,
  dirAccessor,
}: GetPointsContext): PathPoint[] {
  if (dirAccessor === 'x') {
    return [{ x: sourceGapped.x, y: targetGapped.y }];
  }
  return [{ x: targetGapped.x, y: sourceGapped.y }];
}

function getIntermediatePoints(context: GetPointsContext): PathPoint[] {
  if (hasOppositeHandles(context)) {
    return getOppositeHandlePoints(context);
  }

  const points = getAlignedPoints(context);
  if (context.sourcePosition !== context.targetPosition && shouldFlipMixedPoints(context)) {
    return getMixedFlipPoint(context);
  }
  return points;
}

function getGapOffsets({
  source,
  target,
  sourceDir,
  sourceGapped,
  targetGapped,
  sourcePosition,
  targetPosition,
  dirAccessor,
  currDir,
  offset,
}: GetPointsContext): GapOffsets {
  const sourceGapOffset = { x: 0, y: 0 };
  const targetGapOffset = { x: 0, y: 0 };
  if (sourcePosition !== targetPosition) {
    return { source: sourceGapOffset, target: targetGapOffset };
  }

  const diff = Math.abs(source[dirAccessor] - target[dirAccessor]);
  if (diff > offset) {
    return { source: sourceGapOffset, target: targetGapOffset };
  }

  const gapOffset = Math.min(offset - 1, offset - diff);
  if (sourceDir[dirAccessor] === currDir) {
    const direction = sourceGapped[dirAccessor] > source[dirAccessor] ? -1 : 1;
    sourceGapOffset[dirAccessor] = direction * gapOffset;
  } else {
    const direction = targetGapped[dirAccessor] > target[dirAccessor] ? -1 : 1;
    targetGapOffset[dirAccessor] = direction * gapOffset;
  }
  return { source: sourceGapOffset, target: targetGapOffset };
}

export function getPoints({
  source,
  sourcePosition = Position.Bottom,
  target,
  targetPosition = Position.Top,
  offset,
}: {
  source: PathPoint;
  sourcePosition: Position;
  target: PathPoint;
  targetPosition: Position;
  offset: number;
}): [PathPoint[], number, number] {
  const sourceDir: PathPoint = handleDirections[sourcePosition];
  const targetDir: PathPoint = handleDirections[targetPosition];
  const sourceGapped: PathPoint = {
    x: source.x + sourceDir.x * offset,
    y: source.y + sourceDir.y * offset,
  };
  const targetGapped: PathPoint = {
    x: target.x + targetDir.x * offset,
    y: target.y + targetDir.y * offset,
  };
  const dir = getDirection({
    source: sourceGapped,
    sourcePosition,
    target: targetGapped,
  });
  const dirAccessor = dir.x !== 0 ? 'x' : 'y';
  const currDir = dir[dirAccessor];

  const context: GetPointsContext = {
    source,
    target,
    sourcePosition,
    targetPosition,
    sourceDir,
    targetDir,
    sourceGapped,
    targetGapped,
    dirAccessor,
    currDir,
    offset,
  };
  const points = getIntermediatePoints(context);
  const gapOffsets = getGapOffsets(context);
  const sourceGapPoint = {
    x: sourceGapped.x + gapOffsets.source.x,
    y: sourceGapped.y + gapOffsets.source.y,
  };
  const targetGapPoint = {
    x: targetGapped.x + gapOffsets.target.x,
    y: targetGapped.y + gapOffsets.target.y,
  };
  const [centerX, centerY] = hasOppositeHandles(context)
    ? getEdgeCenter({ source, target })
    : getLabelCenter(points, sourceGapPoint, targetGapPoint);

  const pathPoints = [
    source,
    { x: sourceGapPoint.x, y: sourceGapPoint.y },
    ...points,
    { x: targetGapPoint.x, y: targetGapPoint.y },
    target,
  ];

  return [pathPoints, centerX, centerY];
}

function getBend(a: PathPoint, b: PathPoint, c: PathPoint, size: number): string {
  const bendSize = Math.min(distance(a, b) / 2, distance(b, c) / 2, size);
  const { x, y } = b;

  // no bend
  if ((a.x === x && x === c.x) || (a.y === y && y === c.y)) {
    return `L${x} ${y}`;
  }

  // first segment is horizontal
  if (a.y === y) {
    const xDir = a.x < c.x ? -1 : 1;
    const yDir = a.y < c.y ? 1 : -1;
    return `L ${x + bendSize * xDir},${y}Q ${x},${y} ${x},${y + bendSize * yDir}`;
  }

  const xDir = a.x < c.x ? 1 : -1;
  const yDir = a.y < c.y ? -1 : 1;
  return `L ${x},${y + bendSize * yDir}Q ${x},${y} ${x + bendSize * xDir},${y}`;
}

function getSmoothStepPath({
  source,
  target,
  borderRadius = 5,
  offset = 20,
}: GetSmoothStepPathParams): { path: string; labelCoordinates: { x: number; y: number } } {
  const [points, labelX, labelY] = getPoints({
    source: { x: source.x, y: source.y + HALF_NODE_HEIGHT },
    sourcePosition: Position.Right,
    target: { x: target.x, y: target.y + HALF_NODE_HEIGHT },
    targetPosition: Position.Left,
    offset,
  });
  const path = points.reduce<string>((res, p, i) => {
    let segment = '';

    if (i > 0 && i < points.length - 1) {
      segment = getBend(points[i - 1], p, points[i + 1], borderRadius);
    } else {
      const pathPrefix = i === 0 ? 'M' : 'L';
      segment = `${pathPrefix}${p.x} ${p.y}`;
    }

    res += segment;

    return res;
  }, '');

  return { path, labelCoordinates: { x: labelX, y: labelY } };
}

function getEdgeCenter({
  source,
  target,
}: {
  source: PathPoint;
  target: PathPoint;
}): [number, number] {
  const xOffset = Math.abs(target.x - source.x) / 2;
  const centerX = target.x < source.x ? target.x + xOffset : target.x - xOffset;

  const yOffset = Math.abs(target.y - source.y) / 2;
  const centerY = target.y < source.y ? target.y + yOffset : target.y - yOffset;

  return [centerX, centerY];
}
