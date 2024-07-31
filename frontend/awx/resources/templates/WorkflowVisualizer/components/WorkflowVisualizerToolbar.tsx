import React, { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
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
import { observer, useVisualizationController } from '@patternfly/react-topology';
import { usePageNavigate, usePageAlertToaster } from '../../../../../../framework';
import { AwxRoute } from '../../../../main/AwxRoutes';
import { awxErrorAdapter } from '../../../../common/adapters/awxErrorAdapter';
import { getDocsBaseUrl } from '../../../../common/util/getDocsBaseUrl';
import { useAwxConfig } from '../../../../common/useAwxConfig';
import { useViewOptions } from '../ViewOptionsProvider';
import { AddNodeButton } from './AddNodeButton';
import { useRemoveGraphElements, useSaveVisualizer } from '../hooks';
import type { ControllerState, GraphNode } from '../types';
import { START_NODE_ID } from '../constants';
import { useLaunchTemplate } from '../../hooks/useLaunchTemplate';

export const ToolbarHeader = observer(() => {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const alertToaster = usePageAlertToaster();
  const { id: templateId } = useParams<{ id: string }>();
  const controller = useVisualizationController();
  const { workflowTemplate } = controller.getState<ControllerState>();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState<boolean>(false);

  const { isFullScreen } = useViewOptions();
  const handleSave = useSaveVisualizer(templateId || '');

  const isModified = controller
    .getElements()
    .some((element) => element.getState<ControllerState>().modified);

  const handleCancel = useCallback(() => {
    if (isModified) {
      setShowUnsavedChangesModal(true);
      return;
    }
    pageNavigate(AwxRoute.WorkflowJobTemplateDetails, {
      params: { id: templateId },
    });
  }, [pageNavigate, templateId, isModified]);

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
            isLoading={isSubmitting}
            onClick={() => {
              async function saveWorkflowVisualizer() {
                setIsSubmitting(true);
                try {
                  await handleSave();
                  alertToaster.addAlert({
                    variant: 'success',
                    title: t('Successfully saved workflow visualizer'),
                    timeout: 5000,
                  });
                } catch (error) {
                  const { genericErrors, fieldErrors } = awxErrorAdapter(error);
                  alertToaster.addAlert({
                    variant: 'danger',
                    title: t('Failed to save workflow job template'),
                    children: (
                      <>
                        {genericErrors?.map((err) => err.message)}
                        {fieldErrors?.map((err) => err.message)}
                      </>
                    ),
                  });
                }
                setIsSubmitting(false);
                setShowUnsavedChangesModal(false);
              }
              void saveWorkflowVisualizer();
            }}
          >
            {t('Save and exit')}
          </Button>,
          <Button
            key="exit-without-saving"
            data-cy="exit-without-saving"
            variant="danger"
            onClick={() => {
              pageNavigate(AwxRoute.WorkflowJobTemplateDetails, {
                params: { id: templateId },
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
});

export const WorkflowVisualizerToolbar = observer(() => {
  const { t } = useTranslation();
  const config = useAwxConfig();
  const alertToaster = usePageAlertToaster();
  const { id: templateId } = useParams();
  const controller = useVisualizationController();
  const { workflowTemplate, RBAC, modified } = controller.getState<ControllerState>();

  const [isKebabOpen, setIsKebabOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { isFullScreen, toggleFullScreen } = useViewOptions();
  const { removeNodes } = useRemoveGraphElements();
  const handleSave = useSaveVisualizer(templateId || '');
  const launch = useLaunchTemplate();

  const nodes = controller
    .getGraph()
    .getNodes()
    .filter((n) => n.isVisible() && n.getId() !== START_NODE_ID) as GraphNode[];

  const handleLaunchWorkflow = useCallback(async () => {
    await launch(workflowTemplate);
  }, [launch, workflowTemplate]);

  return (
    <>
      {isFullScreen && <ToolbarHeader />}
      {RBAC?.edit && (
        <>
          <ToolbarItem>
            <Button
              data-cy="workflow-visualizer-toolbar-save"
              icon={<CheckCircleIcon />}
              label={t('Save')}
              isDisabled={!modified}
              isLoading={isSubmitting}
              onClick={() => {
                async function saveWorkflowVisualizer() {
                  setIsSubmitting(true);
                  try {
                    await handleSave();
                    alertToaster.addAlert({
                      variant: 'success',
                      title: t('Successfully saved workflow visualizer'),
                      timeout: 5000,
                    });
                  } catch (error) {
                    const { genericErrors, fieldErrors } = awxErrorAdapter(error);
                    alertToaster.addAlert({
                      variant: 'danger',
                      title: t('Failed to save workflow job template'),
                      children: (
                        <>
                          {genericErrors?.map((err) => err.message)}
                          {fieldErrors?.map((err) => err.message)}
                        </>
                      ),
                    });
                  }
                  setIsSubmitting(false);
                }
                void saveWorkflowVisualizer();
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
              to={getDocsBaseUrl(config, 'workflowVisualizer')}
              target="_blank"
            >
              {t('Documentation')}
            </DropdownItem>
            {RBAC?.start && (
              <DropdownItem
                tooltipProps={
                  modified || nodes.length === 0
                    ? {
                        content: modified
                          ? t('Save the workflow before launching')
                          : t('Add a step to the workflow before launching'),
                      }
                    : undefined
                }
                isAriaDisabled={nodes.length === 0 || modified}
                data-cy="workflow-visualizer-toolbar-launch"
                onClick={() => void handleLaunchWorkflow()}
                icon={<RocketIcon />}
              >
                {t('Launch workflow')}
              </DropdownItem>
            )}
            {RBAC?.edit && (
              <>
                <Divider />
                <DropdownItem
                  isAriaDisabled={nodes.length === 0}
                  tooltipProps={
                    nodes.length === 0
                      ? { content: t('Add a step to the workflow before removing') }
                      : undefined
                  }
                  data-cy="workflow-visualizer-toolbar-remove-all"
                  onClick={() => removeNodes(nodes)}
                  isDanger
                  icon={<MinusCircleIcon />}
                >
                  {t('Remove all steps')}
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
});
