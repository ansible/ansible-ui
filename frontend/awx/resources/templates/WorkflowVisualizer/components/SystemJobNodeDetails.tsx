import { useTranslation } from 'react-i18next';
import { DateTimeCell, PageDetail, PageDetails } from '../../../../../../framework';
import { PageDetailCodeEditor } from '../../../../../../framework/PageDetails/PageDetailCodeEditor';
import { WorkflowNode } from '../../../../interfaces/WorkflowNode';

export function SystemJobNodeDetails(props: {
  selectedNode: WorkflowNode;
  disableScroll?: boolean;
}) {
  const { t } = useTranslation();
  const { selectedNode } = props;
  return (
    <PageDetails disableScroll={props.disableScroll}>
      <PageDetail label={t('Name')}>
        {selectedNode.identifier ?? selectedNode.summary_fields?.unified_job_template?.name}
      </PageDetail>
      <PageDetail
        isEmpty={!selectedNode.summary_fields?.unified_job_template?.description}
        label={t('Description')}
      >
        {selectedNode.summary_fields?.unified_job_template?.description}
      </PageDetail>
      <PageDetail label={t('Type')}>{t('System job template')}</PageDetail>
      <PageDetail label={t('Convergence')}>
        {selectedNode.all_parents_must_converge ? t('All') : t('Any')}
      </PageDetail>
      <PageDetail label={t('Created')}>
        <DateTimeCell value={selectedNode.created} />
      </PageDetail>
      <PageDetail label={t('Modified')}>
        <DateTimeCell value={selectedNode.modified} />
      </PageDetail>
      <PageDetailCodeEditor
        label={t('Variables')}
        showCopyToClipboard
        data-cy="workflow-node-detail-variables"
        value={JSON.stringify(selectedNode.extra_data) || '---'}
      />
    </PageDetails>
  );
}
