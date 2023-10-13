import { Button, Tooltip } from '@patternfly/react-core';
import { RedoAltIcon } from '@patternfly/react-icons';
import { useCallback, useLayoutEffect, useState } from 'react';
import { mutate } from 'swr';

export function PageRefreshIcon() {
  const [refreshing, setRefreshing] = useState(false);
  const refresh = useCallback(() => {
    setRefreshing(true);
    void mutate((key) => typeof key === 'string').finally(() => {
      setRefreshing(false);
    });
  }, []);
  const [rotation, setRotation] = useState(0);

  useLayoutEffect(() => {
    let frame: number;
    let start: number;
    function rotate(timestamp: number) {
      if (start === undefined) {
        start = timestamp;
      }
      const elapsed = timestamp - start;
      start = timestamp;
      frame = requestAnimationFrame(rotate);
      setRotation((rotate) => rotate + elapsed / 3);
    }
    function stop(timestamp: number) {
      if (start === undefined) {
        start = timestamp;
      }
      const elapsed = timestamp - start;
      start = timestamp;

      frame = requestAnimationFrame(stop);
      setRotation((rotate) => {
        if (Math.floor(rotate / 360) !== Math.floor((rotate + elapsed / 3) / 360)) {
          cancelAnimationFrame(frame);
          return 0;
        }
        return rotate + elapsed / 3;
      });
    }

    if (refreshing) {
      frame = requestAnimationFrame(rotate);
      return () => cancelAnimationFrame(frame);
    } else {
      frame = requestAnimationFrame(stop);
      return () => cancelAnimationFrame(frame);
    }
  }, [refreshing]);

  return (
    <Tooltip content="Refresh" position="bottom" entryDelay={1000}>
      <Button id="refresh" data-cy="refresh" onClick={refresh} variant="plain">
        <RedoAltIcon style={{ transform: `rotateZ(${rotation}deg)` }} />
      </Button>
    </Tooltip>
  );
}
