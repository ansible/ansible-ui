import { Dispatch, useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CheckCircleIcon,
  CloseIcon,
  CompressAltIcon,
  EllipsisVIcon,
  ExpandAltIcon,
  ExternalLinkAltIcon,
  TrashIcon,
} from '@patternfly/react-icons';
import {
  Badge,
  Button,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { usePageNavigate } from '../../../../../../framework';
import { AwxRoute } from '../../../../AwxRoutes';
import { AddNodeButton } from '../components/AddNodeButton';
import getDocsBaseUrl from '../../../../common/util/getDocsBaseUrl';
import { useAwxConfig } from '../../../../common/useAwxConfig';
import { WorkflowVisualizerAction, WorkflowVisualizerState } from '../types';

export function useWorkflowVisualizerToolbarActions(
  state: WorkflowVisualizerState,
  dispatch: Dispatch<WorkflowVisualizerAction>
) {
  const { nodes } = state;
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isKebabOpen, setIsKebabOpen] = useState<boolean>(false);
  const pageNavigate = usePageNavigate();
  const config = useAwxConfig();
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
          <AddNodeButton />
        </ToolbarItem>
        <ToolbarItem>
          <Dropdown
            onSelect={() => setIsKebabOpen(!isKebabOpen)}
            isOpen={isKebabOpen}
            toggle={(toggleRef) => (
              <MenuToggle
                ref={toggleRef}
                className="toggle-kebab"
                onClick={() => setIsKebabOpen(!isKebabOpen)}
                variant="plain"
              >
                <EllipsisVIcon />
              </MenuToggle>
            )}
          >
            <DropdownList>
              <DropdownItem
                icon={<ExternalLinkAltIcon />}
                data-cy="workflow-documentation"
                to={`${getDocsBaseUrl(config)}/html/userguide/workflow_templates.html#ug-wf-editor`}
                target="_blank"
              >
                {t('Documentation')}
              </DropdownItem>
              <Divider />
              <DropdownItem
                data-cy="remove-all-nodes"
                onClick={() => dispatch({ type: 'SET_NODES_TO_DELETE', value: nodes })}
                isDanger
                icon={<TrashIcon />}
              >
                {t('Remove all nodes')}
              </DropdownItem>
            </DropdownList>
          </Dropdown>
        </ToolbarItem>
      </ToolbarGroup>
      <ToolbarGroup align={{ default: 'alignRight' }}>
        <ToolbarItem style={{ alignSelf: 'center' }}>
          <div data-cy="workflow-visualizer-toolbar-total-nodes">
            {t('Total nodes')} <Badge isRead>{nodes?.length || 0}</Badge>
          </div>
        </ToolbarItem>
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
