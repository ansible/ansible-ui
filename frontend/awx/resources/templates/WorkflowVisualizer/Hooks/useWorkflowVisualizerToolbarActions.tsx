import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Button, ToolbarItem } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { CloseIcon, PlusCircleIcon } from '@patternfly/react-icons';

import { usePageNavigate } from '../../../../../../framework';
import { AwxRoute } from '../../../../AwxRoutes';

export function useWorkflowVisualizerToolbarActions() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id: string }>();

  const handleCancel = useCallback(() => {
    pageNavigate(AwxRoute.WorkflowJobTemplateDetails, { params: { id: params.id } });
  }, [pageNavigate, params.id]);

  return (
    <>
      <ToolbarItem>
        <Button icon={<PlusCircleIcon />} label={t('Add node')} onClick={() => {}}>
          {t('Add node')}
        </Button>
      </ToolbarItem>
      <ToolbarItem align={{ default: 'alignRight' }}>
        <Button
          data-cy="workflow-visualizer-toolbar-close"
          variant="plain"
          icon={<CloseIcon />}
          aria-label={t('Close')}
          onClick={handleCancel}
        />
      </ToolbarItem>
    </>
  );
}
