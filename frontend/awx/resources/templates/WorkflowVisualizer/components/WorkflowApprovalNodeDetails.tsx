import { useTranslation } from 'react-i18next';
import { PageDetail, PageDetails } from '../../../../../../framework';
import { WorkflowNode } from '../../../../interfaces/WorkflowNode';

function formatTimeout(
  timeout: number | undefined,
  t: (s: string, v?: { minutes: string; seconds: string }) => string
) {
  if (timeout === undefined) return;
  const minutes = Math.floor(timeout / 60);
  const seconds = timeout - Math.floor(timeout / 60) * 60;
  return t('{{minutes}} min {{seconds}} sec ', {
    minutes: minutes.toString(),
    seconds: seconds.toString(),
  });
}
export function WorkflowApprovalNodeDetails(props: {
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
      <PageDetail label={t('Type')}>{t('Workflow approval')}</PageDetail>
      <PageDetail label={t('Convergence')}>
        {selectedNode.all_parents_must_converge ? t('All') : t('Any')}
      </PageDetail>
      <PageDetail
        isEmpty={!selectedNode.summary_fields?.unified_job_template?.timeout}
        label={t('Timeout')}
      >
        {formatTimeout(selectedNode.summary_fields?.unified_job_template?.timeout, t)}
      </PageDetail>
    </PageDetails>
  );
}
