import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import {
  Badge,
  Button,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  Icon,
  MenuToggle,
  Title,
  ToolbarItem,
} from '@patternfly/react-core';
import {
  useVisualizationState,
  useVisualizationController,
  isNode,
  observer,
} from '@patternfly/react-topology';
import { usePageNavigate } from '../../../../../../framework';
import { AwxRoute } from '../../../../AwxRoutes';
import { postRequest } from '../../../../../common/crud/Data';
import { AddNodeButton } from './AddNodeButton';
import getDocsBaseUrl from '../../../../common/util/getDocsBaseUrl';
import { useAwxConfig } from '../../../../common/useAwxConfig';
import type { WorkflowJobTemplate } from '../../../../interfaces/WorkflowJobTemplate';
import { useRemoveAllNodes } from '../hooks/useRemoveAllNodes';
import { useViewOptions } from '../ViewOptionsProvider';

export function ToolbarHeader() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const { isFullScreen } = useViewOptions();
  const [workflowTemplate] = useVisualizationState<WorkflowJobTemplate>('workflowTemplate');

  const handleCancel = useCallback(() => {
    pageNavigate(AwxRoute.WorkflowJobTemplateDetails, { params: { id: workflowTemplate?.id } });
  }, [pageNavigate, workflowTemplate?.id]);

  return (
    <>
      <ToolbarItem align={{ default: 'alignLeft' }}>
        <Title headingLevel="h1">
          <Flex>
            <FlexItem>{t('Workflow Visualizer')}</FlexItem>
            <Divider
              orientation={{
                default: 'vertical',
              }}
            />
            <FlexItem>{workflowTemplate?.name}</FlexItem>
          </Flex>
        </Title>
      </ToolbarItem>
      <ToolbarItem
        align={{ default: 'alignRight' }}
        visibility={{ default: isFullScreen ? 'hidden' : 'visible' }}
      >
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

function WorkflowVisualizerToolbar() {
  const { t } = useTranslation();
  const config = useAwxConfig();
  const [isKebabOpen, setIsKebabOpen] = useState<boolean>(false);
  const { isFullScreen, toggleFullScreen } = useViewOptions();
  const [workflowTemplate] = useVisualizationState<WorkflowJobTemplate>('workflowTemplate');

  const controller = useVisualizationController();
  const nodes = controller.getElements().filter(isNode);

  const removeAllNodes = useRemoveAllNodes();

  const handleLaunchWorkflow = useCallback(async () => {
    if (!workflowTemplate?.id) return;
    await postRequest(
      `/api/v2/workflow_job_templates/${workflowTemplate.id.toString()}/launch/`,
      {}
    );
  }, [workflowTemplate?.id]);

  return (
    <>
      {isFullScreen && <ToolbarHeader />}
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
              onClick={() => removeAllNodes(nodes)}
              isDanger
              icon={<MinusCircleIcon />}
            >
              {t('Remove all nodes')}
            </DropdownItem>
          </DropdownList>
        </Dropdown>
      </ToolbarItem>
      <ToolbarItem style={{ alignSelf: 'center' }}>
        <div data-cy="workflow-visualizer-toolbar-total-nodes">
          {t('Total nodes')} <Badge isRead>{nodes.length || 0}</Badge>
        </div>
      </ToolbarItem>
      <ToolbarItem align={{ default: 'alignRight' }}>
        <Button
          data-cy="workflow-visualizer-toolbar-expand-collapse"
          variant="plain"
          aria-label={isFullScreen ? t('Collapse') : t('Expand')}
          onClick={toggleFullScreen}
          icon={
            <Icon size="lg">
              {isFullScreen ? (
                <CompressAltIcon
                  data-cy="workflow-visualizer-toolbar-collapse"
                  aria-label={t('Collapse')}
                />
              ) : (
                <ExpandAltIcon
                  data-cy="workflow-visualizer-toolbar-expand"
                  aria-label={t('Expand')}
                />
              )}
            </Icon>
          }
        />
      </ToolbarItem>
    </>
  );
}

export default observer(WorkflowVisualizerToolbar);
