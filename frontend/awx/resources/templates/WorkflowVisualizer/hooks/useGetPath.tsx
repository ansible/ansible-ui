import { Edge, Point } from '@patternfly/react-topology';

enum Position {
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

function getPoints({
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

  let points: PathPoint[] = [];
  let centerX, centerY;
  const sourceGapOffset = { x: 0, y: 0 };
  const targetGapOffset = { x: 0, y: 0 };

  const [defaultCenterX, defaultCenterY]: [number, number] = getEdgeCenter({
    source,
    target,
  });

  // opposite handle positions, default case
  if (sourceDir[dirAccessor] * targetDir[dirAccessor] === -1) {
    centerX = defaultCenterX;
    centerY = defaultCenterY;
    //    --->
    //    |
    // >---
    const verticalSplit: PathPoint[] = [
      { x: centerX, y: sourceGapped.y },
      { x: centerX, y: targetGapped.y },
    ];
    //    |
    //  ---
    //  |
    const horizontalSplit: PathPoint[] = [
      { x: sourceGapped.x, y: centerY },
      { x: targetGapped.x, y: centerY },
    ];

    if (sourceDir[dirAccessor] === currDir) {
      points = dirAccessor === 'x' ? verticalSplit : horizontalSplit;
    } else {
      points = dirAccessor === 'x' ? horizontalSplit : verticalSplit;
    }
  } else {
    // sourceTarget means we take x from source and y from target, targetSource is the opposite
    const sourceTarget: PathPoint[] = [{ x: sourceGapped.x, y: targetGapped.y }];
    const targetSource: PathPoint[] = [{ x: targetGapped.x, y: sourceGapped.y }];
    // this handles edges with same handle positions
    if (dirAccessor === 'x') {
      points = sourceDir.x === currDir ? targetSource : sourceTarget;
    } else {
      points = sourceDir.y === currDir ? sourceTarget : targetSource;
    }

    if (sourcePosition === targetPosition) {
      const diff = Math.abs(source[dirAccessor] - target[dirAccessor]);

      // if an edge goes from right to right for example (sourcePosition === targetPosition) and the distance between source.x and target.x is less than the offset, the added point and the gapped source/target will overlap. This leads to a weird edge path. To avoid this we add a gapOffset to the source/target
      if (diff <= offset) {
        const gapOffset = Math.min(offset - 1, offset - diff);
        if (sourceDir[dirAccessor] === currDir) {
          sourceGapOffset[dirAccessor] =
            (sourceGapped[dirAccessor] > source[dirAccessor] ? -1 : 1) * gapOffset;
        } else {
          targetGapOffset[dirAccessor] =
            (targetGapped[dirAccessor] > target[dirAccessor] ? -1 : 1) * gapOffset;
        }
      }
    }

    // these are conditions for handling mixed handle positions like Right -> Bottom for example
    if (sourcePosition !== targetPosition) {
      const dirAccessorOpposite = dirAccessor === 'x' ? 'y' : 'x';
      const isSameDir = sourceDir[dirAccessor] === targetDir[dirAccessorOpposite];
      const sourceGtTargetOppo =
        sourceGapped[dirAccessorOpposite] > targetGapped[dirAccessorOpposite];
      const sourceLtTargetOppo =
        sourceGapped[dirAccessorOpposite] < targetGapped[dirAccessorOpposite];
      const flipSourceTarget =
        (sourceDir[dirAccessor] === 1 &&
          ((!isSameDir && sourceGtTargetOppo) || (isSameDir && sourceLtTargetOppo))) ||
        (sourceDir[dirAccessor] !== 1 &&
          ((!isSameDir && sourceLtTargetOppo) || (isSameDir && sourceGtTargetOppo)));

      if (flipSourceTarget) {
        points = dirAccessor === 'x' ? sourceTarget : targetSource;
      }
    }

    const sourceGapPoint = {
      x: sourceGapped.x + sourceGapOffset.x,
      y: sourceGapped.y + sourceGapOffset.y,
    };
    const targetGapPoint = {
      x: targetGapped.x + targetGapOffset.x,
      y: targetGapped.y + targetGapOffset.y,
    };
    const maxXDistance = Math.max(
      Math.abs(sourceGapPoint.x - points[0].x),
      Math.abs(targetGapPoint.x - points[0].x)
    );
    const maxYDistance = Math.max(
      Math.abs(sourceGapPoint.y - points[0].y),
      Math.abs(targetGapPoint.y - points[0].y)
    );

    // we want to place the label on the longest segment of the edge
    if (maxXDistance >= maxYDistance) {
      centerX = (sourceGapPoint.x + targetGapPoint.x) / 2;
      centerY = points[0].y;
    } else {
      centerX = points[0].x;
      centerY = (sourceGapPoint.y + targetGapPoint.y) / 2;
    }
  }

  const pathPoints = [
    source,
    { x: sourceGapped.x + sourceGapOffset.x, y: sourceGapped.y + sourceGapOffset.y },
    ...points,
    { x: targetGapped.x + targetGapOffset.x, y: targetGapped.y + targetGapOffset.y },
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
      segment = `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`;
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
