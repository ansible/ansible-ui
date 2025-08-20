import { useParams } from 'react-router-dom';
import { awxAPI } from '../../../common/api/awx-utils';
import { TemplatesList } from '../../../resources/templates/TemplatesList';

export function ExecutionEnvironmentTemplates() {
  const { id = '' } = useParams<{ id: string }>();
  return <TemplatesList url={awxAPI`/unified_job_templates/`} executionEnvironmentId={id} />;
}
