import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CheckCircleIcon,
  CloseIcon,
  CompressAltIcon,
  EllipsisVIcon,
  ExpandAltIcon,
  PlusCircleIcon,
  TrashIcon,
} from '@patternfly/react-icons';
import {
  Badge,
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { WorkflowNode } from '../../../../interfaces/WorkflowNode';
import { useBulkConfirmation, usePageNavigate } from '../../../../../../framework';
import { AwxRoute } from '../../../../AwxRoutes';
import { getItemKey } from '../../../../../common/crud/Data';
import { stringIsUUID } from '../../../../common/util/strings';

export function useWorkflowVisualizerToolbarActions(nodes: WorkflowNode[]) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isKebabOpen, setIsKebabOpen] = useState<boolean>(false);
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id: string }>();
  const bulkAction = useBulkConfirmation<WorkflowNode>();
  const handleRemoveAllNodes = useCallback(
    (workflowNodes: WorkflowNode[]) => {
      return bulkAction({
        title: t('Remove all nodes'),
        items: workflowNodes,
        keyFn: getItemKey,
        isDanger: true,
        actionFn: async (_item: WorkflowNode, _signal: AbortSignal) => {
          // Add your code here
          return Promise.resolve();
        },
        confirmText: t('Yes, I confirm that I want to remove these {{count}} nodes.', {
          count: workflowNodes.length,
        }),
        confirmationColumns: [
          {
            header: t('Name'),
            cell: (node) =>
              !stringIsUUID(node.identifier)
                ? node.identifier
                : node.summary_fields.unified_job_template.name,
          },
        ],
        actionColumns: [
          {
            header: t('Name'),
            cell: (node) =>
              !stringIsUUID(node.identifier)
                ? node.identifier
                : node.summary_fields.unified_job_template.name,
          },
        ],
        actionButtonText: t('Remove all nodes', { count: workflowNodes.length }),
      });
    },
    [bulkAction, t]
  );

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
                data-cy="remove-all-nodes"
                onClick={() => handleRemoveAllNodes(nodes)}
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
