import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { EdgeStatus } from '../types';
import { EdgeTerminalType } from '@patternfly/react-topology';

export function useCreateEdge() {
  const { t } = useTranslation();
  return useCallback(
    (source: string, target: string, tagStatus: EdgeStatus) => {
      const tag = {
        [EdgeStatus.success]: t('Run on success'),
        [EdgeStatus.danger]: t('Run on fail'),
        [EdgeStatus.info]: t('Run always'),
      }[tagStatus];
      const originalStatus = {
        [EdgeStatus.success]: 'success',
        [EdgeStatus.danger]: 'failure',
        [EdgeStatus.info]: 'info',
      }[tagStatus];

      return {
        id: `${source}-${target}`,
        type: 'edge',
        source,
        target,
        visible: true,
        data: {
          originalStatus,
          source,
          tag,
          tagStatus,
          target,
          endTerminalType: EdgeTerminalType.directional,
          endTerminalStatus: tagStatus,
          endTerminalSize: 14,
        },
      };
    },
    [t]
  );
}
