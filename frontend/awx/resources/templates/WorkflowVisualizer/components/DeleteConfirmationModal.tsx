import { Button, Modal, ModalVariant } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useTranslation } from 'react-i18next';
import { WorkflowVisualizerDispatch, WorkflowVisualizerState } from '../types';
import { stringIsUUID, toTitleCase } from '../../../../common/util/strings';
import { WorkflowJobTemplate } from '../../../../interfaces/WorkflowJobTemplate';

export function DeleteConfirmationModal(props: {
  state: WorkflowVisualizerState;
  dispatch: WorkflowVisualizerDispatch;
  workflowJobTemplate: WorkflowJobTemplate;
}) {
  const { state, dispatch, workflowJobTemplate } = props;
  const { t } = useTranslation();

  const cancelDeleteAction = () =>
    dispatch({
      type: 'CANCEL_ACTION',
      value: {
        ...state,
        showDeleteNodesModal: false,
        selectedNode: [],
        mode: undefined,
      },
    });
  return (
    <Modal
      data-cy="workflow-delete-nodes-modal"
      titleIconVariant={'warning'}
      variant={ModalVariant.medium}
      title={
        state.selectedNode.length > 1
          ? t('Are you sure you want to delete these nodes?')
          : t('Are you sure you want to delete this node?')
      }
      isOpen={state.showDeleteNodesModal}
      onClose={cancelDeleteAction}
      actions={[
        <Button
          data-cy="workflow-delete-nodes-modal-confirm"
          key="confirm"
          variant="primary"
          onClick={() => {
            if (!state.selectedNode.length === undefined) return;
            dispatch({
              type: 'SET_NODES_TO_DELETE',
              value: state.selectedNode,
            });
          }}
        >
          {t('Confirm')}
        </Button>,
        <Button
          key="cancel"
          data-cy="workflow-delete-nodes-modal-cancel"
          variant="plain"
          onClick={cancelDeleteAction}
        >
          {t('Cancel')}
        </Button>,
      ]}
    >
      {
        <Table aria-label="Simple table" variant="compact">
          <Thead>
            <Tr>
              <Th>{t('Name')}</Th>
              <Th>{t('Node Type')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {state.selectedNode.map((node) => {
              if (node === undefined) return null;
              const nodeName = !stringIsUUID(node.identifier)
                ? node.identifier
                : node.summary_fields.unified_job_template.name;
              const nodeType = toTitleCase(
                node.summary_fields.unified_job_template.unified_job_type
              );
              return (
                <Tr data-cy={`table-row-${nodeName}`} key={workflowJobTemplate?.name}>
                  <Td dataLabel={nodeName}>{nodeName}</Td>
                  <Td dataLabel={nodeType}>{nodeType}</Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      }
    </Modal>
  );
}
