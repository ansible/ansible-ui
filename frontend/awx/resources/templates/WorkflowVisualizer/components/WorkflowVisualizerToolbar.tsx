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
  Modal,
  Title,
  ToolbarItem,
} from '@patternfly/react-core';
import { useVisualizationController, observer } from '@patternfly/react-topology';
import { usePageNavigate } from '../../../../../../framework';
import { AwxRoute } from '../../../../AwxRoutes';
import { postRequest } from '../../../../../common/crud/Data';
import { AddNodeButton } from './AddNodeButton';
import getDocsBaseUrl from '../../../../common/util/getDocsBaseUrl';
import { useAwxConfig } from '../../../../common/useAwxConfig';
import { useRemoveAllNodes } from '../hooks/useRemoveAllNodes';
import { useViewOptions } from '../ViewOptionsProvider';
import type { WorkflowJobTemplate } from '../../../../interfaces/WorkflowJobTemplate';
import type { GraphNode } from '../types';

export function ToolbarHeader(props: { handleSave: () => void }) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const { isFullScreen } = useViewOptions();
  const { modified, workflowTemplate } = useVisualizationController().getState<{
    modified: boolean;
    workflowTemplate: WorkflowJobTemplate;
  }>();
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState<boolean>(false);
  const handleCancel = useCallback(() => {
    if (modified) {
      setShowUnsavedChangesModal(true);
      return;
    }
    pageNavigate(AwxRoute.WorkflowJobTemplateDetails, {
      params: { id: workflowTemplate?.id },
    });
  }, [pageNavigate, workflowTemplate?.id, modified]);

  return (
    <>
      <ToolbarItem align={{ default: 'alignLeft' }}>
        <Title headingLevel="h1">
          <Flex>
            <FlexItem data-cy="wf-vzr-title">{t('Workflow Visualizer')}</FlexItem>
            <Divider
              orientation={{
                default: 'vertical',
              }}
            />
            <FlexItem data-cy="wf-vzr-name">{workflowTemplate?.name}</FlexItem>
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
      <Modal
        title={t('Warning: Unsaved changes')}
        data-cy="visualizer-unsaved-changes-modal"
        titleIconVariant="warning"
        isOpen={showUnsavedChangesModal}
        variant="small"
        onClose={() => setShowUnsavedChangesModal(false)}
        actions={[
          <Button
            key="save-and-exit"
            data-cy="save-and-exit"
            variant="primary"
            onClick={() => props.handleSave()}
          >
            {t('Save and exit')}
          </Button>,
          <Button
            key="exit-without-saving"
            data-cy="exit-without-saving"
            variant="danger"
            onClick={() => {
              pageNavigate(AwxRoute.WorkflowJobTemplateDetails, {
                params: { id: workflowTemplate?.id },
              });
            }}
          >
            {t('Exit without saving')}
          </Button>,
        ]}
      >
        {t(`You have unsaved changes. Are you sure you want to leave this page?`)}
      </Modal>
    </>
  );
}

function WorkflowVisualizerToolbar(props: { handleSave: () => void }) {
  const { t } = useTranslation();
  const config = useAwxConfig();
  const [isKebabOpen, setIsKebabOpen] = useState<boolean>(false);
  const { isFullScreen, toggleFullScreen } = useViewOptions();

  const controller = useVisualizationController();
  const nodes = controller.getGraph().getNodes() as GraphNode[];
  const { workflowTemplate } = controller.getState<{ workflowTemplate: WorkflowJobTemplate }>();
  const isReadOnly = !workflowTemplate?.summary_fields?.user_capabilities?.edit;
  const isLaunchable = workflowTemplate?.summary_fields?.user_capabilities?.start;

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
      {isFullScreen && <ToolbarHeader handleSave={props.handleSave} />}
      {!isReadOnly && (
        <>
          <ToolbarItem>
            <Button
              data-cy="workflow-visualizer-toolbar-save"
              icon={<CheckCircleIcon />}
              label={t('Save')}
              onClick={() => {
                props.handleSave();
              }}
            >
              {t('Save')}
            </Button>
          </ToolbarItem>
          <ToolbarItem>
            <AddNodeButton />
          </ToolbarItem>
        </>
      )}
      <ToolbarItem data-cy="workflow-visualizer-toolbar-kebab">
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
            {isLaunchable && (
              <DropdownItem
                data-cy="workflow-visualizer-toolbar-launch"
                onClick={() => void handleLaunchWorkflow()}
                icon={<RocketIcon />}
              >
                {t('Launch workflow')}
              </DropdownItem>
            )}
            {!isReadOnly && (
              <>
                <Divider />
                <DropdownItem
                  data-cy="workflow-visualizer-toolbar-remove-all"
                  onClick={() => removeAllNodes(nodes)}
                  isDanger
                  icon={<MinusCircleIcon />}
                >
                  {t('Remove all nodes')}
                </DropdownItem>
              </>
            )}
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
