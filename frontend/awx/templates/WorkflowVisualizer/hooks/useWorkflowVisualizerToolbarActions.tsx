import {
  Badge,
  Button,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  MenuToggle,
  Title,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  CloseIcon,
  CompressAltIcon,
  EllipsisVIcon,
  ExpandAltIcon,
  ExternalLinkAltIcon,
  MinusCircleIcon,
  RocketIcon,
} from '@patternfly/react-icons';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { usePageNavigate } from '../../../../../framework';
import { getItemKey, postRequest } from '../../../../common/crud/Data';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { useAwxConfig } from '../../../common/useAwxConfig';
import { getDocsBaseUrl } from '../../../common/util/getDocsBaseUrl';
import { stringIsUUID } from '../../../common/util/strings';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import { WorkflowNode } from '../../../interfaces/WorkflowNode';
import { AwxRoute } from '../../../main/AwxRoutes';
import { AddNodeButton } from '../components/AddNodeButton';

export function useWorkflowVisualizerToolbarActions(
  nodes: WorkflowNode[],
  expanded: [boolean, React.Dispatch<React.SetStateAction<boolean>>],
  workflowJobTemplate: WorkflowJobTemplate | undefined
) {
  const [isExpanded, setIsExpanded] = expanded;
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [isKebabOpen, setIsKebabOpen] = useState<boolean>(false);
  const pageNavigate = usePageNavigate();
  const config = useAwxConfig();
  const bulkAction = useAwxBulkConfirmation<WorkflowNode>();
  const handleLaunchWorkflow = useCallback(async () => {
    await postRequest(awxAPI`/workflow_job_templates/${Number(params.id).toString()}/launch/`, {});
  }, [params.id]);

  const handleRemoveAllNodes = useCallback(
    (workflowNodes: WorkflowNode[]) => {
      return bulkAction({
        title: t('Remove all nodes'),
        items: workflowNodes,
        keyFn: getItemKey,
        isDanger: true,
        actionFn: async (_item: WorkflowNode, _signal: AbortSignal) => {
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

  const header = (
    <Title headingLevel="h1">
      {
        <Flex>
          <FlexItem>{t('Workflow Visualizer')}</FlexItem>
          <Divider
            orientation={{
              default: 'vertical',
            }}
          />
          <FlexItem>{workflowJobTemplate?.name ?? ''}</FlexItem>
        </Flex>
      }
    </Title>
  );
  return (
    <>
      <ToolbarGroup>
        <ToolbarItem>{header}</ToolbarItem>
      </ToolbarGroup>
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
            onOpenChange={(isOpen: boolean) => setIsKebabOpen(isOpen)}
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
              <DropdownItem
                data-cy="launch-workflow"
                onClick={() => void handleLaunchWorkflow()}
                icon={<RocketIcon />}
              >
                {t('Launch workflow')}
              </DropdownItem>
              <Divider />
              <DropdownItem
                data-cy="remove-all-nodes"
                onClick={() => handleRemoveAllNodes(nodes)}
                isDanger
                icon={<MinusCircleIcon />}
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
        <Button
          data-cy="workflow-visualizer-toolbar-expand-collapse"
          variant="plain"
          aria-label={isExpanded ? t('Collapse') : t('Expand')}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <CompressAltIcon
              data-cy="workflow-visualizer-toolbar-collapse"
              aria-label={t('Collapse')}
            />
          ) : (
            <ExpandAltIcon data-cy="workflow-visualizer-toolbar-expand" aria-label={t('Expand')} />
          )}
        </Button>

        <Button
          data-cy="workflow-visualizer-toolbar-close"
          variant="plain"
          icon={<CloseIcon />}
          aria-label={t('Close')}
          onClick={handleCancel}
        />
      </ToolbarGroup>
    </>
  );
}
