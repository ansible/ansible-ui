import { useCallback } from 'react';
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
  MenuToggle,
  Title,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { usePageNavigate } from '../../../../../../framework';
import { AwxRoute } from '../../../../AwxRoutes';
import { postRequest } from '../../../../../common/crud/Data';
import { AddNodeButton } from '../components/AddNodeButton';
import getDocsBaseUrl from '../../../../common/util/getDocsBaseUrl';
import { useAwxConfig } from '../../../../common/useAwxConfig';
import { WorkflowVisualizerDispatch, WorkflowVisualizerState } from '../types';
import { WorkflowJobTemplate } from '../../../../interfaces/WorkflowJobTemplate';

export function useWorkflowVisualizerToolbarActions(
  state: WorkflowVisualizerState,
  dispatch: WorkflowVisualizerDispatch,
  workflowJobTemplate: WorkflowJobTemplate | undefined
) {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const config = useAwxConfig();
  const handleLaunchWorkflow = useCallback(async () => {
    await postRequest(`/api/v2/workflow_job_templates/${Number(params.id).toString()}/launch/`, {});
  }, [params.id]);

  const handleRemoveAllNodes = useCallback(() => {
    dispatch({
      type: 'TOGGLE_CONFIRM_DELETE_MODAL',
      value: state.nodes,
    });
  }, [dispatch, state.nodes]);

  const handleCancel = useCallback(() => {
    pageNavigate(AwxRoute.WorkflowJobTemplateDetails, { params: { id: params.id } });
  }, [pageNavigate, params.id]);
  const handleToggleToolbarKebab = () => dispatch({ type: 'SET_TOOLBAR_KEBAB_OPEN' });
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
          <Button
            icon={<CheckCircleIcon />}
            label={t('Save')}
            variant={state.unsavedChanges ? 'primary' : 'secondary'}
            onClick={() => {}}
          >
            {t('Save')}
          </Button>
        </ToolbarItem>
        <ToolbarItem>
          <AddNodeButton />
        </ToolbarItem>
        <ToolbarItem>
          <Dropdown
            onOpenChange={handleToggleToolbarKebab}
            onSelect={handleToggleToolbarKebab}
            isOpen={state.isToolbarKebabOpen}
            toggle={(toggleRef) => (
              <MenuToggle
                ref={toggleRef}
                className="toggle-kebab"
                onClick={handleToggleToolbarKebab}
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
                onClick={handleRemoveAllNodes}
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
            {t('Total nodes')} <Badge isRead>{state.nodes?.length || 0}</Badge>
          </div>
        </ToolbarItem>
        <Button
          data-cy="workflow-visualizer-toolbar-expand-collapse"
          variant="plain"
          aria-label={state.isVisualizerExpanded ? t('Collapse') : t('Expand')}
          onClick={() => dispatch({ type: 'SET_TOGGLE_VISUALIZER' })}
        >
          {state.isVisualizerExpanded ? (
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
