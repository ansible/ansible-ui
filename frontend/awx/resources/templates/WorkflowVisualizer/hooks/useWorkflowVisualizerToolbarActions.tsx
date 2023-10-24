import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, ToolbarGroup, ToolbarItem } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import {
  CheckCircleIcon,
  CloseIcon,
  CompressAltIcon,
  ExpandAltIcon,
  PlusCircleIcon,
} from '@patternfly/react-icons';

import { usePageNavigate } from '../../../../../../framework';
import { AwxRoute } from '../../../../AwxRoutes';

export function useWorkflowVisualizerToolbarActions() {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id: string }>();

  const handleCancel = useCallback(() => {
    pageNavigate(AwxRoute.WorkflowJobTemplateDetails, { params: { id: params.id } });
  }, [pageNavigate, params.id]);

  return (
    <>
      <ToolbarGroup>
        <ToolbarItem>
          <Button icon={<CheckCircleIcon />} label={t('Save')} onClick={() => {}}>
            {t('Save')}
          </Button>
        </ToolbarItem>
        <ToolbarItem>
          <Button
            icon={<PlusCircleIcon />}
            variant="secondary"
            label={t('Add node')}
            onClick={() => {}}
          >
            {t('Add node')}
          </Button>
        </ToolbarItem>
      </ToolbarGroup>
      <ToolbarGroup align={{ default: 'alignRight' }}>
        <ToolbarItem>
          <Button
            data-cy="workflow-visualizer-toolbar-expand-compress"
            variant="plain"
            aria-label={isExpanded ? t('Compress') : t('Expand')}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <CompressAltIcon
                data-cy="workflow-visualizer-toolbar-compress"
                aria-label={t('Compress')}
              />
            ) : (
              <ExpandAltIcon
                data-cy="workflow-visualizer-toolbar-expand"
                aria-label={t('Expand')}
              />
            )}
          </Button>
        </ToolbarItem>
        <ToolbarItem>
          <Button
            data-cy="workflow-visualizer-toolbar-close"
            variant="plain"
            icon={<CloseIcon />}
            aria-label={t('Close')}
            onClick={handleCancel}
          />
        </ToolbarItem>
      </ToolbarGroup>
    </>
  );
}
